import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString, IsUUID, MaxLength } from 'class-validator';

export class SendNotificationDto {
    
    @ApiProperty()
    @IsArray()
    @ArrayNotEmpty()
    @IsUUID('all', { each: true })
    userIds!: string[];

    @ApiProperty()
    @IsString()
    @MaxLength(500)
    idNotification!: string;
}