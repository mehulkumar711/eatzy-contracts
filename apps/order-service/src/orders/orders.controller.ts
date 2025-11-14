import { Body, Controller, Post, Get, Param, ValidationPipe, UsePipes, HttpCode, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './create-order.dto';
// Patched: Use the shared library path
import { JwtAuthGuard, Roles, RolesGuard } from '@app/shared';
import { JwtPayload } from '@app/shared';

@Controller('api/v1/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(202)
  @Roles('customer')
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() dto: CreateOrderDto, @Request() req: { user: JwtPayload }) {
    const user = req.user; 
    return this.ordersService.createOrder(dto, user);
  }

  @Get(':id/status')
  async status(@Param('id') id: string) {
    return this.ordersService.getStatus(id);
  }
}