import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import type { IUserRepository } from '@domain/users/repositories/user.repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@domain/users/entities/user.entity';
import { hashPassword } from '@shared/utils/hash.util';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await hashPassword(dto.password);
    try {
      return await this.userRepo.create({ ...dto, password: hashedPassword });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        const errorCode = (error as any)?.code;

        if (
          errorCode === '23505' ||
          errorMessage.includes('duplicate') ||
          errorMessage.includes('unique')
        ) {
          if (errorMessage.includes('email')) {
            throw new ConflictException('Email already exists');
          }
          throw new ConflictException('A user with this information already exists');
        }
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const result = await this.userRepo.findAll(page, limit);
    return {
      ...result,
      page,
      limit,
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User | null> {
    const updateData = dto.password ? { ...dto, password: await hashPassword(dto.password) } : dto;
    return this.userRepo.update(id, updateData);
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.delete(id);
  }
}

export default UsersService;
