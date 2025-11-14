import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity('users')
// Patched: Add index for the hot path
@Index(['id', 'role', 'is_active'])
export class User {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  role!: string;

  // Patched: Add default value
  @Column({ default: true })
  is_active!: boolean;
}