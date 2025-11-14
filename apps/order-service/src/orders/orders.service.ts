import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDto } from './create-order.dto';
import { Saga } from '../sagas/saga.entity';
import { ProcessedEvents } from '../events/processed-events.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Saga) private sagaRepo: Repository<Saga>,
    private dataSource: DataSource,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Check Idempotency
      const existingEvent = await queryRunner.manager.findOne(ProcessedEvents, {
        where: { 
          event_id: dto.client_request_id,
          consumer_group: 'order-service'
        }
      });

      if (existingEvent) {
        const existingOrder = await queryRunner.manager.findOne(Order, {
          where: { clientRequestId: dto.client_request_id }
        });
        
        if (existingOrder) {
            throw new ConflictException({
                message: 'Duplicate request',
                order_id: existingOrder.id,
                status: existingOrder.status
            });
        }
      }

      // 2. Create Order
      const order = queryRunner.manager.create(Order, {
        customerId: '11111111-1111-1111-1111-111111111111', // Mock for v1
        vendorId: dto.vendor_id,
        totalAmountPaise: dto.total_amount_paise,
        clientRequestId: dto.client_request_id,
        status: OrderStatus.PENDING,
      });
      const savedOrder = await queryRunner.manager.save(order);

      // 3. Create Saga
      const saga = queryRunner.manager.create(Saga, {
        order_id: savedOrder.id,
        current_state: 'PENDING',
        payload: dto,
        steps: ['payment_pending', 'vendor_pending']
      });
      const savedSaga = await queryRunner.manager.save(saga);

      // 4. Record Idempotency
      const processedEvent = queryRunner.manager.create(ProcessedEvents, {
        event_id: dto.client_request_id,
        consumer_group: 'order-service',
        topic: 'create-order-api'
      });
      await queryRunner.manager.save(processedEvent);

      await queryRunner.commitTransaction();

      return { 
        order_id: savedOrder.id, 
        saga_id: savedSaga.saga_id, 
        status: 'PENDING' 
      };

    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      if (err instanceof ConflictException) throw err;
      if (err.code === '23505') throw new ConflictException('Duplicate request detected during race condition');
      console.error(err);
      throw new InternalServerErrorException('Transaction failed');
    } finally {
      await queryRunner.release();
    }
  }

  async getStatus(id: string) {
    const order = await this.orderRepo.findOneBy({ id });
    if (!order) throw new NotFoundException('Order not found');

    const saga = await this.sagaRepo.findOneBy({ order_id: id });
    const currentState = saga ? saga.current_state : 'UNKNOWN';

    return {
      order_id: order.id,
      current_step: currentState,
      is_complete: currentState === 'COMPLETED',
      is_failed: currentState === 'FAILED',
      last_error: saga?.last_error || null,
    };
  }
}