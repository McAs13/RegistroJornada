export interface User {
  id: string;
  name: string;
  lastName: string;
  cedula: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  sedeId?: string;
}

export interface TimeRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  cedula: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  coordinates: string;
  sedeId: string;
  photo?: string;
}

export interface Sede {
  id: string;
  name: string;
  address: string;
  coordinates: string;
  isActive: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (cedula: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}
