import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from './repositories/user.repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { hashPassword } from '../common/utils/hash.util';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {}

  /**
   * Create a new user with hashed password
   */
  async create(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await hashPassword(dto.password);
    return this.userRepo.create({ ...dto, password: hashedPassword });
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }

  /**
   * Find a user by ID, throw if not found
   */
  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Update user info, re-hash password if provided
   */
  async update(id: number, dto: UpdateUserDto): Promise<User | null> {
    const updateData = dto.password
      ? { ...dto, password: await hashPassword(dto.password) }
      : dto;
    return this.userRepo.update(id, updateData);
  }

  /**
   * Save refresh token for the user (for JWT refresh flow)
   */
  async setRefreshToken(id: number, token: string): Promise<void> {
    await this.userRepo.saveRefreshToken(id, token);
  }
}
