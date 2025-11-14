import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sagas')
export class Saga {
  @PrimaryGeneratedColumn('uuid')
  saga_id!: string;

  @Column({ type: 'uuid', name: 'order_id', unique: true })
  order_id!: string;

  @Column({ type: 'text', name: 'current_state' })
  current_state!: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: any;

  @Column({ type: 'jsonb', nullable: true })
  steps: any;

  @Column({ type: 'text', name: 'last_error', nullable: true })
  last_error?: string; // Optional

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}