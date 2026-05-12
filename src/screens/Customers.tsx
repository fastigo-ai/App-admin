import React, { useState, useEffect, useCallback } from 'react';
import { Search, User, Phone, Mail, MapPin, Calendar, Star, Loader2, Filter, RefreshCcw, TrendingUp, IndianRupee, Users, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllCustomers } from '../api/customerApi';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import Pagination from '../components/Pagination';

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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customer Database</h1>
          <p className="text-gray-500 mt-1">Comprehensive insights into your user base and their lifetime value.</p>
        </div>
        <button 
          onClick={fetchCustomers}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-100 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'blue' },
          { label: 'Live Now', value: stats.onlineCount || 0, icon: Activity, color: 'emerald' },
          { label: 'Lifetime Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: 'purple' },
          { label: 'Active Users', value: stats.activeCustomers, icon: TrendingUp, color: 'blue' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
            </div>
            <div className={`w-12 h-12 bg-${item.color}-100 rounded-xl flex items-center justify-center text-${item.color}-600`}>
              <item.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:border-blue-500 focus:bg-white transition-all text-sm outline-none"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 outline-none cursor-pointer"
          >
            <option value="all">ALL CITIES</option>
            <option value="Noida">NOIDA</option>
            <option value="Delhi">DELHI</option>
            <option value="Gurgaon">GURGAON</option>
          </select>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 outline-none cursor-pointer"
          >
            <option value="all">ALL STATUS</option>
            <option value="active">ACTIVE</option>
            <option value="ONLINE">ONLINE</option>
            <option value="OFFLINE">OFFLINE</option>
            <option value="suspended">SUSPENDED</option>
            <option value="pending_verification">PENDING</option>
          </select>
          <select
            value={isPhoneVerified}
            onChange={(e) => handlePhoneVerifiedChange(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 outline-none cursor-pointer"
          >
            <option value="all">ALL PHONE</option>
            <option value="true">VERIFIED</option>
            <option value="false">NOT VERIFIED</option>
          </select>
        </div>
      </div>

      {/* Customer Grid */}
      {error ? (
        <div className="bg-red-50 rounded-xl p-8 text-center border border-red-100">
          <Loader2 className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Sync Failed</h3>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button onClick={fetchCustomers} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">Retry Link</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <div key={customer._id} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-all duration-300 relative">
              <div className="absolute top-4 right-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${customer.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-700 border-gray-100'}`}>
                  {customer.status || 'PENDING'}
                </span>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                  <img
                    src={customer.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=random&size=128&bold=true`}
                    alt={customer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{customer.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs font-bold text-gray-900">LTV: ₹{(customer.totalSpent || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">{customer.mobile || 'No Phone'}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 truncate">{customer.email || 'No Email'}</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 line-clamp-1">{customer.city || 'Location not updated'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bookings</p>
                  <p className="text-lg font-bold text-gray-900">{customer.totalBookings || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Last Active</p>
                  <p className="text-lg font-bold text-gray-900 truncate">
                    {customer.lastBookingDate ? new Date(customer.lastBookingDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination 
        currentPage={page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Customers;