import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  // Ensure clean state for this test run
  beforeEach(async () => {
    await dataSource.query('DELETE FROM processed_events');
    await dataSource.query('DELETE FROM sagas');
    await dataSource.query('DELETE FROM orders');
  });

  it('/POST api/v1/orders (idempotency flow)', async () => {
    const dto = {
      client_request_id: 'e2e-req-unique-1',
      vendor_id: '44444444-4444-4444-4444-444444444444', // Must match seed data
      items: [{ item_id: 'item-1', quantity: 1 }],
      total_amount_paise: 12000,
    };

    // 1. First Call -> 201 Created (or 202 if you added @HttpCode)
    const res1 = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .send(dto)
      .expect(201); // Default NestJS POST status is 201

    expect(res1.body.order_id).toBeDefined();
    expect(res1.body.status).toBe('PENDING');

    // 2. Second Call -> 409 Conflict
    const res2 = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .send(dto)
      .expect(409);
    
    expect(res2.body.message).toBe('Duplicate request');
  });
});