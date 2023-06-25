import { Body, Controller, Get, HttpCode, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ManufacturerService } from './manufacturer.service';
import { ManufacturerDto } from './dto/manufacturer.dto';

@Controller('manufacturers')
export class ManufacturerController {
  constructor(private readonly manufacturerService: ManufacturerService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post()
  async create(@Body() dto: ManufacturerDto) {
    return this.manufacturerService.create(dto)
  }

  @Get()
  async getMany(@Query('page') page: string = '1', @Query('limit') limit: string = '5', @Query('name') name: string = '') {
    return this.manufacturerService.getMany(+page, +limit, name.toUpperCase())
  }
}
