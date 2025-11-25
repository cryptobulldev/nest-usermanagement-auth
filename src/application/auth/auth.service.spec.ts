import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { UsersService } from '@application/users/users.service';
import { User } from '@domain/users/entities/user.entity';
import { comparePassword, hashToken } from '@shared/utils/hash.util';
import { RefreshToken } from '@domain/auth/entities/refresh-token.entity';

// ✅ Mock the hashing utilities
jest.mock('@shared/utils/hash.util', () => {
  const actual = jest.requireActual('@shared/utils/hash.util');
  return {
    ...actual,
    comparePassword: jest.fn(),
  };
});

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let refreshTokenRepo: jest.Mocked<{
    delete: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
  }>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    refreshTokens: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'app.jwtSecret':
                  return 'secret';
                case 'app.jwtRefreshSecret':
                  return 'refresh_secret';
                case 'app.jwtAccessTtl':
                  return '15m';
                case 'app.jwtRefreshTtl':
                  return '7d';
                default:
                  return undefined;
              }
            }),
          },
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            delete: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    refreshTokenRepo = module.get(getRepositoryToken(RefreshToken));
    refreshTokenRepo.create.mockImplementation((dto) => dto);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------
  // REGISTER
  // ---------------------------
  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      const email = 'newuser@example.com';
      const password = 'password123';
      const name = 'New User';

      usersService.create.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValueOnce('accessToken').mockReturnValueOnce('refreshToken');
      refreshTokenRepo.delete.mockResolvedValue(undefined);

      const result = await service.register(email, password, name);

      expect(usersService.create).toHaveBeenCalledWith({
        email,
        password,
        name,
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(refreshTokenRepo.delete).toHaveBeenCalledWith({ userId: mockUser.id });
      expect(refreshTokenRepo.save).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });

    it('should surface conflict errors from user creation', async () => {
      const email = 'existing@example.com';
      const password = 'password123';
      const name = 'Existing User';

      usersService.create.mockRejectedValue(new ConflictException('Email already registered'));

      await expect(service.register(email, password, name)).rejects.toThrow(ConflictException);
      await expect(service.register(email, password, name)).rejects.toThrow(
        'Email already registered',
      );
    });
  });

  // ---------------------------
  // LOGIN
  // ---------------------------
  describe('login', () => {
    it('should login user with valid credentials and return tokens', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      usersService.findByEmail.mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValueOnce('accessToken').mockReturnValueOnce('refreshToken');
      refreshTokenRepo.delete.mockResolvedValue(undefined);

      const result = await service.login(email, password);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(comparePassword).toHaveBeenCalledWith(password, mockUser.password);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(refreshTokenRepo.delete).toHaveBeenCalledWith({ userId: mockUser.id });
      expect(refreshTokenRepo.save).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(email, password)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(email, password)).rejects.toThrow('Invalid credentials');
      expect(comparePassword).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';

      usersService.findByEmail.mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(service.login(email, password)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(email, password)).rejects.toThrow('Invalid credentials');
      expect(comparePassword).toHaveBeenCalledWith(password, mockUser.password);
    });
  });

  // ---------------------------
  // REFRESH
  // ---------------------------
  describe('refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const refreshToken = 'refreshToken123';

      usersService.findById.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValueOnce('newAccessToken').mockReturnValueOnce('newRefreshToken');
      const hashedToken = hashToken(refreshToken);
      refreshTokenRepo.findOne.mockResolvedValue({
        id: 'token-id',
        userId,
        tokenHash: hashedToken,
        expiresAt: new Date(Date.now() + 1000),
        revoked: false,
      });

      const result = await service.refresh(userId, refreshToken);

      expect(refreshTokenRepo.findOne).toHaveBeenCalled();
      expect(usersService.findById).toHaveBeenCalledWith(userId);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(refreshTokenRepo.delete).toHaveBeenCalledWith('token-id');
      expect(result).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const invalidToken = 'invalidToken';

      usersService.findById.mockResolvedValue(mockUser);
      refreshTokenRepo.findOne.mockResolvedValue(null);

      await expect(service.refresh(userId, invalidToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.refresh(userId, invalidToken)).rejects.toThrow('Invalid refresh token');
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
