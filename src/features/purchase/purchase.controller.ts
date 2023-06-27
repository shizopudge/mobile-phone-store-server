import { Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { PurchaseService } from './purchase.service';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { PurchaseStatus } from '@prisma/client';
import { AdminRoleGuard } from 'src/core/guards/admin-role.guard';

@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @UsePipes(new ValidationPipe())
  @UseGuards(AccessTokenGuard, AdminRoleGuard)
  @HttpCode(200)
  @Post('/:id')
  async create(@Req() req: Request, @Param('id') id: string) {
      return this.purchaseService.create(req.header('Authorization'), id)
  }
  
  @UseGuards(AccessTokenGuard)
  @Get('/:id')
  async getOne(@Param('id') id: string) {
    return this.purchaseService.getOne(id)
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  async getMany(@Query('page') page: string = '1', @Query('limit') limit: string = '5', @Query('query') query: string = '', @Query('sort') sort: string = 'desc', @Query('status') status?: PurchaseStatus) {
    return this.purchaseService.getMany(+page, +limit, query.toUpperCase(), sort, status)
  }
  
  @UsePipes(new ValidationPipe())
  @UseGuards(AccessTokenGuard, AdminRoleGuard)
  @HttpCode(200)
  @Patch('/:id')
  async patch(@Param('id') id: string, @Query('status') status: PurchaseStatus) {
    return this.purchaseService.patch(id, status)
  }

  @UseGuards(AccessTokenGuard, AdminRoleGuard)
  @HttpCode(200)
  @Delete('/:id')
  async delete(@Param('id') id: string) {
      return this.purchaseService.delete(id)
  }
}
