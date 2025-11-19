import { Employee } from '../../domain/entities/Employee';
import { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository';
import prisma from '../prisma/client';

export class PrismaEmployeeRepository implements IEmployeeRepository {
  async findByCedula(cedula: string): Promise<Employee | null> {
    return prisma.employee.findUnique({ where: { cedula } }) as any;
  }
  async findById(id: string): Promise<Employee | null> {
    return prisma.employee.findUnique({ where: { id } }) as any;
  }
  async findAll(): Promise<Employee[]> {
    return prisma.employee.findMany() as any;
  }
  async search(term?: string, sedeId?: string): Promise<Employee[]> {
    return prisma.employee.findMany({
      where: {
        AND: [
          term ? {
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { lastName: { contains: term, mode: 'insensitive' } },
              { cedula: { contains: term } }
            ]
          } : {},
          sedeId ? { sedeId } : {}
        ]
      }
    }) as any;
  }
  async create(data: Omit<Employee, 'id'>): Promise<Employee> {
    return prisma.employee.create({ data }) as any;
  }
  async update(id: string, data: Partial<Omit<Employee, 'id'>>): Promise<Employee> {
    return prisma.employee.update({ where: { id }, data }) as any;
  }
  async delete(id: string): Promise<void> {
    await prisma.employee.delete({ where: { id } });
  }
}
