import React, { useState, useEffect, useCallback } from 'react';
import { Search, User, Phone, Mail, MapPin, Calendar, Star, Loader2, Filter, RefreshCcw, TrendingUp, IndianRupee, Users, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllCustomers } from '../api/customerApi';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';

const Customers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL Persistent State
  const page = parseInt(searchParams.get('page') || '1');
  const city = searchParams.get('city') || 'all';
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const isPhoneVerified = searchParams.get('isPhoneVerified') || 'all';

  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalCustomers: 0,
    totalRevenue: 0,
    activeCustomers: 0
  });
  const [pagination, setPagination] = useState<any>({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 500);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllCustomers({
        page,
        limit: 9,
        search: debouncedSearch,
        city,
        status,
        isPhoneVerified
      });
      
      if (res.success) {
        setCustomers(res.data);
        setStats(res.stats);
        setPagination(res.pagination);
      }
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customer database.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, city, status, isPhoneVerified]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    setSearchParams({ page: page.toString(), city, search: debouncedSearch, status, isPhoneVerified }, { replace: true });
  }, [debouncedSearch, page, city, status, isPhoneVerified, setSearchParams]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString(), city, search: debouncedSearch, status, isPhoneVerified });
  };

  const handleCityChange = (newCity: string) => {
    setSearchParams({ page: '1', city: newCity, search: debouncedSearch, status, isPhoneVerified });
  };

  const handleStatusChange = (newStatus: string) => {
    setSearchParams({ page: '1', city, search: debouncedSearch, status: newStatus, isPhoneVerified });
  };

  const handlePhoneVerifiedChange = (val: string) => {
    setSearchParams({ page: '1', city, search: debouncedSearch, status, isPhoneVerified: val });
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <p className="text-gray-500 font-black uppercase tracking-widest mt-6 animate-pulse">Analyzing Customer Base...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-900 rounded-2xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Customer Database</h1>
          </div>
          <p className="text-gray-500 font-bold text-lg">Comprehensive insights into your user base and their lifetime value.</p>
        </div>
        <button 
          onClick={fetchCustomers}
          className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl font-black text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm active:scale-95"
        >
          <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'blue', sub: 'Signed up professionals' },
          { label: 'Live Now', value: stats.onlineCount || 0, icon: Activity, color: 'emerald', sub: 'Currently in app' },
          { label: 'Lifetime Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: 'purple', sub: 'Total transaction volume' },
          { label: 'Active Users', value: stats.activeCustomers, icon: TrendingUp, color: 'blue', sub: 'Engaged in last 30 days' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-[2.5rem] p-8 border-2 border-gray-50 shadow-sm group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-3xl bg-${item.color}-50 text-${item.color}-600 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{item.sub}</span>
            </div>
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
            <p className="text-4xl font-black text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-[2.5rem] p-4 border-2 border-gray-50 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-[1.8rem] font-bold text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-blue-500/10 transition-all"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <select
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full pl-16 pr-10 py-5 bg-gray-50 border-none rounded-[1.8rem] font-black text-gray-900 appearance-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer uppercase tracking-widest text-[11px]"
            >
              <option value="all">ALL CITIES</option>
              <option value="Noida">NOIDA</option>
              <option value="Delhi">DELHI</option>
              <option value="Gurgaon">GURGAON</option>
            </select>
          </div>
          <div className="relative min-w-[160px]">
            <Activity className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full pl-16 pr-10 py-5 bg-gray-50 border-none rounded-[1.8rem] font-black text-gray-900 appearance-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer uppercase tracking-widest text-[11px]"
            >
              <option value="all">ALL STATUS</option>
              <option value="active">ACTIVE</option>
              <option value="ONLINE">ONLINE</option>
              <option value="OFFLINE">OFFLINE</option>
              <option value="suspended">SUSPENDED</option>
              <option value="pending_verification">PENDING</option>
            </select>
          </div>
          <div className="relative min-w-[160px]">
            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <select
              value={isPhoneVerified}
              onChange={(e) => handlePhoneVerifiedChange(e.target.value)}
              className="w-full pl-16 pr-10 py-5 bg-gray-50 border-none rounded-[1.8rem] font-black text-gray-900 appearance-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer uppercase tracking-widest text-[11px]"
            >
              <option value="all">ALL PHONE</option>
              <option value="true">VERIFIED</option>
              <option value="false">NOT VERIFIED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fleet Grid */}
      {error ? (
        <div className="bg-red-50 rounded-[2.5rem] p-12 text-center border-2 border-red-100">
          <Loader2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-black text-gray-900 mb-2">Sync Failed</h3>
          <p className="text-gray-600 font-bold mb-8">{error}</p>
          <button onClick={fetchCustomers} className="px-8 py-3 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all">Retry Link</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {customers.map((customer) => (
            <div key={customer._id} className="bg-white rounded-[2.5rem] border-2 border-gray-50 p-8 hover:shadow-2xl hover:border-blue-100 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${customer.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-700 border-gray-100'}`}>
                  {customer.status || 'PENDING'}
                </span>
              </div>

              <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                  <div className="w-20 h-20 bg-gray-100 rounded-[2rem] overflow-hidden group-hover:scale-110 transition-transform duration-500">
                    <img
                      src={customer.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=random&size=128&bold=true`}
                      alt={customer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight mb-1">{customer.name}</h3>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-black text-gray-900">LTV: ₹{(customer.totalSpent || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-4 group/item">
                  <div className="p-3 bg-gray-50 rounded-2xl group-hover/item:bg-blue-50 transition-colors">
                    <Phone className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-600">{customer.mobile || 'No Phone'}</p>
                </div>
                <div className="flex items-center space-x-4 group/item">
                  <div className="p-3 bg-gray-50 rounded-2xl group-hover/item:bg-blue-50 transition-colors">
                    <Mail className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-600 truncate">{customer.email || 'No Email'}</p>
                </div>
                <div className="flex items-start space-x-4 group/item">
                  <div className="p-3 bg-gray-50 rounded-2xl group-hover/item:bg-blue-50 transition-colors">
                    <MapPin className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-600 line-clamp-2">{customer.city || 'Location not updated'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t-2 border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Total Bookings</span>
                  <span className="text-lg font-black text-gray-900">{customer.totalBookings || 0} Orders</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Last Activity</span>
                  <span className="text-lg font-black text-gray-900">
                    {customer.lastBookingDate ? new Date(customer.lastBookingDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 pt-10">
          <button
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
            className="p-4 bg-white border-2 border-gray-100 rounded-[1.5rem] disabled:opacity-30 transition-all hover:border-blue-500 text-gray-600 active:scale-90"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="px-8 py-4 bg-gray-900 rounded-[1.5rem] text-white font-black text-sm tracking-widest">
            PAGE {page} <span className="text-gray-500 mx-2">OF</span> {pagination.totalPages}
          </div>
          <button
            disabled={page === pagination.totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="p-4 bg-white border-2 border-gray-100 rounded-[1.5rem] disabled:opacity-30 transition-all hover:border-blue-500 text-gray-600 active:scale-90"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Customers;