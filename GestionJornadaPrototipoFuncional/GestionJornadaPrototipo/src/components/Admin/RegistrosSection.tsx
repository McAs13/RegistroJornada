import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Calendar } from 'lucide-react';
import { TimeRecord, Sede } from '../../types';
import api from '../../utils/api';

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

const RegistrosSection: React.FC = () => {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSede, setFilterSede] = useState<'all' | string>('all');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 paginación en frontend
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Helper: clave de fecha en horario local (YYYY-MM-DD)
  const getLocalDateKey = (date: Date): string => {
    // "en-CA" => 2025-11-17 (formato ISO local)
    return date.toLocaleDateString('en-CA');
  };

  // --- Helper para agrupar entradas y salidas por empleado + día ---
  const groupApiRecords = (apiRecords: ApiTimeRecord[]): TimeRecord[] => {
    const map = new Map<string, TimeRecord>();

    for (const r of apiRecords) {
      const ts = new Date(r.timestamp);

      // ANTES: const dateKey = ts.toISOString().slice(0, 10); // UTC
      const dateKey = getLocalDateKey(ts); // fecha local YYYY-MM-DD
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
          // guardamos la fecha como inicio del día local
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

      // Cargar sedes
      const sedesRes = await api.get('/sedes');
      const sedesNormalized: Sede[] = (sedesRes.data as any[]).map((s) => ({
        id: s.id,
        name: s.name,
        address: s.address ?? '',
        coordinates: s.coordinates ?? '',
        isActive: s.isActive,
      }));
      setSedes(sedesNormalized);

      // Cargar registros
      const res = await api.get('/records');
      const apiRecords = res.data as ApiTimeRecord[];
      const grouped = groupApiRecords(apiRecords);
      setRecords(grouped);
    } catch {
      setError('No se pudieron cargar los registros');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // 🔹 cuando cambias filtros, volvemos a la página 1
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterSede, dateFrom, dateTo]);

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.cedula.includes(searchTerm);

    const matchesSede =
      filterSede === 'all' || record.sedeId === filterSede;

    // --- Filtro por fecha (frontend) ---
    const recordDate = new Date(record.date);
    let matchesDate = true;

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      if (recordDate < from) matchesDate = false;
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (recordDate > to) matchesDate = false;
    }

    return matchesSearch && matchesSede && matchesDate;
  });

  // 🔹 cálculo de paginación
  const total = filteredRecords.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedRecords = filteredRecords.slice(startIndex, endIndex);

  const fromLabel = total === 0 ? 0 : startIndex + 1;
  const toLabel = total === 0 ? 0 : Math.min(endIndex, total);

  const getTimeStatus = (record: TimeRecord): { label: string; color: string } => {
    if (record.timeIn && record.timeOut) {
      return { label: 'Completo', color: 'bg-green-100 text-green-800' };
    } else if (record.timeIn) {
      return { label: 'En progreso', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { label: 'Pendiente', color: 'bg-gray-100 text-gray-800' };
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await api.get('/reports/csv', {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'registros_jornada.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('No se pudo exportar el reporte CSV');
    } finally {
      setExporting(false);
    }
  };

  const handlePrevPage = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setPage((p) => Math.min(totalPages, p + 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registros</h1>
          <p className="text-gray-600">
            Historial de registros de entrada y salida
          </p>
        </div>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            disabled={exporting}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exportando...' : 'Exportar'}
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por empleado o cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterSede}
                  onChange={(e) =>
                    setFilterSede(e.target.value as 'all' | string)
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Todas las sedes</option>
                  {sedes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowDateFilter((v) => !v)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {showDateFilter ? 'Ocultar fecha' : 'Filtrar fecha'}
                </button>
              </div>
            </div>

            {showDateFilter && (
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="sm:w-1/3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="sm:w-1/3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="sm:flex sm:items-end sm:w-1/3">
                  <button
                    type="button"
                    onClick={() => {
                      setDateFrom('');
                      setDateTo('');
                    }}
                    className="mt-2 sm:mt-0 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Limpiar fechas
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="px-6 py-4 text-gray-500">Cargando registros...</p>
          ) : pagedRecords.length === 0 ? (
            <p className="px-6 py-4 text-gray-500">
              No se encontraron registros.
            </p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entrada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salida
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coordenadas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagedRecords.map((record) => {
                  const status = getTimeStatus(record);
                  return (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.employeeName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.cedula}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.timeIn || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.timeOut || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.coordinates}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-sm text-gray-700">
                Mostrando {fromLabel}–{toLabel} de {total} registros
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-white disabled:opacity-50"
                  onClick={handlePrevPage}
                  disabled={safePage <= 1 || total === 0}
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600 self-center">
                  Página {safePage} de {totalPages}
                </span>
                <button
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-white disabled:opacity-50"
                  onClick={handleNextPage}
                  disabled={safePage >= totalPages || total === 0}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrosSection;
