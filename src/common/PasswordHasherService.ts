import { Injectable } from "@nestjs/common";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

@Injectable()
export class PasswordHasherService {
    private readonly scriptAsync = promisify(scrypt);
    private readonly KEY_LENGTH = 64;

    async Hash(password: string): Promise<string> {
        const salt = await randomBytes(16).toString('hex');
        const key = (await this.scriptAsync(password, salt, this.KEY_LENGTH)) as Buffer;
        return `${salt}:${key.toString('hex')}`
    }

    async Verify(password: string, hash: string) {
        const [salt, hex] = hash.split(':');

        if (!salt || !hex) return false;

        const key = (await this.scriptAsync(password, salt, this.KEY_LENGTH)) as Buffer;
        const storedKey = Buffer.from(hex, 'hex');

        return key.length === storedKey.length && timingSafeEqual(key, storedKey);
    }
}