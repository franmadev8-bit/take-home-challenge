import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { PasswordHasherService } from '../common/PasswordHasherService.js';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard.js';
import { UserRepository } from '../repositories/UsersRepository.js';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      secret: config.get<string>('JWT_SECRET'),
      signOptions: { expiresIn: Number(config.get('JWT_EXPIRES_IN_SECONDS') ?? 3600) },
    }),

  })],
  exports: [AuthGuard, JwtModule],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, PasswordHasherService, AuthGuard],
})
export class AuthModule { }
