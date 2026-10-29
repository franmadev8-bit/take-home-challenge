import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../repositories/UsersRepository.js';
import { UserDto } from '../models/UserDto.js';
import { User } from '../generated/prisma/client.js';
import { PasswordHasherService } from '../common/PasswordHasherService.js';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AuthService {

    constructor(
        private readonly userDb: UserRepository,
        private readonly hasher: PasswordHasherService,
        private readonly jwt: JwtService
    ) { }

    private toDto(user: User): UserDto {
        return new UserDto({ id: user.id, email: user.email, name: user.name, createdAt: user.createdAt });
    }

    async Register(user: UserDto): Promise<UserDto> {
        const userExisting = await this.userDb.GetOne({ where: { email: user.email } });

        if (userExisting) throw new UnauthorizedException('El email ya esta registrado.');

        const hash = await this.hasher.Hash(user.password);
        const newUser = await this.userDb.Create({
            data: {
                email: user.email,
                name: user.name,
                password: hash
            }
        })

        return this.toDto(newUser);
    }

    async Login(email: string, dbPasswornd: string) {
        const user = await this.userDb.GetOne({ where: { email: email } });
        const valid = user ? (await this.hasher.Verify(dbPasswornd, user.password)) : false;
        if (!user || !valid) throw new UnauthorizedException('Credenciales invalidas.');

        const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email }, { jwtid: randomUUID() },);
        return { accessToken, user };
    }


}
