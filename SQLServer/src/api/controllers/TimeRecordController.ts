import { Request, Response } from 'express';
import { TimeRecordService } from '../../domain/services/TimeRecordService';

export class TimeRecordController {
  constructor(private service: TimeRecordService) {}

  create = async (req: Request, res: Response) => {
    try {
      const { cedula, recordType, coordinates, sedeId } = req.body;
      const photo = (req as any).file as Express.Multer.File | undefined;
      const photoUrl = photo ? `/uploads/${photo.filename}` : undefined;

      if (!cedula || !recordType) {
        return res.status(400).json({ message: 'Cedula y recordType son requeridos' });
      }

      const record = await this.service.createRecord({
        employeeCedula: cedula,
        sedeId,
        recordType,
        coordinates,
        photoUrl
      });

      res.status(201).json(record);
    } catch (err: any) {
      res.status(400).json({ message: err.message || 'Error al crear registro' });
    }
  };

  list = async (req: Request, res: Response) => {
    const { dateFrom, dateTo, sedeId, search } = req.query as any;
    const from = dateFrom ? new Date(dateFrom) : new Date('1970-01-01');
    const to = dateTo ? new Date(dateTo) : new Date();
    const records = await this.service.listByDateRange(from, to, sedeId, search);
    res.json(records);
  };
}
