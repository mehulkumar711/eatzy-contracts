// Path: apps/auth-service/src/dto/list-users-query.dto.ts

import { IsOptional, IsInt, Min, IsString, IsEnum, Max } from 'class-validator';
import { Type } from 'class-transformer';
// Assuming UserRole is correctly exported from your shared entity
import { UserRole } from '@app/shared/database/entities/user.entity'; 

/**
 * @description DTO for validation and transformation of GET /users query parameters.
 */
export class ListUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsEnum(UserRole, { message: 'role must be a valid user type' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  search?: string;
}