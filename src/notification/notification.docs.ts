import { applyDecorators } from "@nestjs/common"
import { ApiBadRequestResponse, ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from "@nestjs/swagger"
import { NotificationDto } from "../models/NotificationDto.js"

export const ApiNotifications = () => applyDecorators(
    ApiOperation({ summary: 'Devuelve el listado de notificaciones asociadas a un usuario.' }),
    ApiOkResponse({ type: [NotificationDto] })
)

export const ApiSendNotification = () => applyDecorators(
    ApiOperation({ summary: 'Envia una notificación guardada.' }),
    ApiNotFoundResponse({
        example: {
            statusCode: 404,
            message: 'Notificación no encontrada.',
            error: 'Not Found',
        }
    }),
    ApiBadRequestResponse({
        example: {
            statusCode: 400,
            message: 'message',
            error: 'Bad Request',
        }
    }),
    ApiOkResponse({ type: NotificationDto })
)

export const ApiCreateNotification = () => applyDecorators(
    ApiOkResponse({ type: NotificationDto }),
    ApiOperation({ summary: 'Crea una notificacion en la base de datos.' }),
    ApiBadRequestResponse({
        example: {
            statusCode: 400,
            message: 'Ya existe una notificacion de tipo {type}, no se pueden duplicar.',
            error: 'Bad Request',
        }
    }),
    ApiBody({
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                type: { type: 'string', example: 'sms | email | push' },
            },
            required: ['email', 'password'],
        },
    })
)

export const ApiUpdateNotification = () => applyDecorators(
    ApiOperation({ summary: 'Actualiza una notificación guardada.' }),
    ApiOkResponse({ type: NotificationDto })
)

export const ApiReadNotification = () => applyDecorators(
    ApiOperation({ summary: 'Marca una notificación como leida.' }),
    ApiOkResponse({ type: NotificationDto }),
    ApiNotFoundResponse({
        example: {
            statusCode: 404,
            message: 'Notificación no encontrada.',
            error: 'Not Found',
        }
    }),
)

export const ApiDeleteNotification = () => applyDecorators(
    ApiOperation({ summary: 'Elimina una notificación.' }),
    ApiOkResponse({ type: Boolean })
)