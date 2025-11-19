import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, MapPin, X } from 'lucide-react';
import { Sede } from '../../types';
import api from '../../utils/api';

type SedeFormState = {
  name: string;
  address: string;
  coordinates: string;
  isActive: boolean;
};

const emptyForm: SedeFormState = {
  name: '',
  address: '',
  coordinates: '',
  isActive: true,
};

const SedesSection: React.FC = () => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSede, setEditingSede] = useState<Sede | null>(null);
  const [form, setForm] = useState<SedeFormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Cargar sedes desde el backend ---
  const loadSedes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await api.get('/sedes');

      // Normalizamos para que encaje con el tipo Sede del front
      const normalized: Sede[] = (res.data as any[]).map((s) => ({
        id: s.id,
        name: s.name,
        address: s.address ?? '',
        coordinates: s.coordinates ?? '',
        isActive: s.isActive,
      }));

      setSedes(normalized);
    } catch {
      setError('No se pudieron cargar las sedes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSedes();
  }, []);

  // --- Abrir modal en modo crear ---
  const handleAddSede = (): void => {
    setEditingSede(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  // --- Abrir modal en modo editar ---
  const handleEditSede = (sede: Sede): void => {
    setEditingSede(sede);
    setForm({
      name: sede.name,
      address: sede.address ?? '',
      coordinates: sede.coordinates ?? '',
      isActive: sede.isActive,
    });
    setShowModal(true);
  };

  // --- Guardar (crear o actualizar) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        coordinates: form.coordinates.trim() || undefined,
        isActive: form.isActive,
      };

      if (editingSede) {
        // UPDATE
        const res = await api.put(`/sedes/${editingSede.id}`, payload);
        const updated = res.data as any;

        const normalized: Sede = {
          id: updated.id,
          name: updated.name,
          address: updated.address ?? '',
          coordinates: updated.coordinates ?? '',
          isActive: updated.isActive,
        };

        setSedes((prev) =>
          prev.map((s) => (s.id === normalized.id ? normalized : s))
        );
      } else {
        // CREATE
        const res = await api.post('/sedes', payload);
        const created = res.data as any;

        const normalized: Sede = {
          id: created.id,
          name: created.name,
          address: created.address ?? '',
          coordinates: created.coordinates ?? '',
          isActive: created.isActive,
        };

        setSedes((prev) => [...prev, normalized]);
      }

      setShowModal(false);
    } catch {
      setError('No se pudo guardar la sede');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sedes</h1>
          <p className="text-gray-600">Gestiona las ubicaciones de trabajo</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddSede}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Sede
        </motion.button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center mb-6">
          <MapPin className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Registro Sedes</h3>
          <p className="text-gray-600">Ubicaciones y direcciones registradas</p>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500">Cargando sedes...</p>
        ) : sedes.length === 0 ? (
          <p className="text-center text-gray-500">
            No hay sedes registradas todavía.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sedes.map((sede) => (
              <motion.div
                key={sede.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {sede.name}
                    </h4>
                    <p className="text-sm text-gray-600">{sede.address}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEditSede(sede)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <Edit className="w-5 h-5" />
                  </motion.button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>Coordenadas: {sede.coordinates}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        sede.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sede.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Crear/Editar Sede */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingSede ? 'Editar Sede' : 'Nueva Sede'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Ej: Sede Principal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  placeholder="Ej: Calle 100 #15-20, Bogotá"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coordenadas
                </label>
                <input
                  type="text"
                  value={form.coordinates}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, coordinates: e.target.value }))
                  }
                  placeholder="Ej: 4.6751, -74.0564"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                  className="h-4 w-4 text-indigo-600 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Sede activa
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SedesSection;
