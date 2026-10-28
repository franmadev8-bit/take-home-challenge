import { Injectable, MessageEvent } from "@nestjs/common";
import { filter, map, Observable, Subject } from "rxjs";
import { NotificationDto } from "../models/NotificationDto.js";

interface NotificationEvent {
    userId: string;
    notification: NotificationDto;
}

@Injectable()
export class NotificationStreamService {
    private readonly events$ = new Subject<NotificationEvent>();

    publish(userId: string, notification: NotificationDto) {
        this.events$.next({ userId, notification });
    }

    streamFor(userId: string): Observable<MessageEvent> {
        return this.events$.pipe(
            filter((event) => event.userId === userId),
            map((event) => ({ type: 'notification', data: event.notification })),
        );
    }
}