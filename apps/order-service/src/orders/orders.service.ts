import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User, JwtPayload } from '@app/shared';

import { Order, OrderStatus } from './order.entity';
import { Saga } from '../sagas/saga.entity';
import { ProcessedEvents } from '../events/processed-events.entity';
import { CreateOrderDto } from './create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Saga)
    private readonly sagaRepository: Repository<Saga>,
    @InjectRepository(ProcessedEvents)
    private readonly processedEventsRepository: Repository<ProcessedEvents>,
    private readonly dataSource: DataSource,
  ) { }

  async createOrder(createOrderDto: CreateOrderDto, userPayload: JwtPayload) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { client_request_id, vendor_id, items, total_amount_paise } =
        createOrderDto;
      const { userId, role } = userPayload;

      //
      // --- THE FIX (v1.57): ---
      // 2. Idempotency Check
      // Query using the correct 'idempotency_key' column
      //
      const existingEvent = await queryRunner.manager.findOne(
        ProcessedEvents,
        {
          where: { idempotency_key: client_request_id }, // Use correct key
        },
      );

      if (existingEvent) {
        throw new ConflictException(
          'Request already processed (idempotency key).',
        );
      }

      // 3. Customer Validation
      const customer = await queryRunner.manager.findOne(User, {
        where: { id: userId, role: 'customer', is_active: true },
        lock: { mode: 'pessimistic_read' },
      });

      if (!customer) {
        throw new UnauthorizedException('Invalid or inactive customer');
      }

      // 4. Create and save the Saga
      const saga = queryRunner.manager.create(Saga, {
        saga_type: 'CREATE_ORDER',
        status: 'PENDING',
        payload: createOrderDto,
      });
      await queryRunner.manager.save(Saga, saga);

      // 5. Create and save the Order
      const order = queryRunner.manager.create(Order, {
        user_id: userId,
        vendor_id: vendor_id,
        status: 'PENDING',
        total_amount_paise: total_amount_paise,
        saga_id: saga.id,
        customer: customer,
      });
      await queryRunner.manager.save(Order, order);

      //
      // --- THE FIX (v1.57): ---
      // 6. Log the processed event
      // Use the correct 'idempotency_key' column
      //
      const processedEvent = queryRunner.manager.create(ProcessedEvents, {
        idempotency_key: client_request_id, // Save the idempotency key
        saga_id: saga.id,
      });
      await queryRunner.manager.save(ProcessedEvents, processedEvent);

      // 7. Commit the transaction
      await queryRunner.commitTransaction();

      return {
        order_id: order.id,
        status: order.status,
        saga_id: saga.id,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof ConflictException || error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Transaction failed:', error);
      throw new InternalServerErrorException('Transaction failed');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * @method findAll
   * @description Fetches paginated orders for the Admin Panel.
   */
  async findAll(page: number = 1, limit: number = 20, status?: string) {
    const skip = (page - 1) * limit;

    const whereClause = status ? { status: status as any } : {};

    const [data, total] = await this.orderRepository.findAndCount({
      where: whereClause,
      order: { created_at: 'DESC' },
      take: limit,
      skip: skip,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getStatus(id: string): Promise<{ order_id: string; status: OrderStatus }> {
    const order = await this.orderRepository.findOneBy({ id });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'PENDING') {
      // TODO: Check saga status
    }

    return {
      order_id: order.id,
      status: order.status,
    };
  }
}