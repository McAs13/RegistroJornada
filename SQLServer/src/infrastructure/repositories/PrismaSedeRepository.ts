import { Sede } from '../../domain/entities/Sede';
import { ISedeRepository } from '../../domain/repositories/ISedeRepository';
import prisma from '../prisma/client';

export class PrismaSedeRepository implements ISedeRepository {
  async findById(id: string): Promise<Sede | null> {
    return prisma.sede.findUnique({ where: { id } }) as any;
  }
  async findAll(): Promise<Sede[]> {
    return prisma.sede.findMany() as any;
  }
  async create(data: Omit<Sede, 'id'>): Promise<Sede> {
    return prisma.sede.create({ data }) as any;
  }
  async update(id: string, data: Partial<Omit<Sede, 'id'>>): Promise<Sede> {
    return prisma.sede.update({ where: { id }, data }) as any;
  }
  async delete(id: string): Promise<void> {
    await prisma.sede.delete({ where: { id } });
  }
}
