import { IOvertimeCalculator } from './IOvertimeCalculator';

// Jornada base: 8 horas (480 minutos)
const STANDARD_MINUTES = 8 * 60;

export class BasicOvertimeCalculator implements IOvertimeCalculator {
  calculateOvertimeMinutes(entryTime: Date, exitTime: Date): number {
    const diffMs = exitTime.getTime() - entryTime.getTime();
    const minutes = Math.floor(diffMs / 60000);
    return Math.max(0, minutes - STANDARD_MINUTES);
  }
}
