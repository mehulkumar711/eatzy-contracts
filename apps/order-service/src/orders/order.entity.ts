import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity'; // Import User

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  ACCEPTED = 'accepted',
  PREPARING = 'preparing',
  READY = 'ready',
  PICKED_UP = 'picked_up',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Patched: Add FK relationship
  @ManyToOne(() => User, { onDelete: 'SET NULL' }) // Or 'CASCADE'
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ type: 'uuid', name: 'customer_id' })
  customerId!: string;

  @Column({ type: 'uuid', name: 'vendor_id' })
  vendorId!: string;

  @Column({ type: 'uuid', name: 'rider_id', nullable: true })
  riderId?: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({ type: 'bigint', name: 'total_amount_paise' })
  totalAmountPaise!: number;

  @Column({ type: 'uuid', name: 'client_request_id', unique: true })
  clientRequestId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}