import { Body, Controller, Put, Delete, Get, HttpCode, Param, Post, Query, UploadedFiles, UseGuards, Patch, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDto } from './dto/product.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AdminRoleGuard } from 'src/core/guards/admin-role.guard';
import { GetProductsDto } from './dto/get-products.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productsService: ProductService) {}

  @UsePipes(new ValidationPipe())
  @UseGuards(AccessTokenGuard, AdminRoleGuard)
  @HttpCode(200)
  @Post()
  async create(@Body() dto: ProductDto) {
    return this.productsService.create(dto)
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    return this.productsService.getOne(id)
  }

  @Get()
  async getMany(@Query() dto: GetProductsDto) {
    return this.productsService.getMany(+dto.page, +dto.limit, dto.query.toUpperCase(), dto.sort, JSON.parse(dto.withDiscount), JSON.parse(dto.newArrival), +dto.minCost, +dto.maxCost)
  }

  @UsePipes(new ValidationPipe())
  @UseGuards(AccessTokenGuard, AdminRoleGuard)
  @UseInterceptors(FilesInterceptor('images'))
  @HttpCode(200)
  @Put('/:id')
  async update(@Param('id') id: string, @Body() dto: ProductDto) {
    return this.productsService.update(id, dto)
  }


  @UseGuards(AccessTokenGuard, AdminRoleGuard)
  @HttpCode(200)
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id)
  }

  @UseGuards(AccessTokenGuard, AdminRoleGuard)
  @UseInterceptors(FilesInterceptor('images'))
  @HttpCode(200)
  @Patch('/images/:id')
  async uploadImages(@Param('id') id: string, @UploadedFiles() images: Array<Express.Multer.File>) {
    return this.productsService.uploadImages(id, images)
  }

  @UseGuards(AccessTokenGuard, AdminRoleGuard)
  @HttpCode(200)
  @Delete('/images/:id')
  async deleteImages(@Param('id') id: string, @Body() body: {imagesLinks: string[]}) {
    return this.productsService.deleteImages(id, body.imagesLinks)
  }
}
