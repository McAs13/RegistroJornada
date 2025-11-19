import { Request, Response } from 'express';
import { DashboardService } from '../../domain/services/DashboardService';

export class DashboardController {
  constructor(private service: DashboardService) {}

  summary = async (_req: Request, res: Response) => {
    const summary = await this.service.getSummary();
    res.json(summary);
  };
}
