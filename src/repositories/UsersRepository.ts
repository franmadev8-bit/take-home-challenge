import { BaseRepository } from "./BaseRepository.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { Injectable } from "@nestjs/common";


@Injectable()
export class UserRepository extends BaseRepository<'User'> {
    constructor(prismaService: PrismaService) {
        super(prismaService, 'User')
    }
}