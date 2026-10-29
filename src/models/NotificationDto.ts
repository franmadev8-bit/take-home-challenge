import { ApiProperty } from "@nestjs/swagger";


export class NotificationDto {

    @ApiProperty()
    id: string;

    @ApiProperty()
    message: string;

    @ApiProperty()
    type: string;
    
    @ApiProperty()
    userId: string;

    @ApiProperty()
    read: boolean = false;
    
    @ApiProperty()
    createdAt: Date;
    
    constructor(init: Partial<NotificationDto>) {
        Object.assign(this, init);
    }
}