import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    // 1. Load .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Connect to DB
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USER || 'user',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'eatzy_db',
      autoLoadEntities: true,
      synchronize: false, // We use migrations
    }),

    // 3. Import Feature Modules
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}