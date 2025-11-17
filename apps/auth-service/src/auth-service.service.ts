import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

// These imports will now work
import { JwtPayload, User } from '@app/shared';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // This type is now found
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validates a user's phone and PIN against the database.
   */
  async validateUser(loginDto: LoginDto): Promise<User> { // This type is now found
    const { phone, pin } = loginDto;
    
    const user = await this.userRepository.findOne({ where: { phone } });

    // Compare plaintext pin with hashed pin
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
  async login(user: User): Promise<{ access_token: string }> { // This type is now found
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