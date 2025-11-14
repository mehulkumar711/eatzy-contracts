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
    });
  }

  // This is the method that runs *after* a token is successfully verified
  async validate(payload: any) {
    // The payload is the JSON object we put in the token.
    // We can add user ID, role, etc.
    if (!payload.sub || !payload.phone) {
      throw new UnauthorizedException('Invalid token payload');
    }
    
    // This 'return' value is what NestJS injects into req.user
    return { userId: payload.sub, phone: payload.phone, role: payload.role };
  }
}