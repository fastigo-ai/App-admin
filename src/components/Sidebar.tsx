import { 
  LayoutDashboard, 
  Wrench, 
  Users, 
  Calendar, 
  UserCheck, 
  CreditCard,
  Settings,
  LayoutGrid,
  Tag,
  LogOut,
  X,
  Bell
} from 'lucide-react';

interface SidebarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  isMobileOpen?: boolean;
  onClose?: () => void;
  onLogout: () => void;
}

const Sidebar = ({ activeScreen, setActiveScreen, isMobileOpen, onClose, onLogout }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'engineers', label: 'Engineers', icon: Users },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const sidebarClasses = `
    fixed left-0 top-0 h-full bg-white shadow-xl border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out
    w-64 lg:translate-x-0
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `;

  return (
    <div className={sidebarClasses}>
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Door2fy</h1>
            <p className="text-xs text-gray-500">Admin Dashboard</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <nav className="mt-6 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveScreen(item.id);
                if (onClose) onClose();
              }}
              className={`w-full flex items-center px-6 py-3 text-left transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center px-6 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 rounded-lg font-medium"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;