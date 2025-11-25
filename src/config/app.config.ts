import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASS ?? 'postgres',
    name: process.env.DB_NAME ?? 'nestjs_solid_demo',
  },
  jwtSecret: process.env.JWT_SECRET ?? 'secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh_secret',
  jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
}));
