import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, MapPin, TrendingUp, Calendar } from 'lucide-react';
import { TimeRecord } from '../../types';
import api from '../../utils/api';

type DashboardSummary = {
  totalEmployees: number;
  activeToday: number;
  totalSedes: number;
  avgHours: number;
};

type ApiEmployee = {
  id: string;
  name: string;
  lastName: string;
  cedula: string;
};

type ApiSede = {
  id: string;
  name: string;
  address?: string | null;
  coordinates?: string | null;
  isActive: boolean;
};

type ApiTimeRecord = {
  id: string;
  employeeId: string;
  sedeId?: string | null;
  recordType: 'entrada' | 'salida';
  coordinates?: string | null;
  timestamp: string; // ISO
  employee?: ApiEmployee;
  sede?: ApiSede;
};

const DashboardSection: React.FC = () => {
  const [stats, setStats] = useState<DashboardSummary>({
    totalEmployees: 0,
    activeToday: 0,
    totalSedes: 0,
    avgHours: 0,
  });

  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [sedes, setSedes] = useState<ApiSede[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper para obtener YYYY-MM-DD en zona horaria local
  const getLocalDateKey = (date: Date): string => {
    // "en-CA" devuelve "YYYY-MM-DD"
    return date.toLocaleDateString('en-CA');
  };

  // agrupa entradas/salidas por empleado + día (usando fecha local)
  const groupApiRecords = (apiRecords: ApiTimeRecord[]): TimeRecord[] => {
    const map = new Map<string, TimeRecord>();

    for (const r of apiRecords) {
      const ts = new Date(r.timestamp);

      // ANTES: const dateKey = ts.toISOString().slice(0, 10);
      const dateKey = getLocalDateKey(ts); // yyyy-mm-dd local
      const key = `${r.employeeId}-${dateKey}`;

      const employeeName = r.employee
        ? `${r.employee.name} ${r.employee.lastName}`
        : 'Empleado';

      const cedula = r.employee?.cedula ?? '';
      const sedeId = r.sedeId ?? r.sede?.id ?? '';

      const timeString = ts.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      });

      let current = map.get(key);
      if (!current) {
        current = {
          id: key,
          employeeId: r.employeeId,
          employeeName,
          cedula,
          // guardamos como inicio del día local
          date: new Date(dateKey).toISOString(),
          timeIn: undefined,
          timeOut: undefined,
          coordinates: r.coordinates ?? '',
          sedeId,
          photo: undefined,
        };
      }

      if (r.recordType === 'entrada') {
        current.timeIn = timeString;
        if (!current.coordinates) current.coordinates = r.coordinates ?? '';
      } else if (r.recordType === 'salida') {
        current.timeOut = timeString;
      }

      map.set(key, current);
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Resumen (empleados, activos hoy, horas, etc.)
      try {
        const summaryRes = await api.get('/dashboard/summary');

        const data = summaryRes.data as {
          totalEmployees?: number;
          activeToday?: number;
          sedesCount?: number;
          averageHours?: number;
        };

        setStats((prev) => ({
          ...prev,
          totalEmployees: data.totalEmployees ?? 0,
          activeToday: data.activeToday ?? 0,
          // totalSedes lo sobreescribimos con /sedes
          totalSedes: prev.totalSedes,
          avgHours: data.averageHours ?? 0,
        }));
      } catch {
        // si falla, dejamos stats por defecto
      }

      // Sedes
      try {
        const sedesRes = await api.get('/sedes');
        const sedesData = sedesRes.data as ApiSede[];
        setSedes(sedesData);
        setStats((prev) => ({
          ...prev,
          totalSedes: sedesData.length,
        }));
      } catch {
        // si /sedes falla, simplemente se queda en 0
      }

      // Registros para actividad hoy / reciente
      const recordsRes = await api.get('/records');
      const apiRecords = recordsRes.data as ApiTimeRecord[];
      const grouped = groupApiRecords(apiRecords);
      setRecords(grouped);
    } catch {
      setError('No se pudo cargar la información del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const todayKey = getLocalDateKey(new Date());

  const todayRecords = records
    .filter((record) => {
      const recordDayKey = getLocalDateKey(new Date(record.date));
      return recordDayKey === todayKey;
    })
    .slice(0, 8);

  const recentActivity = records
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const getSedeName = (sedeId?: string): string => {
    if (!sedeId) return 'Sin sede';
    const s = sedes.find((x) => x.id === sedeId);
    return s ? s.name : sedeId;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Resumen general del sistema</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Empleados
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalEmployees}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activos Hoy</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeToday}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-lg p-3">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sedes</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalSedes}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <div className="flex items-center">
            <div className="bg-orange-100 rounded-lg p-3">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Promedio Horas
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.avgHours}h
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad de Hoy */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border"
        >
          <div className="p-6 border-b">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Actividad de Hoy
              </h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {new Date().toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Cargando actividad...
                </div>
              ) : todayRecords.length > 0 ? (
                todayRecords.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {record.employeeName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Entrada: {record.timeIn || 'Pendiente'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${record.timeOut
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {record.timeOut ? 'Completo' : 'En progreso'}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay registros para hoy</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Actividad Reciente */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border"
        >
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Actividad Reciente
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Últimos registros del sistema
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Cargando actividad...
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay registros recientes.
                </div>
              ) : (
                recentActivity.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {record.employeeName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(record.date).toLocaleDateString('es-CO')}{' '}
                        {record.timeIn ? `- ${record.timeIn}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {getSedeName(record.sedeId)}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardSection;
