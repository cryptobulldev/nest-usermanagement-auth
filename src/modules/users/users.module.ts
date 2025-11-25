import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@domain/users/entities/user.entity';
import { UsersService } from '@application/users/users.service';
import { UsersController } from './users.controller';
import { UserRepository } from '@infrastructure/database/repositories/users/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, { provide: 'IUserRepository', useClass: UserRepository }],
  exports: [UsersService],
})
export class UsersModule {}
