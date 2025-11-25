import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '@application/auth/auth.service';
import { RegisterDto } from '@application/auth/dto/register.dto';
import { LoginDto } from '@application/auth/dto/login.dto';
import { RefreshTokenDto } from '@application/auth/dto/refresh-token.dto';
import { JwtRefreshGuard } from './jwt/jwt-refresh.guard';

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    email: string;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.name);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(@Req() req: AuthenticatedRequest, @Body() body: RefreshTokenDto) {
    const user = req.user;
    return this.authService.refresh(user.userId, body.refreshToken);
  }
}
