import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { User } from '@app/shared'; // Import User entity
import { JwtStrategy } from '../jwt.strategy'; // Import local strategy

import { Order } from './order.entity';
import { Saga } from '../sagas/saga.entity';
import { ProcessedEvents } from '../events/processed-events.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    //
    // --- THE FIX (v1.53): ---
    // This line registers ALL entities required by this module
    // with TypeORM. This is what fixes the "metadata not found" error.
    //
    TypeOrmModule.forFeature([
      User, 
      Order, 
      Saga, 
      ProcessedEvents
    ]),
    
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    JwtStrategy, // The local strategy
  ],
})
export class OrdersModule {}