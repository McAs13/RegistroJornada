import React from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, MapPin, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'empleados', label: 'Empleados', icon: Users },
    { id: 'registros', label: 'Registros', icon: FileText },
    { id: 'sedes', label: 'Sedes', icon: MapPin },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 }
  ];

  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 bg-indigo-900 h-screen flex flex-col"
    >
      <div className="p-6 border-b border-indigo-800">
        <h1 className="text-white text-xl font-bold">LOGO</h1>
        <p className="text-indigo-300 text-sm mt-1">Dashboard app</p>
      </div>

      <nav className="flex-1 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                isActive 
                  ? 'bg-indigo-700 text-white border-r-3 border-blue-400' 
                  : 'text-indigo-300 hover:text-white hover:bg-indigo-800'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </motion.button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-indigo-800">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
