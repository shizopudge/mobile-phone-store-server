import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtService } from '@nestjs/jwt';
import { ImagesService } from 'src/core/service/image.service';
import { PrismaService } from 'src/core/service/prisma.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, JwtService, ImagesService]
})
export class UserModule {}
