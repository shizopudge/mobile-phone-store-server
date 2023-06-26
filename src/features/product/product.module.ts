import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ModelService } from '../model/model.service';
import { JwtService } from '@nestjs/jwt';
import { ImagesService } from 'src/core/service/image.service';
import { PrismaService } from 'src/core/service/prisma.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, PrismaService, ModelService, JwtService, ImagesService]
})
export class ProductModule {}
