import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone: string;

  @Column({ type: 'varchar', length: 20 })
  role: string; // 'customer', 'vendor', 'rider'

  @Column({ type: 'varchar', length: 255, nullable: true })
  pin_hash: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  //
  // --- THE FIX (v1.53): ---
  // We DO NOT add the @OneToMany relationship here.
  // This keeps the shared entity pure and avoids
  // a circular dependency.
  //
}