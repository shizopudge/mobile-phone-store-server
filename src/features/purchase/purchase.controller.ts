import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { PurchaseService } from './purchase.service';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { PurchaseStatus } from '@prisma/client';
import { AdminRoleGuard } from 'src/core/guards/admin-role.guard';

@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @UsePipes(new ValidationPipe())
  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @Post()
  async create(@Req() req: Request, @Body() body: {productIds: string[], returnUrl: string}) {
      return this.purchaseService.create(req.header('Authorization'), body.productIds, body.returnUrl)
  }
  
  @UseGuards(AccessTokenGuard)
  @Get('/:id')
  async getOne(@Param('id') id: string) {
    return this.purchaseService.getOne(id)
  }

  @UseGuards(AccessTokenGuard, AdminRoleGuard)
  @Get()
  async getMany(@Query('page') page: string = '1', @Query('limit') limit: string = '10', @Query('query') query: string = '', @Query('sort') sort: string = 'desc', @Query('status') status?: PurchaseStatus) {
    return this.purchaseService.getMany(+page, +limit, query.toUpperCase(), sort, status)
  }
  
  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @Patch('/:id')
  async updateStatus(@Param('id') id: string, @Query('status') status: PurchaseStatus) {
    return this.purchaseService.updateStatus(id, status)
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @Put('/:id')
  async update(@Param('id') id: string, @Body() body: {productIds: string[]}) {
    return this.purchaseService.update(id, body.productIds)
  }

  @UseGuards(AccessTokenGuard, AdminRoleGuard)
  @HttpCode(200)
  @Delete('/:id')
  async delete(@Param('id') id: string) {
      return this.purchaseService.delete(id)
  }
}
