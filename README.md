# Take home challenge

API en NestJS para registrar notificaciones y enviarlas a uno o varios usuarios registrados por tres canales:

- Push en tiempo real, con Server-Sent Events (SSE).
- Email, por SMTP (Gmail) con un template HTML.
- SMS, con Twilio.

## Stack

- NestJS 12 + TypeScript
- Prisma 7 + SQLite
- RxJS para el canal de eventos SSE
- Nodemailer (SMTP)
- Twilio (SMS)
- Swagger (`@nestjs/swagger`)

## Requisitos

- Node.js 24 o superior

## Instalación

-Pedir las variables de entorno (archivo .env) al propietario del proyecto

Ejecutar en orden:

1). Primero instalar las dependencias

```bash
npm install
```

2). Crear base de datos Prisma

```bash
npx prisma migrate dev
npx prisma generate
npm run start:dev
```

## Estructura

## Autenticación

| Método | Ruta             | Descripción                                                |
| ------ | ---------------- | ---------------------------------------------------------- |
| `POST` | `/auth/register` | Registra un usuario (`name`, `email`, `password`, `phone`) |
| `POST` | `/auth/login`    | Inicia sesión y setea la cookie `access_token`             |
| `POST` | `/auth/logout`   | Borra la cookie                                            |

### Notificaciones (requieren estar logueado)

| Método | Ruta                          | Descripción                                           |
| ------ | ----------------------------- | ----------------------------------------------------- |
| `GET`  | `/notification/notifications` | Lista las notificaciones del usuario                  |
| `GET`  | `/notification/stream`        | Stream SSE con las notificaciones push en tiempo real |
| `POST` | `/notification/create` | Registra una notificación (`message`, `type`) |
| `POST` | `/notification/send` | Envía la notificación a los usuarios indicados (`userIds`, `idNotification`) |
| `PUT` | `/notification/update` | Actualiza una notificación registrada. (`id`, `message`, `type`, `userId`, `read`, `createdAt`)|
| `PATCH` | `/notification/:id/read` | Marca una notificación como leída |
| `DELETE` | `/notification/drop/:id` | Elimina una notificación |

## Autenticación
1). Registro y Login normal, el `access_token` se guarda en la `cookie` no hace falta enviarlo en el header `authorization`.
2). Cada token que se genera se calcula con la misma firma pero con un valor aleatorio distinto para que cada token sea distinto.
3). En el `Logout` el token pasa a la tabla `RevokedToken` donde se guardan los tokens revocados y el guard rechaza el token aunque todavía no haya vencido. 
4). Los registros de tokens ya vencidos se eliminan automáticamente en cada logout.
5). Para evitar duplicados se usa `prisma.upsert` con un update vacio, si ya existe el registro que no haga nada y si no que lo inserte.  

**Cierre de sesión.** Cada token tiene un id único (`jti`). Al hacer logout, ese id se guarda en la tabla `RevokedToken` y el guard rechaza el token aunque todavía no haya vencido. Los registros de tokens ya vencidos se eliminan automáticamente en cada logout.

## Cómo probar

1). Registro de usuario `POST /auth/register` y login `POST /auth/login` (el `access_token` queda guardado en la cookie).
2). Abrir canal de comunicación para envio de notificaciones push `GET /notification/stream`.
3). Crear una notificación o varias según el tipo `POST /notification/create`. Como son 3 tipos de notificaciones no se pueden repetir. (Ej. crear 2 notificaciones de tipo `sms`).
4). Listar las notificaciones que registraste `GET /notification/notifications`
5). Elegir una y enviarla con el endpoint `POST /notification/send`.



## Consideraciones

** Cuenta de prueba de Twilio. ** Las cuentas de prueba solo permiten enviar plantillas predefinidas, no texto propio, y solo a números verificados en la consola de Twilio. Por eso existe la variable TWILIO_TRIAL_TEMPLATE, el SMS se envía con esa plantilla en lugar del mensaje de la notificación. Con una cuenta paga se envía el mensaje real, sin cambios en el código.

** SSE en memoria. ** El canal de eventos vive en la memoria del proceso. Funciona con una sola instancia de la API; para varias instancias haría falta un intermediario como Redis.