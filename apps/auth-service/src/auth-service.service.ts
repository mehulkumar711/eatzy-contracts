import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

// These imports are now unambiguous and correct
import { JwtPayload, User } from '@app/shared'; 
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // This now resolves correctly
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validates a user's phone and PIN against the database.
   */
  async validateUser(loginDto: LoginDto): Promise<User> { // This now resolves correctly
    const { phone, pin } = loginDto;
    
    const user = await this.userRepository.findOne({ where: { phone } });

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
  async login(user: User): Promise<{ access_token: string }> { // This now resolves correctly
    const payload: JwtPayload = { 
      userId: user.id,
      phone: user.phone, 
      role: user.role 
    };

    const token = this.jwtService.sign(payload);
    
    return {
      access_token: token,
    };
  }
}