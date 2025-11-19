export interface Sede {
  id: string;
  name: string;
  address?: string | null;
  coordinates?: string | null;
  isActive: boolean;
}
