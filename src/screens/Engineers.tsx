import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Phone, Mail, Star, Clock, AlertCircle, Loader2, Filter, RefreshCcw, UserCheck, Activity, Shield, Ban, CheckCircle, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import { getAllEngineers, toggleBlockEngineer } from '../api/engineerApi';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';
import EngineerDossierModal from '../components/EngineerDossierModal';

const Engineers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const page = parseInt(searchParams.get('page') || '1');
  const status = searchParams.get('status') || 'all';
  const search = searchParams.get('search') || '';
  const isBlocked = searchParams.get('isBlocked') || 'all';
  const isVerified = searchParams.get('isVerified') || 'all';

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

  // Dossier Modal State
  const [selectedEngineerId, setSelectedEngineerId] = useState<string | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const fetchEngineers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllEngineers({
        page,
        limit: 9,
        search: debouncedSearch,
        status,
        isBlocked,
        isVerified
      });
      
      if (res.success) {
        setEngineers(res.data);
        setStats(res.stats);
        setPagination(res.pagination);
      }
    } catch (err: any) {
      console.error('Error fetching engineers:', err);
      setError('Failed to load fleet data.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, isBlocked, isVerified]);

  useEffect(() => {
    fetchEngineers();
  }, [fetchEngineers]);

  useEffect(() => {
    setSearchParams({ page: page.toString(), status, search: debouncedSearch, isBlocked, isVerified }, { replace: true });
  }, [debouncedSearch, page, status, isBlocked, isVerified, setSearchParams]);

  const handleToggleBlock = async (id: string, currentlyBlocked: boolean) => {
    try {
      const res = await toggleBlockEngineer(id, !currentlyBlocked);
      if (res.success) {
        toast.success(res.message);
        setEngineers(prev => prev.map(eng => 
          eng._id === id ? { ...eng, isBlocked: !currentlyBlocked } : eng
        ));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString(), status, search: debouncedSearch, isBlocked, isVerified });
  };

  const handleStatusChange = (newStatus: string) => {
    setSearchParams({ page: '1', status: newStatus, search: debouncedSearch, isBlocked, isVerified });
  };

  const handleBlockedChange = (val: string) => {
    setSearchParams({ page: '1', status, search: debouncedSearch, isBlocked: val, isVerified });
  };

  const handleVerifiedChange = (val: string) => {
    setSearchParams({ page: '1', status, search: debouncedSearch, isBlocked, isVerified: val });
  };

  const getStatusBadge = (status?: string, isBlocked?: boolean) => {
    if (isBlocked) return 'bg-red-50 text-red-700 border-red-100';
    const s = status?.toUpperCase() || 'OFFLINE';
    switch (s) {
      case 'ONLINE': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'BUSY': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'OFFLINE': return 'bg-gray-50 text-gray-700 border-gray-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
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
        <p className="text-gray-500 font-black uppercase tracking-widest mt-6 animate-pulse">Syncing Fleet...</p>
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
          <p className="text-gray-500 font-bold text-lg">Real-time command and control for your service network.</p>
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
          <div key={idx} className="bg-white rounded-[2.5rem] p-8 border-2 border-gray-50 shadow-sm group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-3xl bg-${item.color}-50 text-${item.color}-600 group-hover:rotate-12 transition-transform`}>
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
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full pl-16 pr-10 py-5 bg-gray-50 border-none rounded-[1.8rem] font-black text-gray-900 appearance-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer uppercase tracking-widest text-[11px]"
            >
              <option value="all">ALL STATUS</option>
              <option value="ONLINE">ONLINE</option>
              <option value="BUSY">BUSY</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
          </div>
          <div className="relative min-w-[160px]">
            <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <select
              value={isBlocked}
              onChange={(e) => handleBlockedChange(e.target.value)}
              className="w-full pl-16 pr-10 py-5 bg-gray-50 border-none rounded-[1.8rem] font-black text-gray-900 appearance-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer uppercase tracking-widest text-[11px]"
            >
              <option value="all">ALL ACCOUNTS</option>
              <option value="false">UNBLOCKED</option>
              <option value="true">BLOCKED</option>
            </select>
          </div>
          <div className="relative min-w-[160px]">
            <UserCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <select
              value={isVerified}
              onChange={(e) => handleVerifiedChange(e.target.value)}
              className="w-full pl-16 pr-10 py-5 bg-gray-50 border-none rounded-[1.8rem] font-black text-gray-900 appearance-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer uppercase tracking-widest text-[11px]"
            >
              <option value="all">ALL VERIFIED</option>
              <option value="true">VERIFIED</option>
              <option value="false">PENDING</option>
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
          <button onClick={fetchEngineers} className="px-8 py-3 bg-red-600 text-white font-black rounded-2xl">Retry Connection</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {engineers.map((engineer) => (
            <div key={engineer._id} className={`bg-white rounded-[2.5rem] border-2 p-8 transition-all duration-500 group relative overflow-hidden ${engineer.isBlocked ? 'border-red-100 opacity-80' : 'border-gray-50 hover:shadow-2xl hover:border-blue-100'}`}>
              
              {/* Top Bar */}
              <div className="flex items-center justify-between mb-8">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusBadge(engineer.status, engineer.isBlocked)}`}>
                  {engineer.isBlocked ? 'BLOCKED' : (engineer.status || 'OFFLINE')}
                </span>
                <div className="flex items-center space-x-2">
                   <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                   <span className="text-sm font-black text-gray-900">{engineer.rating?.toFixed(1) || '0.0'}</span>
                </div>
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
                  {!engineer.isBlocked && (
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ring-4 ring-offset-0 ${engineer.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse ring-emerald-100' : engineer.status === 'BUSY' ? 'bg-amber-500 animate-pulse ring-amber-100' : 'bg-gray-400 ring-gray-100'}`}></div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight mb-1">{engineer.name}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {engineer.completedJobs || 0} Finished Jobs
                  </p>
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
                    <MapPin className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">H3 Index: {engineer.h3Index || 'N/A'}</p>
                    <p className="text-sm font-bold text-gray-600 truncate">{engineer.address || 'Location not updated'}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-10">
                {(engineer.skills || []).slice(0, 3).map((skill: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-6 border-t-2 border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Active Load</span>
                  <span className="text-lg font-black text-gray-900">{engineer.assignedOrders?.length || 0} Orders</span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleToggleBlock(engineer._id, !!engineer.isBlocked)}
                    className={`p-3 rounded-2xl transition-all active:scale-90 ${engineer.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                    title={engineer.isBlocked ? 'Unblock Engineer' : 'Block Engineer'}
                  >
                    {engineer.isBlocked ? <CheckCircle2 className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedEngineerId(engineer._id);
                      setIsDossierOpen(true);
                    }}
                    className="px-6 py-3 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all active:scale-95"
                  >
                    View Dossier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dossier Modal */}
      {isDossierOpen && selectedEngineerId && (
        <EngineerDossierModal 
          engineerId={selectedEngineerId} 
          onClose={() => {
            setIsDossierOpen(false);
            setSelectedEngineerId(null);
          }}
        />
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 pt-10">
          <button
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
            className="p-4 bg-white border-2 border-gray-100 rounded-[1.5rem] disabled:opacity-30 hover:border-blue-500 text-gray-600 transition-all active:scale-90"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="px-8 py-4 bg-gray-900 rounded-[1.5rem] text-white font-black text-sm tracking-widest">
            PAGE {page} <span className="text-gray-500 mx-2">OF</span> {pagination.totalPages}
          </div>
          <button
            disabled={page === pagination.totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="p-4 bg-white border-2 border-gray-100 rounded-[1.5rem] disabled:opacity-30 hover:border-blue-500 text-gray-600 transition-all active:scale-90"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Engineers;