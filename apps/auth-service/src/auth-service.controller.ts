import { Controller, Post, Body, ValidationPipe, UsePipes, HttpCode, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth-service.service';
import { LoginDto } from './dto/login.dto'; // Import the real DTO

@Controller('api/v1/auth')
export class AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(201)
  @UsePipes(new ValidationPipe())
  async login(@Body() loginDto: LoginDto) {
    // 1. Validate user against the database
    const user = await this.authService.validateUser(loginDto);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. If valid, issue the token
    return this.authService.login(user);
  }
}