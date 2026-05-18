import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Wrench, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Tag,
  Layers,
  Calendar,
  TrendingUp,
  X,
  Clock,
  ShieldCheck,
  Zap
} from 'lucide-react';
import ServiceForm from '../components/ServiceForm';
import { getAllServices, deleteService, getCategories, getPlanTypes } from '../api/serviceApi';
import { useDebounce } from '../hooks/useDebounce';
import Pagination from '../components/Pagination';

// --- Internal Service Details Modal ---
const ServiceDetailsModal = ({ service, onClose }: { service: any; onClose: () => void }) => {
  if (!service) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-500">
        {/* Left Side: Image & Key Stats */}
        <div className="md:w-1/2 bg-gray-50 relative">
          {service.image ? (
            <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-50">
              <Wrench className="w-16 h-16 text-blue-200" />
            </div>
          )}
          <div className="absolute top-6 left-6">
            <span className="px-4 py-2 bg-white/90 backdrop-blur rounded-xl text-xs font-bold text-blue-600 shadow-lg">
              {service.category?.name || 'Catalog Item'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg"
          >
            <X className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        {/* Right Side: Details & Analytics */}
        <div className="md:w-1/2 p-8 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1 leading-tight">{service.name}</h2>
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${service.status === 'inactive' ? 'bg-red-500' : 'bg-green-500'}`} />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{service.status || 'Active'}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="hidden md:block p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-900" />
            </button>
          </div>

          <div className="space-y-6">
            <p className="text-gray-500 font-medium text-sm leading-relaxed">
              {service.subtitle || 'A premium quality service provided by Door2fy experts. Guaranteed satisfaction and professional handling.'}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100/50">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Pricing</p>
                <p className="text-2xl font-bold text-blue-900">₹{service.price}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Duration</p>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-amber-600" />
                  <p className="text-xl font-bold text-amber-900">{service.duration || 60}m</p>
                </div>
              </div>
            </div>

            {/* Performance Analytics */}
            <div className="p-6 bg-gray-900 rounded-2xl text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" />
                  Performance
                </h3>
                <span className="px-2 py-0.5 bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest">30 Days</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Bookings</p>
                  <p className="text-3xl font-bold text-emerald-400">{service.bookingCount30Days || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Rating</p>
                  <p className="text-3xl font-bold text-white">4.8</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Included</h3>
              <div className="space-y-2">
                {(service.features || ['Professional Service', 'Guaranteed Quality', 'Expert Support']).map((feat: string, i: number) => (
                  <div key={i} className="flex items-center space-x-2 text-gray-700 text-sm font-medium">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-300 uppercase tracking-widest">
              <div className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                {new Date(service.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                ID: {service._id.slice(-6)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [viewingService, setViewingService] = useState<any>(null);
  
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [planTypes, setPlanTypes] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10
  });

  // URL State
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || 'all';

  // Local Search Input
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 500);

  // Sync debounced search to URL
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (debouncedSearch !== currentSearch) {
      setSearchParams(prev => {
        if (debouncedSearch) {
          prev.set('search', debouncedSearch);
        } else {
          prev.delete('search');
        }
        prev.set('page', '1');
        return prev;
      }, { replace: true });
    }
  }, [debouncedSearch, setSearchParams, searchParams]);

  // 1. Initial Load: Fetch static lookup data only once
  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        setInitialLoading(true);
        const [catRes, planRes] = await Promise.allSettled([
          getCategories(),
          getPlanTypes()
        ]);

        if (catRes.status === 'fulfilled' && catRes.value.success) {
          setCategories(catRes.value.data);
        }
        if (planRes.status === 'fulfilled' && planRes.value.success) {
          setPlanTypes(planRes.value.data);
        }
      } catch (err) {
        console.error('Lookup data fetch failed:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchLookupData();
  }, []);

  // 2. Paginated Load: Fetch services whenever filters change
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllServices({ 
        page, 
        limit: 10, 
        search, 
        category: categoryFilter !== 'all' ? categoryFilter : undefined 
      });
      
      if (res && res.success) {
        setServices(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setError('Failed to load services from server.');
      }
    } catch (err: any) {
      console.error('Services fetch error:', err);
      setError(err.message || 'An error occurred while fetching services.');
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', newPage.toString());
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (val: string) => {
    setSearchParams(prev => {
      if (val === 'all') {
        prev.delete('category');
      } else {
        prev.set('category', val);
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const res = await deleteService(id);
      if (res.success) {
        fetchServices();
      }
    } catch (err) {
      alert('Failed to delete service.');
    }
  };

  const handleSaveService = () => {
    fetchServices();
    setShowForm(false);
    setEditingService(null);
  };

  const getPageNumbers = () => {
    const total = pagination.totalPages;
    const current = pagination.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', total);
      } else if (current >= total - 3) {
        pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }
    return pages;
  };

  if (initialLoading && services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Initializing catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Service Catalog</h1>
          <p className="text-gray-500 mt-1">Manage your service offerings, pricing, and plans.</p>
        </div>
        <button 
          onClick={() => {
            setEditingService(null);
            setShowForm(true);
          }}
          className="flex items-center justify-center space-x-2 bg-gray-900 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl transition-all font-bold shadow-lg shadow-gray-200 hover:shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Services', value: pagination.totalCount, icon: Wrench, color: 'blue' },
          { label: 'Active Categories', value: categories.length, icon: Tag, color: 'emerald' },
          { label: 'Service Plans', value: planTypes.length, icon: Layers, color: 'indigo' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
            <div>
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
            </div>
            <div className={`w-12 h-12 bg-${item.color === 'indigo' ? 'blue' : item.color}-100 rounded-xl flex items-center justify-center text-${item.color === 'indigo' ? 'blue' : item.color}-600`}>
              <item.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="flex-1 lg:w-64 px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/10 outline-none text-sm font-bold text-gray-600 appearance-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          
          <button 
            onClick={fetchServices}
            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center">
          <Tag className="w-5 h-5 mr-3" />
          {error}
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div 
            key={service._id}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            <div className="h-48 relative overflow-hidden bg-gray-50">
              {service.image ? (
                <img 
                  src={service.image} 
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-200">
                  <Wrench className="w-12 h-12 opacity-20" />
                </div>
              )}
              
              <div className="absolute top-4 right-4 flex space-x-2 z-10">
                <button 
                  onClick={() => {
                    setEditingService(service);
                    setShowForm(true);
                  }}
                  className="p-2 bg-white/90 backdrop-blur-sm shadow-sm rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteService(service._id)}
                  className="p-2 bg-white/90 backdrop-blur-sm shadow-sm rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider text-blue-600 shadow-sm">
                  {service.category?.name || 'Item'}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">{service.name}</h3>
              <p className="text-gray-500 font-medium text-xs line-clamp-2 mb-4 leading-relaxed">
                {service.subtitle || 'Premium service offering by Door2fy.'}
              </p>
              
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price</span>
                  <span className="text-lg font-bold text-gray-900">₹{service.price}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</span>
                  <span className="text-xs font-bold text-gray-900">{service.duration ? `${service.duration} mins` : 'N/A'}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                  {service.createdAt ? new Date(service.createdAt).toLocaleDateString() : 'N/A'}
                </div>
                <button 
                  onClick={() => setViewingService(service)}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-[10px] font-bold uppercase tracking-widest"
                >
                  <Eye className="w-4 h-4 mr-1.5" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {services.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Wrench className="w-12 h-12 text-gray-100 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">No services found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Try adjusting your filters or add a new service.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination 
          currentPage={page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Detail Modal */}
      {viewingService && (
        <ServiceDetailsModal 
          service={viewingService} 
          onClose={() => setViewingService(null)} 
        />
      )}

      {showForm && (
        <ServiceForm
          service={editingService}
          categories={categories}
          planTypes={planTypes}
          onClose={() => {
            setShowForm(false);
            setEditingService(null);
          }}
          onSave={handleSaveService}
        />
      )}
    </div>
  );
};

export default Services;