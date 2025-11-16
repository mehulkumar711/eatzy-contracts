import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport'; // 1. Import Passport
import { JwtStrategy } from '@app/shared'; // 2. Import the Strategy

import { Order } from './order.entity';
import { Saga } from '../sagas/saga.entity';
import { ProcessedEvents } from '../events/processed-events.entity';
import { User } from '../users/user.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Saga, User, ProcessedEvents]),
    // 3. Register Passport to use 'jwt'
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    JwtStrategy, // 4. Provide the Strategy
  ],
})
export class OrdersModule {}