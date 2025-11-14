import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrdersModule } from './orders/orders.module';
import { AuthServiceModule } from 'apps/auth-service/src/auth-service.module';

@Module({
  imports: [
    // Patched: Load the service-local .env file
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/order-service/.env',
    }),

    // Patched: Use ConfigService to inject credentials
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USER'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false, // We use migrations
      }),
    }),
    
    OrdersModule,
    AuthServiceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}