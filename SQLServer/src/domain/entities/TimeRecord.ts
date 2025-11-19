export interface TimeRecord {
  id: string;
  employeeId: string;
  sedeId?: string | null;
  recordType: 'entrada' | 'salida';
  coordinates?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  inSite?: boolean | null;
  photoUrl?: string | null;
  timestamp: Date;
  overtimeMin?: number | null;
}
