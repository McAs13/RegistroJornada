export interface IOvertimeCalculator {
  calculateOvertimeMinutes(entryTime: Date, exitTime: Date): number;
}
