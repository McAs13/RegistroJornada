import { NotificationType } from '../../domain/notifications/NotificationType';
import { INotificationChannel } from '../../domain/notifications/INotificationChannel';
import { ConsoleNotificationChannel } from './ConsoleNotificationChannel';

export class NotificationChannelFactory {
  createChannel(type: NotificationType): INotificationChannel {
    switch (type) {
      case NotificationType.Console:
      default:
        return new ConsoleNotificationChannel();
    }
  }
}
