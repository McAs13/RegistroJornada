import { IUnitOfWork } from '../../domain/repositories/IUnitOfWork';
import { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository';
import { ITimeRecordRepository } from '../../domain/repositories/ITimeRecordRepository';
import { ISedeRepository } from '../../domain/repositories/ISedeRepository';

export class PrismaUnitOfWork implements IUnitOfWork {
  employees: IEmployeeRepository;
  timeRecords: ITimeRecordRepository;
  sedes: ISedeRepository;

  constructor(
    employees: IEmployeeRepository,
    timeRecords: ITimeRecordRepository,
    sedes: ISedeRepository
  ) {
    this.employees = employees;
    this.timeRecords = timeRecords;
    this.sedes = sedes;
  }

  async commit(): Promise<void> {
    // Prisma maneja transacciones por operación en este ejemplo.
    // Aquí podrías implementar una transacción compuesta si fuera necesario.
    return;
  }
}
