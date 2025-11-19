import { Request, Response } from 'express';
import { ReportService } from '../../domain/services/ReportService';

export class ReportController {
  constructor(private service: ReportService) {}

  exportCsv = async (req: Request, res: Response) => {
    const { dateFrom, dateTo, sedeId, search } = req.query as any;
    const from = dateFrom ? new Date(dateFrom) : new Date('1970-01-01');
    const to = dateTo ? new Date(dateTo) : new Date();
    const csv = await this.service.generateCsv(from, to, sedeId, search);
    res.header('Content-Type', 'text/csv');
    res.attachment('reporte_jornada.csv');
    res.send(csv);
  };
}
