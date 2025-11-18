// Path: apps/auth-service/src/auth-service.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common'; // FIX: Missing Injectable
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from '@app/shared';
import { User } from '@app/shared/database/entities/user.entity'; // FIX: Correct path to shared User entity
import { PaginatedResponse } from '@app/shared/types/pagination'; // FIX: Correct path to shared PaginatedResponse
import { LoginDto } from './dto/login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto'; // NEW IMPORT

@Injectable()
export class AuthService {
  // CRITICAL FIX: Ensures property is declared and matches @InjectRepository usage
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // Customer Login (Phone/PIN)
  async validateUser(loginDto: LoginDto): Promise<User> {
    const { phone, pin } = loginDto;
    const user = await this.userRepository.findOne({ where: { phone } });
    if (user && (await bcrypt.compare(pin, user.pin_hash))) {
      if (!user.is_active) throw new UnauthorizedException('Inactive');
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  // Admin Login (Username/Password)
  async validateAdmin(dto: AdminLoginDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username: dto.username } });
    if (user && user.role === 'admin' && (await bcrypt.compare(dto.password, user.pin_hash))) {
      return user;
    }
    throw new UnauthorizedException('Invalid admin credentials');
  }

  /**
   * @method listUsers
   * @description Fetches a paginated, filtered list of users (Admin-only access).
   */
  async listUsers(query: ListUsersQueryDto): Promise<PaginatedResponse<User>> {
    const { page, limit, role, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .orderBy('user.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    // Search by Username, Phone, or ID (important for Admin lookup)
    if (search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(user.username) LIKE :search OR LOWER(user.phone) LIKE :search OR LOWER(user.id::text) LIKE :search)',
        { search: searchTerm }
      );
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async login(user: User): Promise<{ access_token: string }> {
    const payload: JwtPayload = { 
      userId: user.id, 
      phone: user.phone || '', 
      role: user.role 
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}