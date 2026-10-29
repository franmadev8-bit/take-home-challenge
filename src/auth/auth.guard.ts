import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokenRevocationService } from './token-revocation.service.js';

export interface JwtPayload {
  sub: string;
  email: string;
  jti: string;
  exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly revocation: TokenRevocationService,
  ) { }

  private extractToken(request: Request): string | undefined {
    const fromCookie = request.cookies?.access_token as string | undefined;
    if (fromCookie) return fromCookie;

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext,): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>()
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException();

    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }

    const isRevoked = await this.revocation.isRevoked(payload.jti)
    if (!payload.jti || isRevoked) {
      throw new UnauthorizedException('Sesión cerrada');
    }

    request.user = payload;
    return true;
  }
}
