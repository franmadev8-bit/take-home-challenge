export class UserDto {
    id?: string;
    name?: string | null;
    email: string;
    password: string;
    createdAt: Date;

    constructor(init: Partial<UserDto>) {
        Object.assign(this, init);
    }
}