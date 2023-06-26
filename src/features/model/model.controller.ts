import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ModelService } from './model.service';
import { ModelDto } from './dto/model.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';

@Controller('models')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @UsePipes(new ValidationPipe())
  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @Post()
  async create(@Body() dto: ModelDto) {
    return this.modelService.create(dto)
  }

  @Get()
  async getMany(@Query('page') page: string = '1', @Query('limit') limit: string = '5', @Query('query') query: string = '', @Query('manufacturerId') manufacturerId: string = '',) {
    return this.modelService.getMany(+page, +limit, query.toUpperCase(), manufacturerId)
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    return this.modelService.getOne(id)
  }

  @UsePipes(new ValidationPipe())
  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @Put('/:id')
  async update(@Param('id') id: string, @Body() dto: ModelDto) {
    return this.modelService.update(id, dto)
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return this.modelService.delete(id)
  }
}
