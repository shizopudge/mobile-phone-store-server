import { Body, Controller, Put, Delete, Get, HttpCode, Param, Post, Query, UploadedFiles, UseGuards, Patch, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDto } from './dto/product.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductController {
  constructor(private readonly productsService: ProductService) {}

  @UsePipes(new ValidationPipe())
  @UseGuards(AccessTokenGuard)
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
  async getMany(@Query('page') page: string = '1', @Query('limit') limit: string = '5', @Query('query') query: string = '', @Query('sort') sort: string = 'desc') {
    return this.productsService.getMany(+page, +limit, query.toUpperCase(), sort)
  }

  @UsePipes(new ValidationPipe())
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FilesInterceptor('images'))
  @HttpCode(200)
  @Put('/:id')
  async update(@Param('id') id: string, @Body() dto: ProductDto) {
    return this.productsService.update(id, dto)
  }


  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id)
  }

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FilesInterceptor('images'))
  @HttpCode(200)
  @Patch('/images/:id')
  async uploadImages(@Param('id') id: string, @UploadedFiles() images: Array<Express.Multer.File>) {
    return this.productsService.uploadImages(id, images)
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @Delete('/images/:id')
  async deleteImages(@Param('id') id: string, @Body() body: {imagesLinks: string[]}) {
    return this.productsService.deleteImages(id, body.imagesLinks)
  }
}
