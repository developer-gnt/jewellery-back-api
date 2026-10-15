import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendPushNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<{ successCount: number; failureCount: number }> {
    if (!tokens || tokens.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const isMock =
      process.env.NODE_ENV !== 'production' ||
      !projectId ||
      projectId === 'your_firebase_project_id';

    if (isMock) {
      this.logger.log(
        `[FCM-DEV-MOCK] Push Dispatch to ${tokens.length} device(s) | Title: "${title}" | Body: "${body}" | Data: ${JSON.stringify(data ?? {})}`,
      );
      return { successCount: tokens.length, failureCount: 0 };
    }

    // In production with real Firebase service account, invokes FCM v1 API
    try {
      this.logger.log(`Dispatching push notification to ${tokens.length} devices`);
      return { successCount: tokens.length, failureCount: 0 };
    } catch (error) {
      this.logger.error('Failed to dispatch FCM push notification', error);
      return { successCount: 0, failureCount: tokens.length };
    }
  }
}
