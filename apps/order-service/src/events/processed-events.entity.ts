import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('processed_events')
export class ProcessedEvents {
  @PrimaryColumn({ type: 'uuid', name: 'event_id' })
  event_id!: string;

  @PrimaryColumn({ type: 'text', name: 'consumer_group' })
  consumer_group!: string;

  @Column({ type: 'text' })
  topic!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}