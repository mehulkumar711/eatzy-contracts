import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { User, JwtPayload } from '@app/shared'; // Correct imports

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService, // Inject ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Correctly read secret from ConfigService
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'), 
    });
  }

  /**
   * This method is now database-aware.
   * It runs for every incoming request on a protected route.
   */
  async validate(payload: JwtPayload): Promise<User> {
    const { userId } = payload;
    
    // Find the user in the REAL DB
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found in JWT');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }

    // This 'user' object is attached to request.user
    return user;
  }
}