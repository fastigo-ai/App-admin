import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './screens/Dashboard';
import Services from './screens/Services';
import Engineers from './screens/Engineers';
import Bookings from './screens/Bookings';
import Customers from './screens/Customers';
import Payments from './screens/Payments';
import Categories from './screens/Categories';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to determine active screen based on pathname
  const activeScreen = location.pathname.substring(1) || 'dashboard';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Menu className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900">Door2fy</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar Backdrop (Mobile Only) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        activeScreen={activeScreen} 
        setActiveScreen={(screen) => {
          navigate(`/${screen}`);
          setIsSidebarOpen(false);
        }}
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full lg:ml-64 min-h-screen">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard setActiveScreen={(s) => navigate(`/${s}`)} />} />
            <Route path="/services" element={<Services />} />
            <Route path="/engineers" element={<Engineers />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;