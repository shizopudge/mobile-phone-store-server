import { Controller, Delete, Get, HttpCode, NotFoundException, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    return this.usersService.getOne(+id)

  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @Delete()
  async delete(@Req() req: Request) {
    return this.usersService.delete(req.header('Authorization'))
  }
}
