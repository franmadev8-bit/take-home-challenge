import { NotificationStatus, NotificationType } from "../types/notification.types.js";

export class NotificationDto {
    id: string;
    message: string;
    type: string;
    userId: string;
    read: boolean = false;
    createdAt: Date;
    
    constructor(init: Partial<NotificationDto>) {
        Object.assign(this, init);
    }
}