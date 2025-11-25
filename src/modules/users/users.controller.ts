import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { UsersService } from '@application/users/users.service';
import { CreateUserDto } from '@application/users/dto/create-user.dto';
import { UpdateUserDto } from '@application/users/dto/update-user.dto';
// import { JwtAuthGuard } from '@modules/auth/jwt/jwt-auth.guard'; // will exist soon

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  //@UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.usersService.findAll(pageNum, limitNum);
  }

  //@UseGuards(JwtAuthGuard)
  @Get(':id')
  async get(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  //@UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  //@UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.usersService.delete(id);
    return { message: 'User deleted successfully' };
  }
}
