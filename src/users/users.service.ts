import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from './repositories/user.repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {}
  async create(dto: CreateUserDto): Promise<User> {
    const hash = await bcrypt.hash(dto.password, 10);
    return this.userRepo.create({ ...dto, password: hash });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<User | null> {
    const updateData = dto.password
      ? { ...dto, password: await bcrypt.hash(dto.password, 10) }
      : dto;
    return this.userRepo.update(id, updateData);
  }

  async setRefreshToken(id: number, token: string): Promise<void> {
    await this.userRepo.saveRefreshToken(id, token);
  }
}
