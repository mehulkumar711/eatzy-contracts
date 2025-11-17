import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'processed_events' })
export class ProcessedEvents {
  //
  // --- THE FIX (v1.57): ---
  // This now matches the V1 migration.
  //
  @PrimaryColumn('varchar', { length: 255 })
  idempotency_key: string;

  @Column('uuid')
  saga_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}