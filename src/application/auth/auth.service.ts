import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '@application/users/users.service';
import type { IAuthService } from './interfaces/auth-service.interface';
import { User } from '@domain/users/entities/user.entity';
import { comparePassword, hashToken } from '@shared/utils/hash.util';
import { RefreshToken } from '@domain/auth/entities/refresh-token.entity';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  private async signTokens(user: User) {
    const payload = { sub: user.id, email: user.email };
    const accessSecret = this.configService.get<string>('app.jwtSecret') ?? 'secret';
    const refreshSecret =
      this.configService.get<string>('app.jwtRefreshSecret') ?? 'refresh_secret';
    const accessTtl =
      (this.configService.get<string>('app.jwtAccessTtl') ?? '15m') as JwtSignOptions['expiresIn'];
    const refreshTtl =
      (this.configService.get<string>('app.jwtRefreshTtl') ?? '7d') as JwtSignOptions['expiresIn'];

    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: accessTtl,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshTtl,
    });

    await this.storeRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async register(email: string, password: string, name: string) {
    const user = await this.usersService.create({
      email,
      password,
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

  async refresh(userId: string, token: string) {
    const hashedToken = hashToken(token);
    const storedToken = await this.refreshTokenRepo.findOne({
      where: { userId, tokenHash: hashedToken, revoked: false },
    });

    if (!storedToken || storedToken.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokenRepo.delete(storedToken.id);

    const user = await this.usersService.findById(userId);

    return this.signTokens(user);
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.refreshTokenRepo.delete({ userId });

    const entity = this.refreshTokenRepo.create({
      userId,
      tokenHash,
      expiresAt,
      revoked: false,
    });

    await this.refreshTokenRepo.save(entity);
  }
}
