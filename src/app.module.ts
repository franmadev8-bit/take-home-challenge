import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from './notification/notification.module.js';
import { APP_FILTER } from '@nestjs/core';
import { PrismaExceptionMiddleware } from './middlewares/prisma-exception.middleware.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, PrismaModule, JwtModule, NotificationModule],
  providers: [{ provide: APP_FILTER, useClass: PrismaExceptionMiddleware }]
})
export class AppModule { }
