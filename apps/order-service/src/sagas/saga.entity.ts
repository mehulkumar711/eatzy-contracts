import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'sagas' })
export class Saga {
  //
  // --- THE FIX (v1.55): ---
  // Add the 'id' property, which matches our V1 migration.
  //
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 50 })
  saga_type: string;

  @Column('varchar', { length: 50, default: 'PENDING' })
  status: string;

  @Column('jsonb', { nullable: true })
  payload: any;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}