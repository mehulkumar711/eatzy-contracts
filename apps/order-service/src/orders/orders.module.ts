import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface'; // Corrected import path

/**
 * Shared JWT Strategy
 *
 * This strategy is used by all microservices to validate the
 * signature and expiration of a JWT.
 *
 * It simply decodes the token and returns the payload.
 * It does NOT check if the user exists in the database.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Use the shared secret from environment variables
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * Passport automatically calls this method after verifying
   * the token's signature. It returns the payload, which
   * NestJS then attaches to the request.user object.
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // We trust the auth-service to have put valid data
    // in the payload. We just return it.
    return payload;
  }
}