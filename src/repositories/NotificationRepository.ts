import { Injectable } from "@nestjs/common";
import { BaseRepository } from "./BaseRepository.js";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class NotificationRepository extends BaseRepository<'Notifications'> {
    constructor(prismaService: PrismaService) {
        super(prismaService, 'Notifications');
    }
}