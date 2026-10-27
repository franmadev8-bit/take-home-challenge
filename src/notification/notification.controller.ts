import { BadRequestException, Body, Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUserId } from '../common/current-user-id.decorator.js';
import { NotificationDto } from '../models/NotificationDto.js';

@Controller('notification')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Get('notifications')
  async GetAll(@CurrentUserId() userId: string): Promise<NotificationDto[]> {
    return this.notificationService.Notifications(userId);
  }

  @Post('create')
  async Create(@CurrentUserId() userId: string, @Body() notification: NotificationDto): Promise<NotificationDto> {
    notification.userId = userId;
    const typeExist = await this.notificationService.NotificacionByType(userId, notification.type);
    if (typeExist) throw new BadRequestException(`Ya existe una notificacion de tipo ${notification.type}, no se pueden duplicar.`)
    return this.notificationService.CreateNotification(notification);
  }

  @Put('update')
  async Update(@CurrentUserId() userId: string, @Body() notification: NotificationDto) {
    notification.userId = userId;
    const typeExist = await this.notificationService.NotificacionByType(userId, notification.type);
    if (typeExist) throw new BadRequestException(`Ya existe una notificacion de tipo ${notification.type}, no se pueden duplicar.`)
    return this.notificationService.UpdateNotification(notification);
  }

  @Delete('drop')
  async Delete(id: string): Promise<boolean> {
    return await this.notificationService.DeleteNotification(id);
  }
}
