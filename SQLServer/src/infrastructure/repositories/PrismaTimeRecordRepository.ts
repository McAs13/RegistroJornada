import { ITimeRecordRepository } from '../../domain/repositories/ITimeRecordRepository';
import { TimeRecord } from '../../domain/entities/TimeRecord';
import prisma from '../prisma/client';

export class PrismaTimeRecordRepository implements ITimeRecordRepository {
  async create(data: Omit<TimeRecord, 'id'>): Promise<TimeRecord> {
    return prisma.timeRecord.create({ data: {
      ...data,
      recordType: data.recordType,
    } }) as any;
  }

  async findByDateRange(from: Date, to: Date, sedeId?: string, search?: string): Promise<TimeRecord[]> {
    return prisma.timeRecord.findMany({
      where: {
        timestamp: { gte: from, lte: to },
        sedeId: sedeId || undefined,
        employee: search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { cedula: { contains: search } }
          ]
        } : undefined
      },
      orderBy: { timestamp: 'desc' },
      include: { employee: true, sede: true }
    }) as any;
  }

  async findLastEntryForDay(employeeId: string, day: Date): Promise<TimeRecord | null> {
    const from = new Date(day);
    from.setHours(0,0,0,0);
    const to = new Date(day);
    to.setHours(23,59,59,999);
    return prisma.timeRecord.findFirst({
      where: {
        employeeId,
        recordType: 'entrada',
        timestamp: { gte: from, lte: to }
      },
      orderBy: { timestamp: 'desc' }
    }) as any;
  }
}
