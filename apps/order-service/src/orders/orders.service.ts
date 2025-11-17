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

import { Order, OrderStatus } from './order.entity'; // OrderStatus type is imported
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
    private readonly dataSource: DataSource, // For transactions
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, userPayload: JwtPayload) {
    // 1. Start a database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { client_request_id, vendor_id, items, total_amount_paise } =
        createOrderDto;
      const { userId, role } = userPayload;

      //
      // --- THE FIX (for TS2353) ---
      // 2. Idempotency Check
      // We check the 'processed_events' table using the correct key.
      //
      const existingEvent = await queryRunner.manager.findOneBy(
        ProcessedEvents,
        {
          idempotency_key: client_request_id,
        },
      );

      if (existingEvent) {
        // This request is a duplicate, throw 409 Conflict
        throw new ConflictException(
          'Request already processed (idempotency key).',
        );
      }

      // 3. Customer Validation (This query is now correct)
      const customer = await queryRunner.manager.findOne(User, {
        where: {
          id: userId,
          role: 'customer',
          is_active: true,
        },
        lock: { mode: 'pessimistic_read' }, // Lock the user row
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
        status: 'PENDING', // Use string literal
        total_amount_paise: total_amount_paise,
        saga_id: saga.id,
        customer: customer,
      });
      await queryRunner.manager.save(Order, order);

      // 6. Log the processed event (for idempotency)
      const processedEvent = queryRunner.manager.create(ProcessedEvents, {
        idempotency_key: client_request_id,
        saga_id: saga.id,
      });
      await queryRunner.manager.save(ProcessedEvents, processedEvent);

      // 7. Commit the transaction
      await queryRunner.commitTransaction();

      // 8. TODO: Emit Kafka event (ORDER_CREATED)

      return {
        order_id: order.id,
        status: order.status,
        saga_id: saga.id,
      };
    } catch (error) {
      // 9. If anything fails, roll back the transaction
      await queryRunner.rollbackTransaction();
      
      if (error instanceof ConflictException || error instanceof UnauthorizedException) {
        throw error;
      }
      
      console.error('Transaction failed:', error);
      throw new InternalServerErrorException('Transaction failed');
    } finally {
      // 10. Always release the query runner
      await queryRunner.release();
    }
  }

  async getStatus(id: string): Promise<{ order_id: string; status: OrderStatus }> {
    const order = await this.orderRepository.findOneBy({ id });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    //
    // --- THE FIX (for TS2693) ---
    //
    // We compare 'order.status' to string literals,
    // not the 'OrderStatus' type.
    //
    if (order.status === 'PENDING') {
      // TODO: Check saga status for a more detailed update
    }

    return {
      order_id: order.id,
      status: order.status,
    };
  }
}