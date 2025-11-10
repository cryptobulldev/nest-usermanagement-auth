import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtRefreshGuard } from './jwt/jwt-refresh.guard';

interface RefreshTokenRequest extends Request {
  user: {
    userId: number;
    email: string;
  };
  body: {
    refreshToken: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: { email: string; password: string; name: string }) {
    return this.authService.register(dto.email, dto.password, dto.name);
  }

  @Post('login')
  login(@Body() dto: { email: string; password: string }) {
    return this.authService.login(dto.email, dto.password);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(@Req() req: RefreshTokenRequest) {
    const user = req.user;
    return this.authService.refresh(user.userId, req.body.refreshToken);
  }
}
