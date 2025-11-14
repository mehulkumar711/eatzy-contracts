import { Body, Controller, Post, Get, Param, ValidationPipe, UsePipes, HttpCode, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './create-order.dto';
import { JwtAuthGuard } from '../../auth-service/src/jwt-auth.guard';
import { Roles } from '../../auth-service/src/roles.decorator';
import { RolesGuard } from '../../auth-service/src/roles.guard';

@Controller('api/v1/orders')
@UseGuards(JwtAuthGuard, RolesGuard) // Patched: Add RolesGuard
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(202)
  @Roles('customer') // Patched: Only 'customer' roles can create orders
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() dto: CreateOrderDto, @Request() req: any) {
    const user = req.user; 
    return this.ordersService.createOrder(dto, user);
  }

  @Get(':id/status')
  async status(@Param('id') id: string) {
    return this.ordersService.getStatus(id);
  }
}