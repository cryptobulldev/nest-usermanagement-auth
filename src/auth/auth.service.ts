import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import type { IAuthService } from './interfaces/auth-service.interface';
import { User } from '../users/entities/user.entity';
import { hashPassword, comparePassword } from '../common/utils/hash.util';

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

    // ✅ Use shared hash util
    const hashedPassword = await hashPassword(password);
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
    });

    return this.signTokens(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // ✅ Use shared compare util
    const valid = await comparePassword(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.signTokens(user);
  }

  async refresh(userId: number, token: string) {
    const user = await this.usersService.findById(userId);

    if (user.refreshToken !== token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.signTokens(user);
  }
}
