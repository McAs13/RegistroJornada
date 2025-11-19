import { IEmployeeRepository } from './IEmployeeRepository';
import { ITimeRecordRepository } from './ITimeRecordRepository';
import { ISedeRepository } from './ISedeRepository';

export interface IUnitOfWork {
  employees: IEmployeeRepository;
  timeRecords: ITimeRecordRepository;
  sedes: ISedeRepository;
  commit(): Promise<void>;
}
