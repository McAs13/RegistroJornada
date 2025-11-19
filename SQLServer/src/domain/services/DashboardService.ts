import { IUnitOfWork } from '../repositories/IUnitOfWork';

export class DashboardService {
  constructor(private uow: IUnitOfWork) {}

  async getSummary() {
    const employees = await this.uow.employees.findAll();
    const sedes = await this.uow.sedes.findAll();

    const today = new Date();
    const from = new Date(today);
    from.setHours(0,0,0,0);
    const to = new Date(today);
    to.setHours(23,59,59,999);

    const recordsToday = await this.uow.timeRecords.findByDateRange(from, to);

    const activeTodayIds = new Set(recordsToday.map(r => r.employeeId));

    const avgMinutes = recordsToday.length
      ? recordsToday
          .filter(r => r.overtimeMin != null)
          .reduce((acc, r) => acc + (r.overtimeMin || 0), 0) / recordsToday.length + 480
      : 0;

    return {
      totalEmployees: employees.length,
      activeToday: activeTodayIds.size,
      sedesCount: sedes.length,
      averageHours: avgMinutes / 60
    };
  }
}
