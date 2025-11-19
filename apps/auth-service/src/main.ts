import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { AuthServiceModule } from './auth-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);

  // Enable serialization globally to respect @Exclude()
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Use port 3001 for the auth service
  await app.listen(3001, '127.0.0.1');
  console.log(`AuthService is running on: ${await app.getUrl()}`);
}
bootstrap();