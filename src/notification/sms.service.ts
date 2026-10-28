import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import twilio, { Twilio } from 'twilio';


@Injectable()
export class SmsService {
    private readonly client: Twilio;
    private readonly from: string;
    private readonly trialTemplate?: string;

    constructor(config: ConfigService) {
        this.client = twilio(
            config.getOrThrow<string>('TWILIO_ACCOUNT_SID'),
            config.getOrThrow<string>('TWILIO_AUTH_TOKEN'),
        );
        this.from = config.getOrThrow<string>('TWILIO_FROM');
        this.trialTemplate = config.get<string>('TWILIO_TRIAL_TEMPLATE');
    }

    async send(to: string, body: string) {
        await this.client.messages.create({ from: this.from, to, body: this.trialTemplate ?? body });
    }
}