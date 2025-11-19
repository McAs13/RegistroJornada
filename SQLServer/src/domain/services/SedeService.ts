import { ISedeRepository } from '../repositories/ISedeRepository';
import { Sede } from '../entities/Sede';

export class SedeService {
  constructor(private repo: ISedeRepository) {}

  async list(): Promise<Sede[]> {
    return this.repo.findAll();
  }

  async create(data: Omit<Sede, 'id'>): Promise<Sede> {
    return this.repo.create(data);
  }

  async update(id: string, data: Partial<Omit<Sede, 'id'>>): Promise<Sede> {
    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
