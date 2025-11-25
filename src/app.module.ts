import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import appConfig from '@config/app.config';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [
    // ✅ Global configuration loader (.env)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),

    // ✅ Database configuration
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.get<{
          host: string;
          port: number;
          username: string;
          password: string;
          name: string;
        }>('app.database');
        if (!db) {
          throw new Error('Database configuration is missing');
        }
        // in case of postgres, use the following configuration
        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.name,
          autoLoadEntities: true,
          synchronize: true, // ⚠️ turn off in production
          logging: true,
        };

        // in case of mongodb, use the following configuration
        /* return {
          type: 'mongodb',
          url: `mongodb://${db.host}:${db.port}`,
          database: db.name,
          useUnifiedTopology: true,
          entities: [User],
          synchronize: true,
        }; */
      },
    }),

    // ✅ Domain modules
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
