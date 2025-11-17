import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, JwtStrategy } from '@app/shared'; // Import User entity

import { AuthServiceController } from './auth-service.controller';
import { AuthService } from './auth-service.service';

@Module({
  imports: [
    // 1. Load the .env file for auth-service
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/auth-service/.env',
    }),
    
    // 2. Connect to the PostgreSQL database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USER'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        autoLoadEntities: true, // Auto-load our User entity
        synchronize: false, // We use migrations
      }),
    }),
    
    // 3. Import the User entity repository
    TypeOrmModule.forFeature([User]),
    
    // 4. Configure Passport and JWT
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d', // 1 day expiration
          audience: 'eatzy-app',
          issuer: 'eatzy-auth-service',
        },
      }),
    }),
  ],
  controllers: [AuthServiceController],
  // 5. Provide JwtStrategy for Passport
  providers: [AuthService, JwtStrategy], 
})
export class AuthServiceModule {}