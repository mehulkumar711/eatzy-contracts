import { Controller, Post, Get, Body, Param, UseGuards, UsePipes, ValidationPipe, HttpCode } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './create-order.dto';
import { JwtAuthGuard, Roles, RolesGuard, User, JwtPayload } from '@app/shared';

@Controller('api/v1/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(202)
  @Roles('customer')
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() dto: CreateOrderDto, @User() user: JwtPayload) {
    // 🔥 THIS MUST APPEAR IN ORDER-SERVICE LOGS
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('[DIAGNOSTIC] JWT Payload:');
    console.log(JSON.stringify(user, null, 2));
    console.log('[DIAGNOSTIC] Has "role"?', 'role' in user);
    console.log('[DIAGNOSTIC] Role value:', user.role);
    console.log('═══════════════════════════════════════════════════════════════');
    
    return this.ordersService.createOrder(dto, user);
  }

  @Get(':id/status')
  async status(@Param('id') id: string) {
    return this.ordersService.getStatus(id);
  }
}