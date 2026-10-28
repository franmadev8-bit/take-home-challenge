import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) { }

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

    try {
      request.user = await this.jwt.verifyAsync(token);
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }
  }
}
