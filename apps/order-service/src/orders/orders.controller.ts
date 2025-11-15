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
  // 'Request' is no longer needed
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './create-order.dto';
// Patched: Use the shared library path
import {
  JwtAuthGuard,
  Roles,
  RolesGuard,
  User, // <-- This is now correctly imported
  JwtPayload,
} from '@app/shared'; // Make sure '@app/shared' points to your lib

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
    @User() user: JwtPayload, // <-- Use the @User decorator
  ) {
    // The user object is now correctly injected
    return this.ordersService.createOrder(dto, user);
  }

  @Get(':id/status')
  async status(@Param('id') id: string) {
    return this.ordersService.getStatus(id);
  }
}