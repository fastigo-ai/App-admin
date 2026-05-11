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

// --- Internal Service Details Modal ---
const ServiceDetailsModal = ({ service, onClose }: { service: any; onClose: () => void }) => {
  if (!service) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-500">
        {/* Left Side: Image & Key Stats */}
        <div className="md:w-1/2 bg-gray-50 relative">
          {service.image ? (
            <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-50">
              <Wrench className="w-20 h-20 text-blue-200" />
            </div>
          )}
          <div className="absolute top-8 left-8">
            <span className="px-6 py-3 bg-white/90 backdrop-blur rounded-[2rem] text-sm font-black text-blue-600 shadow-xl">
              {service.category?.name || 'Catalog Item'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden absolute top-8 right-8 p-3 bg-white rounded-full shadow-lg"
          >
            <X className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        {/* Right Side: Details & Analytics */}
        <div className="md:w-1/2 p-10 overflow-y-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-2 leading-tight">{service.name}</h2>
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${service.status === 'inactive' ? 'bg-red-500' : 'bg-green-500'}`} />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{service.status || 'Active'}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="hidden md:block p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
            >
              <X className="w-6 h-6 text-gray-900" />
            </button>
          </div>

          <div className="space-y-8">
            <p className="text-gray-500 font-medium text-lg leading-relaxed">
              {service.subtitle || 'A premium quality service provided by Door2fy experts. Guaranteed satisfaction and professional handling.'}
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100/50">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Pricing</p>
                <p className="text-3xl font-black text-blue-900">₹{service.price}</p>
              </div>
              <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100/50">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Duration</p>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-amber-600" />
                  <p className="text-2xl font-black text-amber-900">{service.duration || 60}m</p>
                </div>
              </div>
            </div>

            {/* Performance Analytics */}
            <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black flex items-center">
                  <TrendingUp className="w-6 h-6 mr-3 text-emerald-400" />
                  Monthly Performance
                </h3>
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">Last 30 Days</span>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Bookings</p>
                  <p className="text-4xl font-black text-emerald-400">{service.bookingCount30Days || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Success Rate</p>
                  <p className="text-4xl font-black text-white">98%</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">What's Included</h3>
              <div className="space-y-3">
                {(service.features || ['Professional Service', 'Guaranteed Quality', 'Expert Support']).map((feat: string, i: number) => (
                  <div key={i} className="flex items-center space-x-3 text-gray-700 font-bold">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-8 border-t border-gray-100 flex items-center justify-between text-xs font-black text-gray-300 uppercase tracking-widest">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Added {new Date(service.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2" />
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Services</h1>
          <p className="text-gray-500 mt-2 font-medium text-lg">Manage your service catalog, pricing, and plans.</p>
        </div>
        <button 
          onClick={() => {
            setEditingService(null);
            setShowForm(true);
          }}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[2rem] shadow-2xl shadow-blue-200 active:scale-95 transition-all text-base font-black"
        >
          <Plus className="w-6 h-6" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4 transition-all hover:scale-105">
          <div className="p-3 bg-blue-50 rounded-2xl">
            <Wrench className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Services</p>
            <p className="text-2xl font-black text-gray-900">{pagination.totalCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4 transition-all hover:scale-105">
          <div className="p-3 bg-emerald-50 rounded-2xl">
            <Tag className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categories</p>
            <p className="text-2xl font-black text-gray-900">{categories.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4 transition-all hover:scale-105">
          <div className="p-3 bg-amber-50 rounded-2xl">
            <Layers className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Types</p>
            <p className="text-2xl font-black text-gray-900">{planTypes.length}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="relative w-full lg:w-[32rem]">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300" />
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-16 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-[2rem] outline-none transition-all placeholder:text-gray-400 font-bold text-gray-700"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full sm:w-64 px-6 py-4 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-gray-600 appearance-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          
          <button 
            onClick={fetchServices}
            className="p-4 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-[1.5rem] transition-all"
            title="Refresh List"
          >
            <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-6 bg-red-50 border-2 border-red-100 rounded-3xl text-red-600 font-bold flex items-center">
          <Tag className="w-5 h-5 mr-4" />
          {error}
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <div 
            key={service._id}
            className="group bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500"
          >
            <div className="h-56 relative overflow-hidden bg-gray-50">
              {service.image ? (
                <img 
                  src={service.image} 
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                  <Wrench className="w-12 h-12 mb-2 opacity-20" />
                </div>
              )}
              
              <div className="absolute top-6 right-6 flex space-x-2">
                <button 
                  onClick={() => {
                    setEditingService(service);
                    setShowForm(true);
                  }}
                  className="p-3 bg-white/90 backdrop-blur shadow-xl rounded-2xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110 active:scale-90"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDeleteService(service._id)}
                  className="p-3 bg-white/90 backdrop-blur shadow-xl rounded-2xl text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:scale-110 active:scale-90"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute bottom-6 left-6 flex items-center space-x-2">
                <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-sm">
                  {service.category?.name || 'Uncategorized'}
                </span>
                {service.bookingCount30Days > 0 && (
                  <span className="px-4 py-2 bg-amber-500/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-sm flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1.5" />
                    {service.bookingCount30Days} Bookings
                  </span>
                )}
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-2xl font-black text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">{service.name}</h3>
              <p className="text-gray-500 font-medium text-sm line-clamp-2 mb-6 leading-relaxed">
                {service.subtitle || 'Premium service offering by Door2fy.'}
              </p>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Starting From</span>
                  <span className="text-2xl font-black text-gray-900">₹{service.price}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</span>
                  <span className="text-sm font-black text-gray-900">{service.duration ? `${service.duration} mins` : 'N/A'}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                  {service.createdAt ? new Date(service.createdAt).toLocaleDateString() : 'N/A'}
                </div>
                <button 
                  onClick={() => setViewingService(service)}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase tracking-widest"
                >
                  <Eye className="w-4 h-4 mr-1.5" />
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {services.length === 0 && !loading && (
        <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-gray-50 shadow-inner">
          <Wrench className="w-20 h-20 text-gray-100 mx-auto mb-8" />
          <h3 className="text-3xl font-black text-gray-900">No matching services</h3>
          <p className="text-gray-500 mt-3 font-medium text-lg max-w-md mx-auto">We couldn't find any services for "{search}". Try adjusting your filters.</p>
        </div>
      )}

      {/* Proper Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-gray-100">
          <p className="text-sm font-bold text-gray-400">
            Showing <span className="text-gray-900">{(page - 1) * pagination.limit + 1}</span> to <span className="text-gray-900">{Math.min(page * pagination.limit, pagination.totalCount)}</span> of <span className="text-gray-900">{pagination.totalCount}</span> Services
          </p>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-4 bg-white border-2 border-gray-50 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-100 disabled:opacity-20 disabled:hover:shadow-none transition-all text-gray-600"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-2">
              {getPageNumbers().map((num, i) => (
                num === '...' ? (
                  <div key={`dots-${i}`} className="px-2">
                    <MoreHorizontal className="w-5 h-5 text-gray-300" />
                  </div>
                ) : (
                  <button
                    key={num}
                    onClick={() => handlePageChange(num as number)}
                    className={`w-12 h-12 rounded-2xl text-sm font-black transition-all ${
                      page === num 
                        ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200 scale-110' 
                        : 'bg-white border-2 border-gray-50 text-gray-400 hover:border-blue-500/20 hover:text-blue-600'
                    }`}
                  >
                    {num}
                  </button>
                )
              ))}
            </div>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === pagination.totalPages}
              className="p-4 bg-white border-2 border-gray-50 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-100 disabled:opacity-20 disabled:hover:shadow-none transition-all text-gray-600"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
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