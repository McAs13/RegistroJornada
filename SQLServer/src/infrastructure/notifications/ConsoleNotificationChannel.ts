import { INotificationChannel } from '../../domain/notifications/INotificationChannel';

export class ConsoleNotificationChannel implements INotificationChannel {
  async send(message: string, payload?: any): Promise<void> {
    console.log('[Notification]', message, payload ?? '');
  }
}
