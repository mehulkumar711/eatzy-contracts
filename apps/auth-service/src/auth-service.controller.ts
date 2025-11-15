import { Controller, Post, Body, ValidationPipe, UsePipes } from '@nestjs/common';
import { AuthService } from './auth-service.service';

// We need a DTO (Data Transfer Object) for validation
class LoginDto {
  phone: string;
}

@Controller('api/v1/auth')
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginDto: LoginDto) {
    // In a real app, this DTO would also contain the OTP code
    return this.authServiceService.loginWithPhone(loginDto.phone);
  }
}