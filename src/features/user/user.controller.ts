import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './dto/update-user.dto';
import { PasswordGuard } from '../../core/guards/password.guard';
import { GetProductsDto } from '../product/dto/get-products.dto';
import { PurchaseStatus } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    return this.usersService.getOne(id)
  }

  @UseGuards(AccessTokenGuard)
  @Get('/current/profile')
  async getCurrentUser(@Req() req: Request) {
    return this.usersService.getCurrentUser(req.header('Authorization'))
  }

  @UsePipes(new ValidationPipe())
  @UseGuards(AccessTokenGuard, PasswordGuard)
  @Put('/current/profile')
  async update(@Req() req: Request, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.header('Authorization'), dto)
  }

  @UseGuards(AccessTokenGuard)
  @Get('/purchases/all')
  async getUserPurchases(@Req() req: Request, @Query('page') page: string = '1', @Query('limit') limit: string = '10', @Query('query') query: string = '', @Query('sort') sort: string = 'desc', @Query('status') status?: PurchaseStatus) {
    return this.usersService.getUserPurchases(req.header('Authorization'), +page, +limit, query.toUpperCase(), sort, status)
  }

  @UseGuards(AccessTokenGuard, PasswordGuard)
  @HttpCode(200)
  @Delete()
  async delete(@Req() req: Request) {
    return this.usersService.delete(req.header('Authorization'))
  }

  @UseGuards(AccessTokenGuard)
  @Patch('/cart/:id')
  async toggleCart(@Param('id') id: string, @Req() req: Request) {
    return this.usersService.toggleCart(id, req.header('Authorization'))
  }

  @UseGuards(AccessTokenGuard)
  @Patch('/wishlist/:id')
  async toggleWishlist(@Param('id') id: string, @Req() req: Request) {
    return this.usersService.toggleWishlist(id, req.header('Authorization'))
  }

  @UseGuards(AccessTokenGuard)
  @Get('/cart/products')
  async getCurrentUserCart(@Req() req: Request, @Query() dto: GetProductsDto) {
    return this.usersService.getCurrentUserCart(req.header('Authorization'), +(dto.page ?? '1'), +(dto.limit ?? '10'), (dto.query ?? '').toUpperCase(), dto.sort ?? 'desc', JSON.parse(dto.withDiscount ?? 'false'), JSON.parse(dto.newArrival ?? 'false'), +(dto.minCost ?? 0), +(dto.maxCost ?? Number.MAX_VALUE))
  }

  @UseGuards(AccessTokenGuard)
  @Get('/wishlist/products')
  async getCurrentUserWishlist(@Req() req: Request, @Query() dto: GetProductsDto) {
    return this.usersService.getCurrentUserWishlist(req.header('Authorization'), +(dto.page ?? '1'), +(dto.limit ?? '10'), (dto.query ?? '').toUpperCase(), dto.sort ?? 'desc', JSON.parse(dto.withDiscount ?? 'false'), JSON.parse(dto.newArrival ?? 'false'), +(dto.minCost ?? 0), +(dto.maxCost ?? Number.MAX_VALUE))
  }

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(200)
  @Patch('/current/profile/image')
  async uploadImage(@Req() req: Request, @UploadedFile() image: Express.Multer.File) {
    return this.usersService.uploadImage(req.header('Authorization'), image)
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @Delete('/current/profile/image')
  async deleteImage(@Req() req: Request) {
    return this.usersService.deleteImage(req.header('Authorization'))
  }
}
