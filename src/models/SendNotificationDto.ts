import { ArrayNotEmpty, IsArray, IsString, IsUUID, MaxLength } from 'class-validator';

export class SendNotificationDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsUUID('all', { each: true })
    userIds!: string[];

    @IsString()
    @MaxLength(500)
    message!: string;

    @IsString()
    type!: string;
}