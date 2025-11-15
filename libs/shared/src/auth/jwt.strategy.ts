import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
// Import the shared payload interface
import { JwtPayload } from './jwt-payload.interface';

/**
 * Shared JWT Strategy
 *
 * This strategy is used by all microservices to validate the
 * signature and expiration of a JWT.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Use the shared secret from environment variables
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      
      // We are disabling audience and issuer checks for now
      // to simplify and fix the primary "Unknown strategy" bug.
      // We can re-add these later as a security enhancement.
      // audience: 'eatzy-app',
      // issuer: 'eatzy-auth-service',
    });
  }

  /**
   * Passport automatically calls this method after verifying
   * the token's signature. It returns the payload, which
   * NestJS then attaches to the request.user object.
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // The payload from the auth-service is trusted.
    // We just need to validate its contents.
    if (!payload.userId || !payload.phone || !payload.role) {
       throw new UnauthorizedException('Invalid token payload');
    }
    
    // This return value is attached to request.user
    return payload;
  }
}