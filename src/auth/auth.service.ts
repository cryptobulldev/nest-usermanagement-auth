import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import type { IAuthService } from './interfaces/auth-service.interface.ts';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async signTokens(user: User) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
    await this.usersService.setRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  async register(email: string, password: string, name: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new UnauthorizedException('Email already registered');
    const user = await this.usersService.create({ email, password, name });
    return this.signTokens(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.signTokens(user);
  }

  async refresh(userId: number, token: string) {
    const user = await this.usersService.findById(userId);
    if (user.refreshToken !== token)
      throw new UnauthorizedException('Invalid refresh token');
    return this.signTokens(user);
  }
}
