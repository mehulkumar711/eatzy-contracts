import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { User } from '@app/shared'; // Import User entity
import { JwtStrategy } from '../jwt.strategy'; // Import the new local strategy

import { Order } from './order.entity';
import { Saga } from '../sagas/saga.entity';
import { ProcessedEvents } from '../events/processed-events.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { VendorsController } from '../vendors/vendors.controller';
import { VendorsService } from '../vendors/vendors.service';
import { Vendor } from '../vendors/vendor.entity';
import { MenuItem } from '../vendors/menu-item.entity';

@Module({
  imports: [
    // 1. Import User entity to satisfy JwtStrategy's dependency
    TypeOrmModule.forFeature([User, Order, Saga, ProcessedEvents, Vendor, MenuItem]),

    // 2. Register Passport
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [OrdersController, VendorsController],
  providers: [
    OrdersService,
    VendorsService,
    // 3. Provide the local JwtStrategy
    JwtStrategy,
  ],
})
export class OrdersModule { }