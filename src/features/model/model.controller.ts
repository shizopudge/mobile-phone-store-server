import { Body, Controller, Get, HttpCode, Param, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ModelService } from './model.service';
import { ModelDto } from './dto/model.dto';

@Controller('models')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post()
  async create(@Body() dto: ModelDto) {
    return this.modelService.create(dto)
  }

  @Get()
  async getMany(@Query('page') page: string = '1', @Query('limit') limit: string = '5', @Query('name') name: string = '', @Query('manufacturerId') manufacturerId: string = '',) {
    return this.modelService.getMany(+page, +limit, name.toUpperCase(), +manufacturerId)
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    return this.modelService.getOne(+id)
  }
}
