import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './core/service/prisma.service';

async function bootstrap() {
  const PORT = process.env.PORT || 7000
  const app = await NestFactory.create(AppModule)
  const prismaService = app.get(PrismaService)
  await prismaService.enableShutdownHooks(app)
  app.setGlobalPrefix('api')
  app.enableCors()
  await app.listen(PORT)
  console.log(PORT)
}
bootstrap();
