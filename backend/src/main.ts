import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

const configuredOrigins = process.env.FRONTEND_URL
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.enableCors({
  origin: '*',
  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
