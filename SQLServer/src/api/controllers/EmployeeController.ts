import { Request, Response } from 'express';
import { EmployeeService } from '../../domain/services/EmployeeService';

export class EmployeeController {
  constructor(private service: EmployeeService) {}

  list = async (req: Request, res: Response) => {
    const { search, sedeId } = req.query as any;
    const employees = await this.service.list(search, sedeId);
    res.json(employees);
  };

  create = async (req: Request, res: Response) => {
    const data = req.body;
    const emp = await this.service.create({
      name: data.name,
      lastName: data.lastName,
      cedula: data.cedula,
      email: data.email,
      phone: data.phone,
      isAdmin: data.isAdmin ?? false,
      sedeId: data.sedeId
    });
    res.status(201).json(emp);
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const emp = await this.service.update(id, req.body);
    res.json(emp);
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.service.delete(id);
    res.status(204).send();
  };
}
