import { IUnitOfWork } from '../repositories/IUnitOfWork';

export class ReportService {
  constructor(private uow: IUnitOfWork) {}

  async generateCsv(from: Date, to: Date, sedeId?: string, search?: string): Promise<string> {
    const records = await this.uow.timeRecords.findByDateRange(from, to, sedeId, search);
    const header = 'Empleado;Cedula;Sede;Fecha;Tipo;Coordenadas;HorasExtra';
    const lines = records.map(r => {
      const employeeName = (r as any).employee?.name + ' ' + (r as any).employee?.lastName;
      const cedula = (r as any).employee?.cedula;
      const sedeName = (r as any).sede?.name ?? '';
      const date = new Date(r.timestamp).toISOString();
      const type = r.recordType;
      const coords = r.coordinates ?? '';
      const extra = r.overtimeMin ?? 0;
      return `${employeeName};${cedula};${sedeName};${date};${type};${coords};${extra}`;
    });
    return [header, ...lines].join('\n');
  }
}
