import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ProductModule } from './features/product/product.module';
import { ModelModule } from './features/model/model.module';
import { ManufacturerModule } from './features/manufacturer/manufacturer.module';
import { PrismaService } from './core/service/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    ServeStaticModule.forRoot(
    {
      rootPath: join(__dirname, '..', 'static/users'),
      renderPath: '/users'
    },
    {
      rootPath: join(__dirname, '..', 'static/products'),
      renderPath: '/products'
    }
    ), 
    AuthModule, 
    UsersModule,
    ProductModule,
    ModelModule,
    ManufacturerModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
