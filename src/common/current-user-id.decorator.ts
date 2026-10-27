import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../auth/auth.guard.js';


export const CurrentUserId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    const userId = request.user?.sub;

    if (!userId) throw new UnauthorizedException('Falta el usuario');
    return userId;
});
