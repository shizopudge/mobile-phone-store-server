import { Module } from '@nestjs/common';
import { ManufacturerService } from './manufacturer.service';
import { ManufacturerController } from './manufacturer.controller';
import { ImagesService } from 'src/core/service/image.service';
import { PrismaService } from 'src/core/service/prisma.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';


@Module({
  controllers: [ManufacturerController],
  providers: [ManufacturerService, PrismaService, ImagesService, UserService, JwtService]
})
export class ManufacturerModule {}
