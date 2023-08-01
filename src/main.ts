import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './core/service/prisma.service';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { CorsMiddleware } from './core/utils/cors.middleware';

async function bootstrap() {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  initializeApp({
    credential: applicationDefault(),
  });
  await app.listen(PORT);
}
bootstrap();
