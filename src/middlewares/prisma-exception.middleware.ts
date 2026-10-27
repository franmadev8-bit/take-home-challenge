import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionMiddleware implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    const map: Record<string, [number, string]> = {
      'P2002': [409, 'El recurso ya existe'],
      'P2025': [404, 'Recurso no encontrado'],
      'P2003': [400, 'Referencia inválida'],
    }

    console.error('PrismaExceptionMiddleware', exception.code, exception.message);
    const [status, message] = map[exception.code] ?? [500, 'Error en la base de datos'];
    return res.status(status).json({ statusCode: status, message });
  }
}
