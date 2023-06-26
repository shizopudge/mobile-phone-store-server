import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ManufacturerService } from './manufacturer.service';
import { ManufacturerDto } from './dto/manufacturer.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('manufacturers')
export class ManufacturerController {
  constructor(private readonly manufacturerService: ManufacturerService) {}

  @UsePipes(new ValidationPipe())
  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @Post()
  async create(@Body() dto: ManufacturerDto) {
    return this.manufacturerService.create(dto)
  }

  @Get()
  async getMany(@Query('page') page: string = '1', @Query('limit') limit: string = '5', @Query('query') query: string = '') {
    return this.manufacturerService.getMany(+page, +limit, query.toUpperCase())
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @Put('/:id')
  async update(@Param('id') id: string, @Body() dto: ManufacturerDto) {
    return this.manufacturerService.update(id, dto)
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return this.manufacturerService.delete(id)
  }

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(200)
  @Patch('/image/:id')
  async uploadImage(@Param('id') id: string, @UploadedFile() image: Express.Multer.File) {
    return this.manufacturerService.uploadImage(id, image)
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @Delete('/image/:id')
  async deleteImage(@Param('id') id: string) {
    return this.manufacturerService.deleteImage(id)
  }
}
