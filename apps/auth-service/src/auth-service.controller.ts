// Path: apps/auth-service/src/auth-service.controller.ts

import { Controller, Post, Body, ValidationPipe, UsePipes, HttpCode, Get, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth-service.service';
import { LoginDto } from './dto/login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto'; // NEW IMPORT
import { JwtAuthGuard, Roles, RolesGuard } from '@app/shared'; // Assuming shared imports

@Controller('api/v1/auth')
export class AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto);
    return this.authService.login(user);
  }

  @Post('admin/login')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminLogin(@Body() dto: AdminLoginDto) {
    const user = await this.authService.validateAdmin(dto);
    return this.authService.login(user);
  }

  /**
   * @route GET /api/v1/auth/users
   * @description Admin-only endpoint to fetch a paginated list of all users/vendors.
   */
  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Only users with the 'admin' role can access
  @UsePipes(new ValidationPipe({ transform: true }))
  async listUsers(@Query() query: ListUsersQueryDto) {
    return this.authService.listUsers(query);
  }
}