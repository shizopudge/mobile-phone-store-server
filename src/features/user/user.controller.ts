import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Put, Req, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './dto/update-user.dto';
import { PasswordGuard } from '../../core/guards/password.guard';

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
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(200)
  @Patch('/current/profile/image')
  async uploadImage(@Req() req: Request, @UploadedFile() image: Express.Multer.File) {
    return this.usersService.uploadImage(req.header('Authorization'), image)
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @Delete('/current/profile/image/:id')
  async deleteImage(@Req() req: Request) {
    return this.usersService.deleteImage(req.header('Authorization'))
  }
}
