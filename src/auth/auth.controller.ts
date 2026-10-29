import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { UserDto } from '../models/UserDto.js';
import type { Response } from 'express'
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { ApiLogin, ApiLogout, ApiRegister } from './auth.docs.js';
import { TokenRevocationService } from './token-revocation.service.js';
import { AuthGuard, JwtPayload } from './auth.guard.js';

@Controller('auth')
@ApiTags('Autenticación')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
    private readonly revocation: TokenRevocationService,
  ) { }


  @Post('login')
  @ApiLogin()
  async Login(@Body('email') email: string, @Body('password') userPassword: string, @Res({ passthrough: true }) res: Response) {
    const { accessToken, user } = await this.authService.Login(email, userPassword);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Number(this.config.get('JWT_EXPIRES_IN_SECONDS') ?? 3600) * 1000
    })

    const { password, ...rest } = user;
    return { rest };
  }

  @Post('register')
  @ApiRegister()
  async Register(@Body() user: UserDto) {
    const { id, password, ...rest } = await this.authService.Register(user);
    return rest;
  }

  @Post('logout')
  @ApiLogout()
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request & { user: JwtPayload }, @Res({ passthrough: true }) res: Response) {
    await this.revocation.revoke(req.user.jti, req.user.exp);
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }
}
