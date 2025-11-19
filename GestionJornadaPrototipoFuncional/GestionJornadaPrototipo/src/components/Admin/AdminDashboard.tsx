import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../Layout/Sidebar';
import EmpleadosSection from './EmpleadosSection';
import RegistrosSection from './RegistrosSection';
import SedesSection from './SedesSection';
import DashboardSection from './DashboardSection';

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = (): JSX.Element => {
    switch (activeSection) {
      case 'empleados':
        return <EmpleadosSection />;
      case 'registros':
        return <RegistrosSection />;
      case 'sedes':
        return <SedesSection />;
      case 'dashboard':
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
