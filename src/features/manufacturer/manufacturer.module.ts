import { Module } from '@nestjs/common';
import { ManufacturerService } from './manufacturer.service';
import { ManufacturerController } from './manufacturer.controller';
import { ImagesService } from 'src/core/service/image.service';
import { PrismaService } from 'src/core/service/prisma.service';


@Module({
  controllers: [ManufacturerController],
  providers: [ManufacturerService, PrismaService, ImagesService]
})
export class ManufacturerModule {}
