import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';

// ...
async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);
  await app.listen(3001); // <-- FIX THIS
  console.log(`AuthService is running on: ${await app.getUrl()}`);
}
// ...
bootstrap();