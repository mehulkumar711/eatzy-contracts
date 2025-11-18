// apps/auth-service/src/auth-service.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
// Assuming shared library is correctly mapped
import { JwtPayload, User } from '@app/shared'; 
import { LoginDto } from './dto/login.dto';
import { AdminLoginDto } from './dto/admin-login.dto'; // NEW IMPORT

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // Existing Customer Login
  async validateUser(loginDto: LoginDto): Promise<User> {
    const { phone, pin } = loginDto;
    const user = await this.userRepository.findOne({ where: { phone } });
    if (user && (await bcrypt.compare(pin, user.pin_hash))) {
      if (!user.is_active) throw new UnauthorizedException('Inactive');
      return user;
    }
    throw new UnauthorizedException('Invalid customer credentials');
  }

  // NEW: Admin Login Logic
  async validateAdmin(dto: AdminLoginDto): Promise<User> {
    // Look up user by the new 'username' column
    const user = await this.userRepository.findOne({ where: { username: dto.username } });
    
    // 1. Check if user exists, 2. Check if role is 'admin', 3. Check password hash
    if (user && user.role === 'admin' && (await bcrypt.compare(dto.password, user.pin_hash))) {
      return user;
    }
    throw new UnauthorizedException('Invalid admin credentials');
  }

  async login(user: User): Promise<{ access_token: string }> {
    // Payload needs to be consistent for shared JwtAuthGuard
    const payload: JwtPayload = { 
      userId: user.id, 
      phone: user.phone || user.username || '', // Include username/phone for context
      role: user.role 
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}