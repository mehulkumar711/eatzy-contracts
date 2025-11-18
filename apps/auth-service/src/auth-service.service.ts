import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtPayload, User } from '@app/shared';
import { LoginDto } from './dto/login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // Customer Login
  async validateUser(loginDto: LoginDto): Promise<User> {
    const { phone, pin } = loginDto;
    const user = await this.userRepository.findOne({ where: { phone } });
    if (user && (await bcrypt.compare(pin, user.pin_hash))) {
      if (!user.is_active) throw new UnauthorizedException('Inactive');
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  // Admin Login
  async validateAdmin(dto: AdminLoginDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username: dto.username } });
    if (user && user.role === 'admin' && (await bcrypt.compare(dto.password, user.pin_hash))) {
      return user;
    }
    throw new UnauthorizedException('Invalid admin credentials');
  }

  async login(user: User): Promise<{ access_token: string }> {
    const payload: JwtPayload = { 
      userId: user.id, 
      phone: user.phone || '', 
      role: user.role 
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}