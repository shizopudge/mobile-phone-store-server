import { Module } from '@nestjs/common';
import { ModelService } from './model.service';
import { ModelController } from './model.controller';
import { PrismaService } from 'src/core/service/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { ImagesService } from 'src/core/service/image.service';

@Module({
  controllers: [ModelController],
  providers: [ModelService, PrismaService, UserService, JwtService, ImagesService]
})
export class ModelModule {}
