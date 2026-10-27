import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { UserDto } from '../models/UserDto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async Login(@Body('email') email: string, @Body('password') password: string): Promise<string> {
    return await this.authService.Login(email, password);
  }

  @Post('register')
  async Register(@Body() user: UserDto) {
    const { id, ...rest } = await this.authService.Register(user);
    return rest;
  }
}
