import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiBody, ApiNotAcceptableResponse, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export const ApiLogin = () =>
    applyDecorators(
        ApiOperation({ summary: 'Inicia sesión.' }),
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                },
                required: ['email', 'password'],
            },
        }),
        ApiUnauthorizedResponse({
            example: {
                statusCode: 401,
                message: 'Credenciales invalidas.',
                error: 'Unauthorized',
            },
        }),
        ApiResponse({
            status: 201,
            description: 'Login correcto',
            example: {
                id: 'string',
                name: 'string',
                email: 'string',
                phone: 'string',
                createdAt: '2026-10-29T05:37:00.000Z',
            }
        })
    );


export const ApiRegister = () => applyDecorators(
    ApiOperation({ summary: 'Registro de usuario.' }),
    ApiUnauthorizedResponse({
        example: {
            statusCode: 401,
            message: "El email ya esta registrado.",
            error: "Unauthorized"
        }
    }),
    ApiResponse({
        status: 200, description: 'Login correcto',
        example: {
            name: 'Fran',
            email: 'fran@test.com',
            phone: '+5493492123456',
            createdAt: '2026-10-29T05:37:00.000Z',
        },
    })
);


export const ApiLogout = () => applyDecorators(
    HttpCode(204),
    ApiOperation({ summary: 'Cerrar sesión' }),
    ApiNotAcceptableResponse({ description: 'Not Content' })
);