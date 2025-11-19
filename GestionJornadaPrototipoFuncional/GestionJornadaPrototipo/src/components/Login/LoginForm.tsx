import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [cedula, setCedula] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!cedula.trim()) {
      setError('Por favor ingresa tu cédula');
      return;
    }

    const success = await login(cedula.trim());
    if (!success) {
      // Ahora el mensaje asume que la API no encontró / no aceptó la cédula
      setError('No se encontró un empleado con esta cédula. Verifica la información.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 mb-6 mx-auto w-32 h-32 flex items-center justify-center"
          >
            <h1 className="text-white text-3xl font-bold">LOGO</h1>
          </motion.div>
          <h2 className="text-white text-xl font-semibold">Login Usuario</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl"
        >
          <div className="text-center mb-6">
            <div className="bg-indigo-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-gray-800 text-lg font-medium">Iniciar Sesión</h3>
            <p className="text-gray-600 text-sm mt-1">
              Ingresa tu cédula para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="cedula"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Cédula
              </label>
              <input
                type="text"
                id="cedula"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Ingresa tu número de cédula"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </motion.button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 text-center">
              Ingresa la cédula con la que estás registrado en el sistema.
              <br />
              Si tienes problemas para iniciar sesión, contacta al administrador.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginForm;
