import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtService } from '@nestjs/jwt';
import { ImagesService } from 'src/core/service/image.service';
import { PrismaService } from 'src/core/service/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, JwtService, ImagesService]
})
export class UsersModule {}
