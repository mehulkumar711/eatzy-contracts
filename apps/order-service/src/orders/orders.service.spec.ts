import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Saga } from '../sagas/saga.entity';
import { ProcessedEvents } from '../events/processed-events.entity';
import { DataSource } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { CreateOrderDto } from './create-order.dto';
import { User } from '../users/user.entity'; // Import User

describe('OrdersService', () => {
  let service: OrdersService;
  let dataSource: DataSource;
  let mockQueryRunner: any;

  // Mock repositories
  const mockRepo = {
    create: jest.fn((dto) => dto),
    save: jest.fn((dto) => Promise.resolve({ ...dto, id: 'uuid', saga_id: 'uuid' })),
    findOne: jest.fn(() => Promise.resolve(null)),
    findOneBy: jest.fn(() => Promise.resolve(null)),
  };

  mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn().mockResolvedValue(null), // Default behavior
      create: jest.fn((entity, dto) => dto),
      save: jest.fn((dto) => Promise.resolve({ ...dto, id: 'new-order-id', saga_id: 'new-saga-id' })),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockRepo },
        { provide: getRepositoryToken(Saga), useValue: mockRepo },
        { provide: getRepositoryToken(User), useValue: mockRepo },
        { provide: getRepositoryToken(ProcessedEvents), useValue: mockRepo },
        { provide: DataSource, useValue: { createQueryRunner: () => mockQueryRunner } },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should create order and saga in transaction', async () => {
    const dto: CreateOrderDto = {
      client_request_id: 'req-1',
      vendor_id: 'vendor-1',
      items: [{ item_id: 'item-1', quantity: 2 }],
      total_amount_paise: 24000,
    };
    
    const mockUser = { userId: 'customer-123', role: 'customer', phone: '+911234567890' };

    // Mock idempotency check (event not found)
    mockQueryRunner.manager.findOne.mockResolvedValueOnce(null); 
    // Mock customer check (customer found)
    mockQueryRunner.manager.findOne.mockResolvedValueOnce({ id: 'customer-123' }); 

    const res = await service.createOrder(dto, mockUser); // Pass user

    expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(3); // Order, Saga, Event
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(res.status).toBe('PENDING');
  });
});