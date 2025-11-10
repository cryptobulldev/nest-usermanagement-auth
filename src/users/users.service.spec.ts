import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { IUserRepository } from './repositories/user.repository.interface';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<IUserRepository>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    refreshToken: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'IUserRepository',
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            saveRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get('IUserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const createDto: CreateUserDto = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
      };

      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      repository.create.mockResolvedValue({
        ...mockUser,
        ...createDto,
        password: hashedPassword,
      });

      const result = await service.create(createDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 10);
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        password: hashedPassword,
      });
      expect(result.password).toBe(hashedPassword);
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const email = 'test@example.com';
      repository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(repository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const email = 'nonexistent@example.com';
      repository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(repository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const id = 1;
      repository.findById.mockResolvedValue(mockUser);

      const result = await service.findById(id);

      expect(repository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const id = 999;
      repository.findById.mockResolvedValue(null);

      await expect(service.findById(id)).rejects.toThrow(NotFoundException);
      await expect(service.findById(id)).rejects.toThrow('User not found');
      expect(repository.findById).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update user without password', async () => {
      const id = 1;
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      repository.update.mockResolvedValue({
        ...mockUser,
        ...updateDto,
      });

      const result = await service.update(id, updateDto);

      expect(repository.update).toHaveBeenCalledWith(id, updateDto);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(result).toEqual({
        ...mockUser,
        ...updateDto,
      });
    });

    it('should update user with new hashed password', async () => {
      const id = 1;
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
        password: 'newPassword123',
      };

      const hashedPassword = 'newHashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      repository.update.mockResolvedValue({
        ...mockUser,
        name: updateDto.name!,
        password: hashedPassword,
      });

      const result = await service.update(id, updateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(updateDto.password, 10);
      expect(repository.update).toHaveBeenCalledWith(id, {
        ...updateDto,
        password: hashedPassword,
      });
      expect(result?.password).toBe(hashedPassword);
    });
  });

  describe('setRefreshToken', () => {
    it('should save refresh token for user', async () => {
      const id = 1;
      const token = 'refreshToken123';

      repository.saveRefreshToken.mockResolvedValue(undefined);

      await service.setRefreshToken(id, token);

      expect(repository.saveRefreshToken).toHaveBeenCalledWith(id, token);
    });
  });
});
