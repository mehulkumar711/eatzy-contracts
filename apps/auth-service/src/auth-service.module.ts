import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/shared'; // Import User entity

import { AuthServiceController } from './auth-service.controller';
import { AuthService } from './auth-service.service';
import { JwtStrategy } from './jwt.strategy'; // Import the new local strategy

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/auth-service/.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: '127.0.0.1',
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USER'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        entities: [User], // Load the User entity
        autoLoadEntities: false,
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
          audience: 'eatzy-app',
          issuer: 'eatzy-auth-service',
        },
      }),
    }),
  ],
  controllers: [AuthServiceController],
  //
  // --- THE FIX (v1.50): Provide the local JwtStrategy ---
  //
  providers: [AuthService, JwtStrategy], 
})
export class AuthServiceModule {}