import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard'; // will exist soon

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  //@UseGuards(JwtAuthGuard)
  @Get(':id')
  async get(@Param('id') id: number) {
    return this.usersService.findById(id);
  }

  //@UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}
