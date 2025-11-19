import { TimeRecord } from '../entities/TimeRecord';

export interface INotificationPublisher {
  publishRecordCreated(record: TimeRecord): Promise<void>;
}
