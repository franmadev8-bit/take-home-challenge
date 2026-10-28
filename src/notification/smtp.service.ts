import { Injectable } from "@nestjs/common";
import nodemailer, { Transporter } from 'nodemailer';
import { ConfigService } from "@nestjs/config";

export interface MailMessage {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

@Injectable()
export class SmtpMailService {
    private readonly transporter: Transporter;
    private readonly from: string;

    constructor(config: ConfigService) {
        const port = Number(config.getOrThrow<string>('SMTP_PORT'));

        this.transporter = nodemailer.createTransport({
            host: config.getOrThrow<string>('SMTP_HOST'),
            port,
            secure: port === 465,
            auth: {
                user: config.getOrThrow<string>('SMTP_USER'),
                pass: config.getOrThrow<string>('SMTP_PASS'),
            },
        });
        this.from = config.getOrThrow<string>('MAIL_FROM');
    }

    async send(message: MailMessage) {
        await this.transporter.sendMail({ from: this.from, ...message });
    }
}
