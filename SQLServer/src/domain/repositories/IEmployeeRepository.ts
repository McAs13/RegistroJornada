import { Employee } from '../entities/Employee';

export interface IEmployeeRepository {
  findByCedula(cedula: string): Promise<Employee | null>;
  findById(id: string): Promise<Employee | null>;
  findAll(): Promise<Employee[]>;
  search(term?: string, sedeId?: string): Promise<Employee[]>;
  create(data: Omit<Employee, 'id'>): Promise<Employee>;
  update(id: string, data: Partial<Omit<Employee, 'id'>>): Promise<Employee>;
  delete(id: string): Promise<void>;
}
