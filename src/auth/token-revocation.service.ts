import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class TokenRevocationService {
    constructor(private readonly prisma: PrismaService) { }

    async revoke(jti: string, exp: number) {
        await this.prisma.$transaction([
            this.prisma.revokedToken.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
            this.prisma.revokedToken.upsert({
                where: { jti },
                create: { jti, expiresAt: new Date(exp * 1000) },
                update: {},
            }),
        ])
    }

    async isRevoked(jti: string): Promise<boolean> {
        const found = await this.prisma.revokedToken.findUnique({ where: { jti } });
        return found !== null;
    }
}