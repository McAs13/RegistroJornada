import { IUnitOfWork } from '../repositories/IUnitOfWork';
import { IOvertimeCalculator } from '../overtime/IOvertimeCalculator';
import { INotificationPublisher } from '../notifications/INotificationPublisher';
import { TimeRecord } from '../entities/TimeRecord';

function parseCoordinates(coord?: string | null): { lat?: number; lon?: number } {
  if (!coord) return {};
  const parts = coord.split(',');
  if (parts.length !== 2) return {};
  const lat = parseFloat(parts[0].trim());
  const lon = parseFloat(parts[1].trim());
  if (Number.isNaN(lat) || Number.isNaN(lon)) return {};
  return { lat, lon };
}

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2)**2;
  const c = 2 * Math.asin(Math.sqrt(a));
  return R * c;
}

export class TimeRecordService {
  constructor(
    private uow: IUnitOfWork,
    private overtimeCalculator: IOvertimeCalculator,
    private notificationPublisher: INotificationPublisher
  ) {}

  async createRecord(input: {
    employeeCedula: string;
    sedeId?: string;
    recordType: 'entrada' | 'salida';
    coordinates?: string;
    photoUrl?: string;
  }): Promise<TimeRecord> {
    const employee = await this.uow.employees.findByCedula(input.employeeCedula);
    if (!employee) throw new Error('Empleado no encontrado');

    const sede = input.sedeId ? await this.uow.sedes.findById(input.sedeId) : null;

    const { lat, lon } = parseCoordinates(input.coordinates);
    let inSite: boolean | undefined = undefined;
    if (lat != null && lon != null && sede?.coordinates) {
      const sedeCoords = parseCoordinates(sede.coordinates);
      if (sedeCoords.lat != null && sedeCoords.lon != null) {
        const dist = distanceMeters(lat, lon, sedeCoords.lat, sedeCoords.lon);
        inSite = dist <= 50; // 50m de radio
      }
    }

    const now = new Date();
    const record: Omit<TimeRecord, 'id'> = {
      employeeId: employee.id,
      sedeId: input.sedeId,
      recordType: input.recordType,
      coordinates: input.coordinates,
      latitude: lat,
      longitude: lon,
      inSite,
      photoUrl: input.photoUrl,
      timestamp: now,
      overtimeMin: null
    };

    const created = await this.uow.timeRecords.create(record);

    // Si es salida, calcular horas extra
    if (input.recordType === 'salida') {
      const lastIn = await this.uow.timeRecords.findLastEntryForDay(employee.id, now);
      if (lastIn) {
        const overtime = this.overtimeCalculator.calculateOvertimeMinutes(
          new Date(lastIn.timestamp),
          now
        );
        created.overtimeMin = overtime;
      }
    }

    await this.notificationPublisher.publishRecordCreated(created);
    await this.uow.commit();

    return created;
  }

  async listByDateRange(from: Date, to: Date, sedeId?: string, search?: string) {
    return this.uow.timeRecords.findByDateRange(from, to, sedeId, search);
  }
}
