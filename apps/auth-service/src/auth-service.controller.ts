// apps/auth-service/src/auth-service.controller.ts

import { Controller, Post, Body, ValidationPipe, UsePipes, HttpCode, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth-service.service';
import { LoginDto } from './dto/login.dto';
import { AdminLoginDto } from './dto/admin-login.dto'; // NEW IMPORT

@Controller('api/v1/auth')
export class AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  @Post('login') // Standard Customer/Vendor Login (Phone/PIN)
  @HttpCode(201)
  @UsePipes(new ValidationPipe())
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto);
    return this.authService.login(user);
  }

  @Post('admin/login') // NEW: Admin Login (Username/Password)
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  async adminLogin(@Body() dto: AdminLoginDto) {
    const user = await this.authService.validateAdmin(dto);
    return this.authService.login(user);
  }
}