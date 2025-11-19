import { IEmployeeRepository } from '../repositories/IEmployeeRepository';
import { Employee } from '../entities/Employee';

export class AuthService {
  constructor(private employeeRepo: IEmployeeRepository) {}

  async loginByCedula(cedula: string): Promise<Employee> {
    const emp = await this.employeeRepo.findByCedula(cedula);
    if (!emp) {
      throw new Error('Empleado no encontrado');
    }
    return emp;
  }
}
