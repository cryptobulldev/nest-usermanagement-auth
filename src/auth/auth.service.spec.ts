import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { hashPassword, comparePassword } from '../common/utils/hash.util';

// ✅ Mock the hashing utilities
jest.mock('../common/utils/hash.util', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    refreshToken: 'refreshToken123',
    createdAt: new Date(),
    updatedAt: new Date(),
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
            setRefreshToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
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

      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValueOnce('accessToken').mockReturnValueOnce('refreshToken');
      usersService.setRefreshToken.mockResolvedValue(undefined);

      const result = await service.register(email, password, name);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(hashPassword).toHaveBeenCalledWith(password);
      expect(usersService.create).toHaveBeenCalledWith({
        email,
        password: 'hashedPassword',
        name,
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(usersService.setRefreshToken).toHaveBeenCalledWith(mockUser.id, 'refreshToken');
      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });

    it('should throw UnauthorizedException if email already exists', async () => {
      const email = 'existing@example.com';
      const password = 'password123';
      const name = 'Existing User';

      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(email, password, name)).rejects.toThrow(UnauthorizedException);
      await expect(service.register(email, password, name)).rejects.toThrow(
        'Email already registered',
      );
      expect(usersService.create).not.toHaveBeenCalled();
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
      usersService.setRefreshToken.mockResolvedValue(undefined);

      const result = await service.login(email, password);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(comparePassword).toHaveBeenCalledWith(password, mockUser.password);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
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
      const userId = 1;
      const refreshToken = 'refreshToken123';

      usersService.findById.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValueOnce('newAccessToken').mockReturnValueOnce('newRefreshToken');
      usersService.setRefreshToken.mockResolvedValue(undefined);

      const result = await service.refresh(userId, refreshToken);

      expect(usersService.findById).toHaveBeenCalledWith(userId);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(usersService.setRefreshToken).toHaveBeenCalledWith(userId, 'newRefreshToken');
      expect(result).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const userId = 1;
      const invalidToken = 'invalidToken';

      usersService.findById.mockResolvedValue(mockUser);

      await expect(service.refresh(userId, invalidToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.refresh(userId, invalidToken)).rejects.toThrow('Invalid refresh token');
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
