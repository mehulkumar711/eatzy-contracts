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
  User,
  JwtPayload,
} from '@app/shared';

@Controller('api/v1/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(202)
  @Roles('customer')
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() dto: CreateOrderDto,
    @User() user: JwtPayload,
  ) {
    //
    // --- THIS IS THE FIX ---
    // Log the payload to see what the RolesGuard is seeing
    //
    console.log('[OrdersController] Received token payload:', user);

    return this.ordersService.createOrder(dto, user);
  }

  @Get(':id/status')
  async status(@Param('id') id: string) {
    return this.ordersService.getStatus(id);
  }
}