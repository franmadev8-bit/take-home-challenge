import { IsOptional, Matches } from "class-validator";

export class UserDto {
    id?: string;
    name?: string | null;
    email: string;

    @IsOptional()
    @Matches(/^\+\d{8,15}$/, { message: 'El teléfono debe estar en formato internacional, por ejemplo +5493492123456' })
    phone?: string;
    
    password: string;
    createdAt: Date;

    constructor(init: Partial<UserDto>) {
        Object.assign(this, init);
    }
}