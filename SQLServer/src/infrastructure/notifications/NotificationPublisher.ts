import { INotificationPublisher } from '../../domain/notifications/INotificationPublisher';
import { TimeRecord } from '../../domain/entities/TimeRecord';
import { NotificationChannelFactory } from './NotificationChannelFactory';
import { NotificationType } from '../../domain/notifications/NotificationType';

export class NotificationPublisher implements INotificationPublisher {
  private factory: NotificationChannelFactory;

  constructor(factory: NotificationChannelFactory) {
    this.factory = factory;
  }

  async publishRecordCreated(record: TimeRecord): Promise<void> {
    const channel = this.factory.createChannel(NotificationType.Console);
    await channel.send('Nuevo registro de jornada creado', {
      employeeId: record.employeeId,
      recordType: record.recordType,
      timestamp: record.timestamp
    });
  }
}
