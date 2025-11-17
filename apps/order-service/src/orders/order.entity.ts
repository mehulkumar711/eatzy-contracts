import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '@app/shared'; // This import is correct
import { Saga } from '../sagas/saga.entity'; // Assumes this file exists

// This enum was created in our V2 migration
export type OrderStatus =
  | 'PENDING'
  | 'VENDOR_ACCEPTED'
  | 'VENDOR_REJECTED'
  | 'READY_FOR_PICKUP'
  | 'RIDER_ASSIGNED'
  | 'RIDER_PICKED_UP'
  | 'DELIVERED'
  | 'CANCELLED';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //
  // --- THE FIX (v1.53): Define the UNIDIRECTIONAL relationship ---
  //
  @ManyToOne(() => User) // Point to the User entity
  @JoinColumn({ name: 'user_id' }) // Map to the 'user_id' db column
  customer: User; // This is the property TypeORM was looking for

  @Column('uuid')
  user_id: string;
  // --- End of Fix ---

  @Column('uuid')
  vendor_id: string;

  @Column('uuid', { nullable: true })
  rider_id: string;

  @Column({
    type: 'enum',
    enumName: 'order_status',
    enum: [
      'PENDING',
      'VENDOR_ACCEPTED',
      'VENDOR_REJECTED',
      'READY_FOR_PICKUP',
      'RIDER_ASSIGNED',
      'RIDER_PICKED_UP',
      'DELIVERED',
      'CANCELLED',
    ],
    default: 'PENDING',
  })
  status: OrderStatus;

  @Column('int')
  total_amount_paise: number;

  @OneToOne(() => Saga)
  @JoinColumn({ name: 'saga_id' })
  saga: Saga;

  @Column('uuid')
  saga_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}