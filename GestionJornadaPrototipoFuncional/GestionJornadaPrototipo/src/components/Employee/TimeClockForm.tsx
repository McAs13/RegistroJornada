import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, LogOut, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const TimeClockForm: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recordType, setRecordType] = useState<'entrada' | 'salida'>('entrada');
  const [coordinates, setCoordinates] = useState(''); // se llena con geolocalización
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);

  // Foto
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reloj
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Geolocalización
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        () => {
          // fallback si el usuario no da permiso
          setCoordinates('6.2442, -75.5812'); // por ejemplo Medellín
        }
      );
    } else {
      setCoordinates('6.2442, -75.5812');
    }
  }, []);

  // Limpieza de preview cuando cambia la foto
  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [photoFile]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('es-CO', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handlePhotoButtonClick = (): void => {
    setStatusMessage(null);
    setStatusType(null);
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!user) return;

    setIsSubmitting(true);
    setStatusMessage(null);
    setStatusType(null);

    try {
      const formData = new FormData();
      formData.append('cedula', user.cedula);
      formData.append('recordType', recordType);
      if (coordinates) formData.append('coordinates', coordinates);
      if (user.sedeId) formData.append('sedeId', user.sedeId);
      if (photoFile) formData.append('photo', photoFile);

      await api.post('/records', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setStatusMessage(
        `${recordType === 'entrada' ? 'Entrada' : 'Salida'} registrada exitosamente`
      );
      setStatusType('success');
      setPhotoFile(null); // opcional limpiar foto después
    } catch (err) {
      console.error(err);
      setStatusMessage('No se pudo registrar el turno. Intenta nuevamente.');
      setStatusType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <h1 className="text-xl font-bold">LOGO</h1>
          </div>
          <span className="text-lg">
            {user ? `${user.name} ${user.lastName}` : 'Login Usuario'}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className="bg-red-500/80 hover:bg-red-600/80 backdrop-blur-sm p-2 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="bg-indigo-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <div className="w-6 h-6 bg-indigo-600 rounded-full"></div>
            </div>
            <h3 className="text-gray-800 text-lg font-medium">
              Registro de Turno
            </h3>
          </div>

          {/* Reloj */}
          <div className="text-center mb-6">
            <motion.div
              key={currentTime.getSeconds()}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-gray-800 mb-1"
            >
              {formatTime(currentTime)}
            </motion.div>
            <p className="text-gray-600 text-sm capitalize">
              {formatDate(currentTime)}
            </p>
          </div>

          {/* Mensaje de estado */}
          {statusMessage && (
            <div
              className={`mb-4 text-sm px-3 py-2 rounded ${statusType === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
                }`}
            >
              {statusMessage}
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            {/* Cédula */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cédula
              </label>
              <input
                type="text"
                value={user?.cedula || ''}
                readOnly
                className="w-full px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg text-gray-700 font-medium"
              />
            </div>

            {/* Foto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto
              </label>

              {/* input real oculto que abre cámara/galería */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoChange}
              />

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handlePhotoButtonClick}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                type="button"
              >
                <span className="text-gray-600 text-sm truncate">
                  {photoFile
                    ? photoFile.name
                    : 'Tocar para tomar foto o seleccionar imagen'}
                </span>
                <Camera className="w-5 h-5 text-gray-400" />
              </motion.button>

              {photoPreview && (
                <div className="mt-3 flex items-center space-x-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border">
                    <img
                      src={photoPreview}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <ImageIcon className="w-4 h-4 mr-1" />
                    Vista previa de la foto
                  </div>
                </div>
              )}
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <div className="flex items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-gray-700 flex-1 font-mono text-sm">
                  {coordinates || 'Obteniendo ubicación...'}
                </span>
                <MapPin className="w-5 h-5 text-gray-400 ml-2" />
              </div>
            </div>

            {/* Tipo de registro */}
            <div>
              <div className="flex items-center space-x-6 justify-center py-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="entrada"
                    checked={recordType === 'entrada'}
                    onChange={(e) =>
                      setRecordType(e.target.value as 'entrada')
                    }
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-gray-700 font-medium">
                    Entrada
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="salida"
                    checked={recordType === 'salida'}
                    onChange={(e) =>
                      setRecordType(e.target.value as 'salida')
                    }
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-gray-700 font-medium">
                    Salida
                  </span>
                </label>
              </div>
            </div>

            {/* Botón enviar */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isSubmitting || !user}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isSubmitting
                ? 'Registrando...'
                : recordType === 'entrada'
                  ? 'Registrar entrada'
                  : 'Registrar salida'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TimeClockForm;
