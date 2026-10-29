import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, Matches } from "class-validator";

export class UserDto {
    id?: string;

    @ApiPropertyOptional({ type: String, nullable: true })
    name?: string | null;

    @ApiProperty()
    email: string;

    @ApiProperty()
    @IsOptional()
    @Matches(/^\+\d{8,15}$/, { message: 'El teléfono debe estar en formato internacional, por ejemplo +5493492123456' })
    phone?: string;

    @ApiProperty()
    password: string;

    createdAt: Date;

    constructor(init: Partial<UserDto>) {
        Object.assign(this, init);
    }
}