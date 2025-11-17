import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy, User } from '@app/shared'; // Import User entity

import { Order } from './order.entity';
import { Saga } from '../sagas/saga.entity';
import { ProcessedEvents } from '../events/processed-events.entity';
// We no longer import User from here, it's from @app/shared
// import { User } from '../users/user.entity'; 
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    //
    // --- THE FIX (v1.46) ---
    //
    // 1. Import the User entity so @InjectRepository(User) works
    TypeOrmModule.forFeature([User, Order, Saga, ProcessedEvents]),
    
    // 2. Register Passport
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    //
    // --- THE FIX (v1.46) ---
    //
    // 3. Provide the JwtStrategy so the Guard can use it
    JwtStrategy,
  ],
})
export class OrdersModule {}