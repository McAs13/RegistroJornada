import { Sede } from '../entities/Sede';

export interface ISedeRepository {
  findById(id: string): Promise<Sede | null>;
  findAll(): Promise<Sede[]>;
  create(data: Omit<Sede, 'id'>): Promise<Sede>;
  update(id: string, data: Partial<Omit<Sede, 'id'>>): Promise<Sede>;
  delete(id: string): Promise<void>;
}
