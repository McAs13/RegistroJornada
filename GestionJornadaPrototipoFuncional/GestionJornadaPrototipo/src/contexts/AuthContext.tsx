import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User, AuthContextType } from '../types';
import api from '../utils/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Este tipo refleja lo que devuelve tu backend en POST /auth/login
interface BackendEmployee {
  id: string;
  name: string;
  lastName: string;
  cedula: string;
  email?: string | null;
  phone?: string | null;
  isAdmin: boolean;
  sedeId?: string | null;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (cedula: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Llamada real al backend
      const { data } = await api.post<BackendEmployee>('/auth/login', {
        cedula,
      });

      // Mapear lo que viene del backend a tu tipo User
      const loggedUser: User = {
        id: data.id,
        name: data.name,
        lastName: data.lastName,
        cedula: data.cedula,
        email: data.email ?? '',
        phone: data.phone ?? '',
        isAdmin: data.isAdmin,
        sedeId: data.sedeId ?? undefined,
      };

      setUser(loggedUser);
      localStorage.setItem('currentUser', JSON.stringify(loggedUser));
      return true;
    } catch (error) {
      // 404 / 400 / error de red → login fallido
      console.error('Error en login', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
