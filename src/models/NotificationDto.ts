import { NotificationStatus, NotificationType } from "../types/notification.types.js";

export class NotificationDto {
    id: string;
    message: string;
    type: string;
    status: string;
    userId: string;
    read: boolean = false;

    constructor(init: Partial<NotificationDto>) {
        Object.assign(this, init);
    }
}