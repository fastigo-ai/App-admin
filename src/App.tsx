import React, { useState, useEffect } from 'react';
import { Menu, Loader2 } from 'lucide-react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './screens/Dashboard';
import Services from './screens/Services';
import Engineers from './screens/Engineers';
import Bookings from './screens/Bookings';
import Customers from './screens/Customers';
import Payments from './screens/Payments';
import Categories from './screens/Categories';
import Login from './screens/Login';
import api from './api/api';
import { Toaster } from 'react-hot-toast';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/admin/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
          localStorage.setItem('admin_user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        console.log('Not authenticated');
        localStorage.removeItem('admin_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    try {
      await api.post('/admin/auth/logout');
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setUser(null);
      localStorage.removeItem('admin_user');
      navigate('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  // If not authenticated, only allow access to login
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Helper to determine active screen based on pathname
  const activeScreen = location.pathname.substring(1) || 'dashboard';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <Toaster position="top-right" reverseOrder={false} />
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
        onLogout={handleLogout}
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
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;