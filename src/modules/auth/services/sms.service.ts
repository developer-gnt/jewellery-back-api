import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtpSms(mobile: string, otp: string): Promise<boolean> {
    const apiUrl = this.configService.get<string>('MESSAGEBOT_API_URL', 'https://api.messagebot.in');
    const apiKey = this.configService.get<string>('MESSAGEBOT_API_KEY', '');
    const senderId = this.configService.get<string>('MESSAGEBOT_SENDER_ID', 'ZEWARML');
    const isDev = process.env.NODE_ENV !== 'production' || !apiKey || apiKey === 'your_messagebot_api_key';

    const message = `Your Zewar Mahal verification OTP is ${otp}. Valid for 2 minutes. Please do not share this OTP with anyone.`;

    if (isDev) {
      console.log('\n┌──────────────────────────────────────────────┐');
      console.log(`│ 🔐 ZEWAR MAHAL OTP CODE:  ${otp}             │`);
      console.log(`│ 📱 Mobile: +91 ${mobile.padEnd(28)} │`);
      console.log(`│ 💡 Dev Bypass OTP: 123456                    │`);
      console.log('└──────────────────────────────────────────────┘\n');
      this.logger.log(`[SMS-DEV-MOCK] To: ${mobile} | OTP: ${otp} | Message: ${message}`);
      return true;
    }

    try {
      const response = await fetch(`${apiUrl}/api/v1/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          to: mobile,
          sender: senderId,
          message,
        }),
      });

      if (!response.ok) {
        this.logger.error(`SMS sending failed with status ${response.status}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Error invoking SMS API', error);
      return false;
    }
  }
}
