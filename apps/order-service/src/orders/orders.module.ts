import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Saga } from '../sagas/saga.entity';
import { ProcessedEvents } from '../events/processed-events.entity';
import { User } from '../users/user.entity'; // 1. Import User
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Saga, ProcessedEvents, User]) // 2. Add User
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}