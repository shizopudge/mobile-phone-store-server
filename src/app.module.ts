import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './core/utils/prisma.service';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ProductsModule } from './features/products/products.module';
import { ModelModule } from './features/model/model.module';
import { ManufacturerModule } from './features/manufacturer/manufacturer.module';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    ServeStaticModule.forRoot(
    {
      rootPath: join(__dirname, '..', 'static/constants'),
      renderPath: '/constants'
    },
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
    ProductsModule,
    ModelModule,
    ManufacturerModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
