import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

    private async sendEmails(notifications: { userId: string; message: string; type: string }[]) {
        const users = await this.users.Get({ where: { id: { in: notifications.map((n) => n.userId) } } });
        const emailById = new Map(users.map((u) => [u.id, u.email]));
        const appName = this.config.get<string>('APP_NAME') ?? 'Notificaciones';

        const results = await Promise.allSettled(
            notifications.map(async (n) => {
                const to = emailById.get(n.userId);
                if (!to) return;

                const { subject, html, text } = notificationEmailTemplate({ message: n.message, type: n.type, appName });
                await this.mail.send({ to, subject, html, text });
            }),
        );

        results
            .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
            .forEach((r) => this.logger.warn(`No se pudo enviar un mail: ${r.reason}`));
    }

    private async sendSms(notifications: { userId: string; message: string }[]) {
        const users = await this.users.Get({ where: { id: { in: notifications.map((n) => n.userId) } } });
        const phoneById = new Map(users.map((u) => [u.id, u.phone]));

        const results = await Promise.allSettled(
            notifications.map(async (n) => {
                const to = phoneById.get(n.userId);
                if (!to) return;
                await this.sms.send(to, n.message);
            }),
        );

        results
            .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
            .forEach((r) => this.logger.warn(`No se pudo enviar un SMS: ${r.reason}`));
    }

    async send(userIds: string[], message: string, type: string): Promise<NotificationDto[]> {
        const uniqueIds = [...new Set(userIds)];

        const created = await Promise.all(
            uniqueIds.map((userId) => this.notification.Create({ data: { userId, message, type } })),
        );

        const dtos = created.map((n) => this.toDto(n));
        created.forEach((n, i) => this.stream.publish(n.userId, dtos[i]));

        if (type === 'email') {
            this.sendEmails(created).catch((err: Error) => this.logger.error(`Error enviando mails: ${err.message}`));
        }

        if (type === 'sms') {
            this.sendSms(created).catch((err: Error) => this.logger.error(`Error enviando SMS: ${err.message}`));
        }
        return dtos;
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
        if (!notification) throw new NotFoundException('Notificación no encontrada');

        const updated = await this.notification.Update({ where: { id }, data: { read: true } });
        return this.toDto(updated);
    }
}
