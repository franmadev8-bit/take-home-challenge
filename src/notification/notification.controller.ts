import { BadRequestException, Body, Controller, Delete, Get, Post, Put, Sse, UseGuards, MessageEvent, Patch, Param, ParseUUIDPipe } from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUserId } from '../common/current-user-id.decorator.js';
import { NotificationDto } from '../models/NotificationDto.js';
import { interval, map, merge, Observable } from 'rxjs';
import { NotificationStreamService } from './notification.stream.service.js';
import { SendNotificationDto } from '../models/SendNotificationDto.js';
import { writeFileSync } from 'node:fs';
import { notificationEmailTemplate } from './notification-email.template.js';

@Controller('notification')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly stream: NotificationStreamService,
  ) { }

  @Sse('stream')
  subscribe(@CurrentUserId() userId: string): Observable<MessageEvent> {
    const heartbeat$ = interval(30000).pipe(map((): MessageEvent => ({ type: 'ping', data: '' })));
    return merge(this.stream.streamFor(userId), heartbeat$);
  }

  @Post()
  send(@Body() dto: SendNotificationDto) {
    return this.notificationService.send(dto.userIds, dto.message, dto.type);
  }

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

  @Patch(':id/read')
  markAsRead(@CurrentUserId() userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.notificationService.markAsRead(userId, id);
  }
}
