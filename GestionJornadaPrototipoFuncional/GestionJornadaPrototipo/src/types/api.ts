export interface Sede {
    id: string;
    name: string;
    address?: string;
    coordinates?: string;
    isActive: boolean;
}

export interface Employee {
    id: string;
    name: string;
    lastName: string;
    cedula: string;
    email?: string;
    phone?: string;
    isAdmin: boolean;
    sedeId?: string;
    sede?: Sede;
}

export interface TimeRecord {
    id: string;
    employeeId: string;
    sedeId?: string;
    recordType: 'entrada' | 'salida';
    coordinates?: string;
    latitude?: number;
    longitude?: number;
    inSite?: boolean;
    photoUrl?: string | null;
    timestamp: string;
    overtimeMin?: number | null;
    employee?: Employee;
    sede?: Sede;
}

export interface DashboardSummary {
    totalEmployees: number;
    activeToday: number;
    sedesCount: number;
    averageHours: number;
}
