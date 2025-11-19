import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
} from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { User, Sede } from '../../types';
import api from '../../utils/api';

const emptyForm: Omit<User, 'id'> = {
  name: '',
  lastName: '',
  cedula: '',
  email: '',
  phone: '',
  isAdmin: false,
  sedeId: '',
};

const EmpleadosSection: React.FC = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [form, setForm] = useState<Omit<User, 'id'>>(emptyForm);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Cargar empleados desde el backend
  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data } = await api.get('/employees');

      const mapped: User[] = data.map((e: any) => ({
        id: e.id,
        name: e.name,
        lastName: e.lastName,
        cedula: e.cedula,
        email: e.email ?? '',
        phone: e.phone ?? '',
        isAdmin: e.isAdmin,
        sedeId: e.sedeId ?? '',
      }));

      setEmployees(mapped);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los empleados');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Cargar sedes reales desde el backend
  const loadSedes = async () => {
    try {
      const { data } = await api.get('/sedes');
      const mapped: Sede[] = data.map((s: any) => ({
        id: s.id,
        name: s.name,
        address: s.address ?? '',
        coordinates: s.coordinates ?? '',
        isActive: s.isActive,
      }));
      setSedes(mapped);
    } catch (err) {
      console.error(err);
      // no es crítico para la pantalla, así que solo mostramos en consola
    }
  };

  useEffect(() => {
    loadEmployees();
    loadSedes();
  }, []);

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.cedula.includes(searchTerm)
  );

  // 🔹 Abrir modal en modo "nuevo"
  const handleAddEmployee = (): void => {
    setEditingEmployee(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  // 🔹 Abrir modal en modo "editar"
  const handleEditEmployee = (employee: User): void => {
    setEditingEmployee(employee);
    setForm({
      name: employee.name,
      lastName: employee.lastName,
      cedula: employee.cedula,
      email: employee.email,
      phone: employee.phone,
      isAdmin: employee.isAdmin,
      sedeId: employee.sedeId ?? '',
    });
    setShowModal(true);
  };

  // 🔹 Eliminar empleado
  const handleDeleteEmployee = async (employeeId: string): Promise<void> => {
    if (!confirm('¿Estás seguro de que quieres eliminar este empleado?')) return;

    try {
      setIsSaving(true);
      setError(null);
      await api.delete(`/employees/${employeeId}`);
      await loadEmployees();
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar el empleado');
    } finally {
      setIsSaving(false);
    }
  };

  // 🔹 Actualizar form desde los inputs
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 🔹 Guardar (crear / actualizar)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        name: form.name.trim(),
        lastName: form.lastName.trim(),
        cedula: form.cedula.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        isAdmin: form.isAdmin,
        sedeId: form.sedeId || null, // aquí ya va el id REAL de la sede
      };

      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee.id}`, payload);
      } else {
        await api.post('/employees', payload);
      }

      await loadEmployees();
      setShowModal(false);
      setEditingEmployee(null);
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar el empleado');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
          <p className="text-gray-600">
            Gestiona la información de los empleados
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddEmployee}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Empleado
        </motion.button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar empleados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {isLoading && (
          <div className="px-6 py-4 text-sm text-gray-500">
            Cargando empleados...
          </div>
        )}
        {error && (
          <div className="px-6 py-4 text-sm text-red-500">{error}</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cédula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sede
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!isLoading && filteredEmployees.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-4 text-sm text-gray-500"
                    colSpan={5}
                  >
                    No se encontraron empleados.
                  </td>
                </tr>
              )}

              {filteredEmployees.map((employee) => {
                const sede = sedes.find((s) => s.id === employee.sedeId);

                return (
                  <motion.tr
                    key={employee.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {employee.name} {employee.lastName}
                        </div>
                        {employee.isAdmin && (
                          <span className="text-xs text-indigo-600">
                            Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.cedula}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sede ? sede.name : 'Sin sede'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{employee.email}</div>
                      <div>{employee.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditEmployee(employee)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={isSaving}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula
                </label>
                <input
                  type="text"
                  name="cedula"
                  value={form.cedula}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sede
                  </label>
                  <select
                    name="sedeId"
                    value={form.sedeId ?? ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">(Sin sede)</option>
                    {sedes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center mt-6">
                  <input
                    id="isAdmin"
                    name="isAdmin"
                    type="checkbox"
                    checked={form.isAdmin}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isAdmin"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Es administrador
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EmpleadosSection;
