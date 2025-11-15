import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// In a real app, you would get this by querying the 'users' table
const MOCK_USERS = [
  { userId: '11111111-1111-1111-1111-111111111111', phone: '+911234567890', role: 'customer' },
  { userId: '22222222-2222-2222-2222-222222222222', phone: '+919876543210', role: 'vendor' },
  { userId: '33333333-3333-3333-3333-333333333333', phone: '+911122334455', role: 'rider' },
];

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async loginWithPhone(phone: string) {
    const user = MOCK_USERS.find(u => u.phone === phone);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = { 
      phone: user.phone, 
      sub: user.userId,
      role: user.role 
    };

    // 3. Sign and return the token
    return {
      accessToken: this.jwtService.sign(payload, {
        // Patched: Add audience and issuer
        issuer: 'eatzy-auth-service',
        audience: 'eatzy-app',
      }),
    };
  }
}