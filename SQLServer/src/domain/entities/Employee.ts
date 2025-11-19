export interface Employee {
  id: string;
  name: string;
  lastName: string;
  cedula: string;
  email?: string | null;
  phone?: string | null;
  isAdmin: boolean;
  sedeId?: string | null;
}
