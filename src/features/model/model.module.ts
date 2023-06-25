import { Module } from '@nestjs/common';
import { ModelService } from './model.service';
import { ModelController } from './model.controller';
import { PrismaService } from 'src/core/utils/prisma.service';

@Module({
  controllers: [ModelController],
  providers: [ModelService, PrismaService]
})
export class ModelModule {}
