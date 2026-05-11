import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Phone, Mail, Star, Clock, AlertCircle, Loader2, Filter, RefreshCcw, UserCheck, UserMinus, ChevronLeft, ChevronRight, Activity, Shield } from 'lucide-react';
import { getAllEngineers } from '../api/engineerApi';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';

const Engineers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL Persistent State
  const page = parseInt(searchParams.get('page') || '1');
  const status = searchParams.get('status') || 'all';
  const search = searchParams.get('search') || '';

  const [engineers, setEngineers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalEngineers: 0,
    onlineCount: 0,
    busyCount: 0,
    offlineCount: 0,
    avgRating: 0
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

  const fetchEngineers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllEngineers({
        page,
        limit: 9,
        search: debouncedSearch,
        status
      });
      
      if (res.success) {
        setEngineers(res.data);
        setStats(res.stats);
        setPagination(res.pagination);
      }
    } catch (err: any) {
      console.error('Error fetching engineers:', err);
      setError('Failed to load engineers. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status]);

  useEffect(() => {
    fetchEngineers();
  }, [fetchEngineers]);

  useEffect(() => {
    setSearchParams({ page: page.toString(), status, search: debouncedSearch }, { replace: true });
  }, [debouncedSearch, page, status, setSearchParams]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString(), status, search: debouncedSearch });
  };

  const handleStatusChange = (newStatus: string) => {
    setSearchParams({ page: '1', status: newStatus, search: debouncedSearch });
  };

  const getStatusBadge = (status?: string) => {
    const s = status?.toUpperCase() || 'OFFLINE';
    switch (s) {
      case 'ONLINE': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'BUSY': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'OFFLINE': return 'bg-gray-50 text-gray-700 border-gray-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getStatusIndicator = (status?: string) => {
    const s = status?.toUpperCase() || 'OFFLINE';
    switch (s) {
      case 'ONLINE': return 'bg-emerald-500 ring-emerald-100';
      case 'BUSY': return 'bg-amber-500 ring-amber-100';
      case 'OFFLINE': return 'bg-gray-400 ring-gray-100';
      default: return 'bg-gray-400 ring-gray-100';
    }
  };

  if (loading && engineers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <p className="text-gray-500 font-black uppercase tracking-widest mt-6 animate-pulse">Synchronizing Fleet...</p>
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
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Engineer Fleet</h1>
          </div>
          <p className="text-gray-500 font-bold text-lg">Manage, monitor and optimize your service professional network.</p>
        </div>
        <button 
          onClick={fetchEngineers}
          className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl font-black text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm active:scale-95"
        >
          <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Fleet', value: stats.totalEngineers, icon: UserCheck, color: 'blue', sub: 'Total registered' },
          { label: 'Live Now', value: stats.onlineCount, icon: Activity, color: 'emerald', sub: 'Ready for dispatch' },
          { label: 'On Service', value: stats.busyCount, icon: Clock, color: 'amber', sub: 'Currently occupied' },
          { label: 'Avg Rating', value: stats.avgRating?.toFixed(1) || '0.0', icon: Star, color: 'purple', sub: 'Customer satisfaction' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-[2.5rem] p-8 border-2 border-gray-50 shadow-sm hover:shadow-xl transition-all duration-300 group">
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
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full pl-16 pr-10 py-5 bg-gray-50 border-none rounded-[1.8rem] font-black text-gray-900 appearance-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer uppercase tracking-widest text-[11px]"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fleet Grid */}
      {error ? (
        <div className="bg-red-50 rounded-[2.5rem] p-12 text-center border-2 border-red-100">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-black text-gray-900 mb-2">Fleet Sync Failed</h3>
          <p className="text-gray-600 font-bold mb-8">{error}</p>
          <button onClick={fetchEngineers} className="px-8 py-3 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all">Retry Connection</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {engineers.map((engineer) => (
            <div key={engineer._id} className="bg-white rounded-[2.5rem] border-2 border-gray-50 p-8 hover:shadow-2xl hover:border-blue-100 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusBadge(engineer.status)}`}>
                  {engineer.status || 'OFFLINE'}
                </span>
              </div>

              <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                  <div className="w-20 h-20 bg-gray-100 rounded-[2rem] overflow-hidden group-hover:scale-110 transition-transform duration-500">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(engineer.name)}&background=random&size=128&bold=true`}
                      alt={engineer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ring-4 ring-offset-0 ${getStatusIndicator(engineer.status)} animate-pulse`}></div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight mb-1">{engineer.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-black text-gray-900">{engineer.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">• {engineer.completedJobs || 0} Jobs</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-4 group/item">
                  <div className="p-3 bg-gray-50 rounded-2xl group-hover/item:bg-blue-50 transition-colors">
                    <Phone className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-600">{engineer.mobile || 'No Phone'}</p>
                </div>
                <div className="flex items-center space-x-4 group/item">
                  <div className="p-3 bg-gray-50 rounded-2xl group-hover/item:bg-blue-50 transition-colors">
                    <Mail className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-600 truncate">{engineer.email || 'No Email'}</p>
                </div>
                <div className="flex items-start space-x-4 group/item">
                  <div className="p-3 bg-gray-50 rounded-2xl group-hover/item:bg-blue-50 transition-colors">
                    <MapPin className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-600 line-clamp-2">{engineer.address || 'Location not updated'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {(engineer.skills || []).slice(0, 3).map((skill: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl">
                    {skill}
                  </span>
                ))}
                {engineer.skills?.length > 3 && (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-500 text-[9px] font-black uppercase tracking-widest rounded-xl">
                    +{engineer.skills.length - 3} More
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-6 border-t-2 border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Active Requests</span>
                  <span className="text-lg font-black text-gray-900">{engineer.assignedOrders?.length || 0} Orders</span>
                </div>
                <button className="px-6 py-3 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95">
                  View Dossier
                </button>
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

export default Engineers;