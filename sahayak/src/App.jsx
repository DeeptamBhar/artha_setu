import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardLayout from './layouts/DashboardLayout';
import ClientsDashboard from './pages/ClientsDashboard';
import DiscoveryHub from './pages/DiscoveryHub';
import GeospatialOracle from './pages/GeospatialOracle';
import SmartForms from './pages/SmartForms';
import LoginPage from './pages/LoginPage';

function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'login' or 'dashboard'
  const [currentTab, setCurrentTab] = useState('Clients');
  
  if (currentView === 'login') {
    return <LoginPage onLogin={() => setCurrentView('dashboard')} />;
  }

  return (
    <DashboardLayout 
      activeTab={currentTab} 
      setActiveTab={setCurrentTab}
      onLogout={() => setCurrentView('login')}
    >
      <div className="relative w-full h-full flex flex-1">
        <AnimatePresence mode="wait">
          {currentTab === 'Clients' && (
            <motion.div 
              key="clients"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute inset-0 flex flex-1 w-full h-full"
            >
              <DiscoveryHub />
            </motion.div>
          )}
          {currentTab === 'Analytics' && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute inset-0 flex flex-1 w-full h-full p-8 overflow-hidden bg-surface-container-lowest"
            >
              <GeospatialOracle />
            </motion.div>
          )}
          {currentTab === 'Smart Forms' && (
            <motion.div 
              key="smartforms"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute inset-0 flex flex-1 w-full h-full p-8 overflow-hidden bg-surface-container-lowest"
            >
              <SmartForms />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

export default App;
