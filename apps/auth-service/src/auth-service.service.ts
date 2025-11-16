import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
// 1. Import the shared JwtPayload interface
import { JwtPayload } from '@app/shared';

// In a real app, you would get this by querying the 'users' table
const MOCK_USERS = [
  { userId: '11111111-1111-1111-1111-111111111111', phone: '+911234567890', role: 'customer' },
  { userId: '22222222-2222-2222-2222-222222222222', phone: '+919876543210', role: 'vendor' },
  { userId: '33333333-3333-3333-3333-333333333333', phone: '+911122334455', role: 'rider' },
];

@Injectable()
export class AuthService {
  // 2. Inject ConfigService to get the JWT_SECRET
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async loginWithPhone(phone: string): Promise<{ access_token: string }> {
    const user = MOCK_USERS.find(u => u.phone === phone);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    //
    // --- FIX 2: Create the CORRECT payload ---
    // It must match the JwtPayload interface
    //
    const payload: JwtPayload = { 
      userId: user.userId, // Use 'userId', not 'sub'
      phone: user.phone, 
      role: user.role 
    };

    // 3. Sign the token
    const token = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      issuer: 'eatzy-auth-service',
      audience: 'eatzy-app',
    });

    //
    // --- FIX 1: Return the CORRECT key ---
    // Must be 'access_token' (lowercase)
    //
    return {
      access_token: token,
    };
  }
}