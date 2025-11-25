import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
import { User } from '@domain/users/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '@shared/utils/hash.util';

// ✅ Mock the hash utility
jest.mock('@shared/utils/hash.util', () => ({
  hashPassword: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<IUserRepository>;

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
        UsersService,
        {
          provide: 'IUserRepository',
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
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

  // ---------------------------
  // CREATE
  // ---------------------------
  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const createDto: CreateUserDto = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
      };

      const hashedPassword = 'hashedPassword123';
      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      repository.create.mockResolvedValue({
        ...mockUser,
        ...createDto,
        password: hashedPassword,
      });

      const result = await service.create(createDto);

      expect(hashPassword).toHaveBeenCalledWith(createDto.password);
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        password: hashedPassword,
      });
      expect(result.password).toBe(hashedPassword);
    });
  });

  // ---------------------------
  // FIND BY EMAIL
  // ---------------------------
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

  // ---------------------------
  // FIND BY ID
  // ---------------------------
  describe('findById', () => {
    it('should return user by id', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      repository.findById.mockResolvedValue(mockUser);

      const result = await service.findById(id);

      expect(repository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const id = '999e4567-e89b-12d3-a456-426614174999';
      repository.findById.mockResolvedValue(null);

      await expect(service.findById(id)).rejects.toThrow(NotFoundException);
      await expect(service.findById(id)).rejects.toThrow('User not found');
      expect(repository.findById).toHaveBeenCalledWith(id);
    });
  });

  // ---------------------------
  // UPDATE
  // ---------------------------
  describe('update', () => {
    it('should update user without password', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateUserDto = { name: 'Updated Name' };

      repository.update.mockResolvedValue({
        ...mockUser,
        ...updateDto,
      });

      const result = await service.update(id, updateDto);

      expect(repository.update).toHaveBeenCalledWith(id, updateDto);
      expect(hashPassword).not.toHaveBeenCalled();
      expect(result).toEqual({
        ...mockUser,
        ...updateDto,
      });
    });

    it('should update user with new hashed password', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
        password: 'newPassword123',
      };

      const hashedPassword = 'newHashedPassword';
      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      repository.update.mockResolvedValue({
        ...mockUser,
        name: updateDto.name!,
        password: hashedPassword,
      });

      const result = await service.update(id, updateDto);

      expect(hashPassword).toHaveBeenCalledWith(updateDto.password);
      expect(repository.update).toHaveBeenCalledWith(id, {
        ...updateDto,
        password: hashedPassword,
      });
      expect(result?.password).toBe(hashedPassword);
    });
  });
});
