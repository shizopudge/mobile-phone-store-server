import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { PrismaService } from 'src/core/service/prisma.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ImagesService } from 'src/core/service/image.service';

@Module({
  controllers: [PurchaseController],
  providers: [PurchaseService, PrismaService, UserService, JwtService, ImagesService]
})
export class PurchaseModule {}
