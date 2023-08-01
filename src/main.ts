import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './core/service/prisma.service';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import * as fs from 'fs';

async function bootstrap() {
  const privateKey = fs.readFileSync('./src/server.key', 'utf8');
  const certificate = fs.readFileSync('./src/server.cert', 'utf8');
  const httpsOptions = { key: privateKey, cert: certificate };
  console.log(httpsOptions);
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule, { httpsOptions, cors: true });
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: ['https://84.201.179.226:8000/'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  initializeApp({
    credential: applicationDefault(),
  });
  await app.listen(PORT);
}
bootstrap();
