import { TimeRecord } from '../entities/TimeRecord';

export interface ITimeRecordRepository {
  create(data: Omit<TimeRecord, 'id'>): Promise<TimeRecord>;
  findByDateRange(from: Date, to: Date, sedeId?: string, search?: string): Promise<TimeRecord[]>;
  findLastEntryForDay(employeeId: string, day: Date): Promise<TimeRecord | null>;
}
