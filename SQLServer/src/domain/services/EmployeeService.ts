import { IEmployeeRepository } from '../repositories/IEmployeeRepository';
import { Employee } from '../entities/Employee';

export class EmployeeService {
  constructor(private repo: IEmployeeRepository) {}

  async list(term?: string, sedeId?: string): Promise<Employee[]> {
    if (term || sedeId) {
      return this.repo.search(term, sedeId);
    }
    return this.repo.findAll();
  }

  async create(data: Omit<Employee, 'id'>): Promise<Employee> {
    return this.repo.create(data);
  }

  async update(id: string, data: Partial<Omit<Employee, 'id'>>): Promise<Employee> {
    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
