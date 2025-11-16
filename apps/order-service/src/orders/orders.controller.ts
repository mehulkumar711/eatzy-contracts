import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  ValidationPipe,
  UsePipes,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './create-order.dto';
import {
  JwtAuthGuard,
  Roles,
  RolesGuard,
  User, // We are using this decorator
  JwtPayload,
} from '@app/shared';

@Controller('api/v1/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(202)
  @Roles('customer') // The guard is checking for this role
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() dto: CreateOrderDto,
    @User() user: JwtPayload, // The @User decorator injects the payload
  ) {
    //
    // --- THIS IS THE DEBUGGING FIX ---
    // Log the payload to see what the RolesGuard is seeing.
    //
    console.log('[OrdersController] Received token payload:', user);

    return this.ordersService.createOrder(dto, user);
  }

  @Get(':id/status')
  async status(@Param('id') id: string) {
    return this.ordersService.getStatus(id);
  }
}