import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './core/service/prisma.service';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import * as fs from 'fs';
import cors from 'cors';

async function bootstrap() {
  // const privateKey = fs.readFileSync('./src/server.key', 'utf8');
  // const certificate = fs.readFileSync('./src/server.cert', 'utf8');
  // const httpsOptions = { key: privateKey, cert: certificate };
  const PORT = process.env.PORT || 5000;
  // const app = await NestFactory.create(AppModule, { httpsOptions });
  const app = await NestFactory.create(AppModule);
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  app.setGlobalPrefix('api');
  app.use(cors());
  initializeApp({
    credential: applicationDefault(),
  });
  await app.listen(PORT);
}
bootstrap();
