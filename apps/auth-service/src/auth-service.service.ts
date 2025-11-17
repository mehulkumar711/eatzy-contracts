import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { JwtPayload, User } from '@app/shared';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  // 1. Inject the User repository
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validates a user's phone and PIN against the database.
   * This is no longer a mock.
   */
  async validateUser(loginDto: LoginDto): Promise<User> {
    const { phone, pin } = loginDto;
    
    // 2. Find the user in the database
    const user = await this.userRepository.findOne({ where: { phone } });

    // 3. Check if user exists and PIN is correct
    if (user && (await bcrypt.compare(pin, user.pin_hash))) {
      if (!user.is_active) {
        throw new UnauthorizedException('User account is inactive.');
      }
      return user;
    }
    
    throw new UnauthorizedException('Invalid credentials.');
  }

  /**
   * Logs in a user and returns a signed JWT.
   */
  async login(user: User): Promise<{ access_token: string }> {
    // 4. Create the standard JWT payload
    const payload: JwtPayload = { 
      userId: user.id,
      phone: user.phone, 
      role: user.role 
    };

    // 5. Sign and return the token
    const token = this.jwtService.sign(payload);
    
    return {
      access_token: token,
    };
  }
}