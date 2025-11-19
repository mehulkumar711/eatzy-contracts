// Path: libs/shared/src/database/entities/user.entity.ts

import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

/**
 * @enum UserRole
 * @description Defines the comprehensive set of roles in the Eatzy system.
 * CRITICAL FIX: Must be exported to be accessible by ListUsersQueryDto.
 */
export enum UserRole {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  RIDER = 'rider',
  ADMIN = 'admin',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  username: string; // For Admin Login

  @Column({ type: 'varchar', length: 20 })
  role: string;  // Stores one of the UserRole values

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  pin_hash: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}