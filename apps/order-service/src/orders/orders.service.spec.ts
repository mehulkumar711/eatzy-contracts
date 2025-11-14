import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Saga } from '../sagas/saga.entity';
import { ProcessedEvents } from '../events/processed-events.entity';
import { DataSource } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { CreateOrderDto } from './create-order.dto';

describe('OrdersService', () => {
  let service: OrdersService;

  // Better Mock Factory
  function createMockQueryRunner() {
    const storage = new Map<string, any>(); 
    
    return {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn().mockImplementation((entity, { where }) => {
          const key = Object.values(where)[0] as string;
          return Promise.resolve(storage.get(key) || null);
        }),
        create: jest.fn((entity, dto) => dto),
        save: jest.fn((entity) => {
          const id = entity.id || entity.event_id || 'uuid';
          const key = entity.clientRequestId || entity.event_id || id;
          storage.set(key, { ...entity, id });
          return Promise.resolve({ ...entity, id });
        }),
      },
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: {} },
        { provide: getRepositoryToken(Saga), useValue: {} },
        { provide: DataSource, useValue: { createQueryRunner: createMockQueryRunner } },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should create order and saga in transaction', async () => {
    const dto: CreateOrderDto = {
      client_request_id: 'req-1',
      vendor_id: 'vendor-1',
      items: [{ item_id: 'item-1', quantity: 2 }],
      total_amount_paise: 24000,
    };

    const res = await service.createOrder(dto);
    expect(res.status).toBe('PENDING');
  });
});