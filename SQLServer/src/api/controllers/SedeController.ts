import { Request, Response } from 'express';
import { SedeService } from '../../domain/services/SedeService';

export class SedeController {
  constructor(private service: SedeService) {}

  list = async (_req: Request, res: Response) => {
    const sedes = await this.service.list();
    res.json(sedes);
  };

  create = async (req: Request, res: Response) => {
    const data = req.body;
    const sede = await this.service.create({
      name: data.name,
      address: data.address,
      coordinates: data.coordinates,
      isActive: data.isActive ?? true
    });
    res.status(201).json(sede);
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const sede = await this.service.update(id, req.body);
    res.json(sede);
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.service.delete(id);
    res.status(204).send();
  };
}
