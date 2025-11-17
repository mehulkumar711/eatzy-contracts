import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'processed_events' })
export class ProcessedEvents {
  //
  // --- THE FIX (v1.55): ---
  // The primary key is 'idempotency_key' and it is a string,
  // matching our V1 database migration.
  //
  @PrimaryColumn('varchar', { length: 255 })
  idempotency_key: string;

  @Column('uuid')
  saga_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}