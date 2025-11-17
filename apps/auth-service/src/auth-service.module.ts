import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, JwtStrategy } from '@app/shared'; // This import now works

import { AuthServiceController } from './auth-service.controller';
import { AuthService } from './auth-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/auth-service/.env', // Load .env file
    }),
    
    // Connect to PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: '127.0.0.1', // Use 127.0.0.1 for Windows IPv4
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USER'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        entities: [User], // Load the User entity explicitly
        autoLoadEntities: false, // Do not use autoLoadEntities
        synchronize: false, // We use migrations
      }),
    }),
    
    // Import the User entity repository
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
  providers: [AuthService, JwtStrategy], // Provide JwtStrategy
})
export class AuthServiceModule {}