import { Controller, Post, Body, ValidationPipe, UsePipes, HttpCode } from '@nestjs/common';
import { AuthService } from './auth-service.service';
import { IsString, IsNotEmpty } from 'class-validator';

// 1. Define a proper DTO with validation
class LoginDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  pin: string; // The k6 script sends a PIN
}

@Controller('api/v1/auth')
export class AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  // 2. Set the correct HTTP status code for a POST/create
  @HttpCode(201) 
  @UsePipes(new ValidationPipe())
  async login(@Body() loginDto: LoginDto) {
    // 3. Pass the phone. The service will validate the user.
    // In a real app, we would pass the full DTO:
    // return this.authService.validateUser(loginDto.phone, loginDto.pin);
    
    // For now, we pass the phone to the mock service
    return this.authService.loginWithPhone(loginDto.phone);
  }
}