import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      // Patched: Add audience and issuer validation
      audience: 'eatzy-app',
      issuer: 'eatzy-auth-service',
      // 'clockTolerance' is not a valid property, it was removed.
    });
  }

  // This is the method that runs *after* a token is successfully verified
  async validate(payload: any) {
    // We can add user ID, role, etc.
    if (!payload.sub || !payload.phone) {
      throw new UnauthorizedException('Invalid token payload');
    }
    
    // This 'return' value is what NestJS injects into req.user
    return { userId: payload.sub, phone: payload.phone, role: payload.role };
  }
}