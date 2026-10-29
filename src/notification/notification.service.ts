import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { Notifications } from '../generated/prisma/client.js';
import { NotificationDto } from '../models/NotificationDto.js';
import { NotificationStreamService } from './notification.stream.service.js';
import { UserRepository } from '../repositories/UsersRepository.js';
import { SmtpMailService } from './smtp.service.js';
import { notificationEmailTemplate } from './notification-email.template.js';
import { ConfigService } from '@nestjs/config';
import { SmsService } from './sms.service.js';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        private readonly notification: NotificationRepository,
        private readonly stream: NotificationStreamService,
        private readonly users: UserRepository,
        private readonly mail: SmtpMailService,
        private readonly sms: SmsService,
        private config: ConfigService
    ) { }

    private toDto(notification: Notifications): NotificationDto {
        return new NotificationDto({
            message: notification.message,
            type: notification.type,
            read: notification.read
        });
    }

    private async sendEmails(notification: NotificationDto, userIds: string[]) {
        const users = await this.users.Get({ where: { id: { in: userIds } } });
        const appName = this.config.get<string>('APP_NAME') ?? 'Notificaciones';
        const { subject, html, text } = notificationEmailTemplate({ message: notification.message, type: notification.type, appName });

        const results = await Promise.allSettled(
            users.map((u) => this.mail.send({ to: u.email, subject, html, text }))
        );

        results
            .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
            .forEach((r) => this.logger.warn(`No se pudo enviar un mail: ${r.reason}`));
    }

    private async sendSms(notification: NotificationDto, userIds: string[]) {
        const users = await this.users.Get({ where: { id: { in: userIds } } });

        const results = await Promise.allSettled(
            users.map((u) => this.sms.send(u.phone!, notification.message))
        );

        results
            .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
            .forEach((r) => this.logger.warn(`No se pudo enviar un SMS: ${r.reason}`));
    }

    async send(ownerId: string, userIds: string[], idNotification: string): Promise<NotificationDto> {
        const uniqueIds = [...new Set(userIds)];
        const notification = await this.notification.GetOne({ where: { user: { id: ownerId }, id: idNotification } });
        if (!notification) throw new NotFoundException('Notificación no encontrada.');

        const dto = this.toDto(notification);

        switch (notification.type) {
            case 'email':
                this.sendEmails(dto, uniqueIds).catch((err: Error) => {
                    this.logger.error(`Error enviando mails: ${err.message}`);
                    throw new BadRequestException(err.message)
                });
                break;
            case 'sms':
                this.sendSms(dto, uniqueIds).catch((err: Error) => {
                    this.logger.error(`Error enviando SMS: ${err.message}`);
                    throw new BadRequestException(err.message);
                });
                break;
            case 'push':
                uniqueIds.forEach((u) => this.stream.publish(u, dto))
                break;
            default: break;
        }

        return dto;
    }

    async Notifications(id: string): Promise<NotificationDto[]> {
        const result = await this.notification.Get({ where: { user: { id: id } } });
        return result.map(n => this.toDto(n));
    }

    async NotificacionByType(userId: string, type: string): Promise<NotificationDto[]> {
        const result = await this.notification.Get({ where: { user: { id: userId }, type: type } })
        return result.map(n => this.toDto(n));
    }

    async CreateNotification(notification: NotificationDto): Promise<NotificationDto> {
        const result = await this.notification.Create({
            data: {
                userId: notification.userId,
                message: notification.message,
                type: notification.type,
                read: notification.read,
            }
        });
        return this.toDto(result);
    }

    async UpdateNotification(notification: NotificationDto): Promise<NotificationDto> {
        const result = await this.notification.Update({
            data: {
                message: notification.message,
                type: notification.type,
                read: notification.read
            },
            where: {
                id: notification.id
            }
        });
        return this.toDto(result);
    }

    async DeleteNotification(id: string): Promise<boolean> {
        await this.notification.Delete({ where: { id: id } })
        return true;
    }

    async markAsRead(userId: string, id: string): Promise<NotificationDto> {
        const [notification] = await this.notification.Get({ where: { id, userId } });
        if (!notification) throw new NotFoundException('Notificación no encontrada.');

        const updated = await this.notification.Update({ where: { id }, data: { read: true } });
        return this.toDto(updated);
    }
}
