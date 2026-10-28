import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import { NotificationController } from './notification.controller.js';
import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { NotificationStreamService } from './notification.stream.service.js';
import { SmtpMailService } from './smtp.service.js';
import { UserRepository } from '../repositories/UsersRepository.js';
import { SmsService } from './sms.service.js';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    NotificationStreamService,
    UserRepository,
    SmtpMailService,
    SmsService
  ],
})
export class NotificationModule { }
