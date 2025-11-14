import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);
  
  // Use port 3001 for the auth service
  await app.listen(3001); 
  console.log(`AuthService is running on: ${await app.getUrl()}`);
}
bootstrap();