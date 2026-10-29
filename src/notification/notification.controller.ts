import { BadRequestException, Body, Controller, Delete, Get, Post, Put, Sse, UseGuards, MessageEvent, Patch, Param, ParseUUIDPipe } from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUserId } from '../common/current-user-id.decorator.js';
import { NotificationDto } from '../models/NotificationDto.js';
import { interval, map, merge, Observable } from 'rxjs';
import { NotificationStreamService } from './notification.stream.service.js';
import { SendNotificationDto } from '../models/SendNotificationDto.js';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCreateNotification, ApiDeleteNotification, ApiNotifications, ApiReadNotification, ApiSendNotification, ApiUpdateNotification } from './notification.docs.js';

@Controller('notification')
@UseGuards(AuthGuard)
@ApiTags('Notificaciones')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly stream: NotificationStreamService,
  ) { }


  @Get('notifications')
  @ApiNotifications()
  async GetAll(@CurrentUserId() userId: string): Promise<NotificationDto[]> {
    return this.notificationService.Notifications(userId);
  }

  @Sse('stream')
  @ApiOperation({ summary: 'Abre el canal para el socket de notificaciones push (ejecutar primero).' })
  subscribe(@CurrentUserId() userId: string): Observable<MessageEvent> {
    const heartbeat$ = interval(30000).pipe(map((): MessageEvent => ({ type: 'ping', data: '' })));
    return merge(this.stream.streamFor(userId), heartbeat$);
  }

  @Post('send')
  @ApiSendNotification()
  send(@CurrentUserId() userId: string, @Body() dto: SendNotificationDto) {
    return this.notificationService.send(userId, dto.userIds, dto.idNotification);
  }

  @Post('create')
  @ApiCreateNotification()
  async Create(@CurrentUserId() userId: string, @Body() notification: NotificationDto): Promise<NotificationDto> {
    notification.userId = userId;
    const typeExist = await this.notificationService.NotificacionByType(userId, notification.type);
    if (typeExist) throw new BadRequestException(`Ya existe una notificacion de tipo ${notification.type}, no se pueden duplicar.`)
    return this.notificationService.CreateNotification(notification);
  }

  @Put('update')
  @ApiUpdateNotification()
  async Update(@CurrentUserId() userId: string, @Body() notification: NotificationDto): Promise<NotificationDto> {
    notification.userId = userId;
    const typeExist = await this.notificationService.NotificacionByType(userId, notification.type);
    if (typeExist) throw new BadRequestException(`Ya existe una notificacion de tipo ${notification.type}, no se pueden duplicar.`)
    return this.notificationService.UpdateNotification(notification);
  }

  @Patch(':id/read')
  @ApiReadNotification()
  markAsRead(@CurrentUserId() userId: string, @Param('id', ParseUUIDPipe) id: string): Promise<NotificationDto> {
    return this.notificationService.markAsRead(userId, id);
  }

  @Delete('drop')
  @ApiDeleteNotification()
  async Delete(id: string): Promise<boolean> {
    return await this.notificationService.DeleteNotification(id);
  }
}
