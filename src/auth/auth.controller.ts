import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { UserDto } from '../models/UserDto.js';
import type { Response } from 'express'
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService
  ) { }

  @Post('login')
  async Login(
    @Body('email') email: string,
    @Body('password') userPasword: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, user } = await this.authService.Login(email, userPasword);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Number(this.config.get('JWT_EXPIRES_IN_SECONDS') ?? 3600) * 1000
    })
    const { password, ...rest } = user;
    return { rest }
  }

  @Post('register')
  async Register(@Body() user: UserDto) {
    const { id, ...rest } = await this.authService.Register(user);
    return rest;
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }
}
