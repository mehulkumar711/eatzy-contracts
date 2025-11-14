import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// In a real app, you would get this by querying the 'users' table
const MOCK_USERS = [
  { userId: '11111111-1111-1111-1111-111111111111', phone: '+911234567890', role: 'customer' },
  { userId: '22222222-2222-2222-2222-222222222222', phone: '+919876543210', role: 'vendor' },
  { userId: '33333333-3333-3333-3333-333333333333', phone: '+911122334455', role: 'rider' },
];

@Injectable()
export class AuthServiceService {
  constructor(private jwtService: JwtService) {}

  /**
   * MOCK LOGIN
   * In a real app, this would verify a one-time-password (OTP).
   * For v1, we just find the user by phone and return a token.
   */
  async loginWithPhone(phone: string) {
    // 1. Find the user
    const user = MOCK_USERS.find(u => u.phone === phone);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 2. Create the JWT payload
    const payload = { 
      phone: user.phone, 
      sub: user.userId, // 'sub' (subject) is the standard JWT claim for user ID
      role: user.role 
    };

    // 3. Sign and return the token
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}