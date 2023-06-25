import { Body, Controller, HttpCode, Patch, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { RegistrationDto } from './dto/registration.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('registration')
  async registration(@Body() dto: RegistrationDto) {
    return this.authService.registration(dto)
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @Patch('logout')
  async logout(@Req() req: Request) {
    return this.authService.logout(req.header('Authorization'))
  }
  
  @UseGuards(RefreshTokenGuard)
  @HttpCode(200)
  @Patch('refresh-tokens')
  async refresh(@Req() req: Request) {
    return this.authService.refreshTokens(req.header('Authorization'))
  }
}
