// apps/auth-service/src/dto/admin-login.dto.ts

import { IsString, IsNotEmpty } from 'class-validator';

/**
 * @class AdminLoginDto
 * @description Data Transfer Object for Admin authentication via username/password.
 */
export class AdminLoginDto {
  @IsString() @IsNotEmpty() username: string;
  @IsString() @IsNotEmpty() password: string;
}