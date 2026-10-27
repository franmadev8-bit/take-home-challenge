import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { Notifications } from '../generated/prisma/client.js';
import { NotificationDto } from '../models/NotificationDto.js';

@Injectable()
export class NotificationService {
    constructor(private readonly notification: NotificationRepository) { }

    toDto(notification: Notifications): NotificationDto {
        return new NotificationDto({
            message: notification.message,
            status: notification.status,
            type: notification.type,
            read: notification.read
        });
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
                status: 'sent'
            }
        });
        return this.toDto(result);
    }

    async UpdateNotification(notification: NotificationDto): Promise<NotificationDto> {
        const result = await this.notification.Update({
            data: {
                message: notification.message,
                status: notification.status,
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
}
