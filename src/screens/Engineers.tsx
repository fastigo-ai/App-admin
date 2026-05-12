import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Phone, Mail, Star, Clock, AlertCircle, Loader2, Filter, RefreshCcw, UserCheck, Activity, Shield, Ban, CheckCircle, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import { getAllEngineers, toggleBlockEngineer } from '../api/engineerApi';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';
import EngineerDossierModal from '../components/EngineerDossierModal';
import Pagination from '../components/Pagination';

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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Engineer Fleet</h1>
          <p className="text-gray-500 mt-1">Real-time command and control for your service network.</p>
        </div>
        <button 
          onClick={fetchEngineers}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-100 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Fleet', value: stats.totalEngineers, icon: UserCheck, color: 'blue' },
          { label: 'Live Now', value: stats.onlineCount, icon: Activity, color: 'emerald' },
          { label: 'On Service', value: stats.busyCount, icon: Clock, color: 'amber' },
          { label: 'Avg Rating', value: stats.avgRating?.toFixed(1) || '0.0', icon: Star, color: 'purple' }
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
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 outline-none cursor-pointer"
          >
            <option value="all">ALL STATUS</option>
            <option value="ONLINE">ONLINE</option>
            <option value="BUSY">BUSY</option>
            <option value="OFFLINE">OFFLINE</option>
          </select>
          <select
            value={isBlocked}
            onChange={(e) => handleBlockedChange(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 outline-none cursor-pointer"
          >
            <option value="all">ALL ACCOUNTS</option>
            <option value="false">UNBLOCKED</option>
            <option value="true">BLOCKED</option>
          </select>
          <select
            value={isVerified}
            onChange={(e) => handleVerifiedChange(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 outline-none cursor-pointer"
          >
            <option value="all">ALL VERIFIED</option>
            <option value="true">VERIFIED</option>
            <option value="false">PENDING</option>
          </select>
        </div>
      </div>

      {/* Fleet Grid */}
      {error ? (
        <div className="bg-red-50 rounded-xl p-8 text-center border border-red-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Fleet Sync Failed</h3>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button onClick={fetchEngineers} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">Retry Connection</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {engineers.map((engineer) => (
            <div key={engineer._id} className={`bg-white rounded-xl border p-6 transition-all duration-300 relative ${engineer.isBlocked ? 'border-red-100 bg-red-50/20' : 'border-gray-100 hover:shadow-md'}`}>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(engineer.status, engineer.isBlocked)}`}>
                  {engineer.isBlocked ? 'BLOCKED' : (engineer.status || 'OFFLINE')}
                </span>
                <div className="flex items-center space-x-1">
                   <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                   <span className="text-sm font-bold text-gray-900">{engineer.rating?.toFixed(1) || '0.0'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(engineer.name)}&background=random&size=128&bold=true`}
                    alt={engineer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{engineer.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <Briefcase className="w-3.5 h-3.5 mr-1" />
                    {engineer.completedJobs || 0} Jobs Done
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">{engineer.mobile || 'No Phone'}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 truncate">{engineer.address || 'Location not updated'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 min-h-[32px]">
                {(engineer.skills || []).slice(0, 3).map((skill: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Orders</span>
                  <span className="text-lg font-bold text-gray-900">{engineer.assignedOrders?.length || 0}</span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleToggleBlock(engineer._id, !!engineer.isBlocked)}
                    className={`p-2 rounded-lg transition-colors ${engineer.isBlocked ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-600 hover:bg-red-50'}`}
                    title={engineer.isBlocked ? 'Unblock' : 'Block'}
                  >
                    {engineer.isBlocked ? <CheckCircle className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedEngineerId(engineer._id);
                      setIsDossierOpen(true);
                    }}
                    className="px-4 py-2 bg-gray-900 text-white font-bold text-[11px] uppercase tracking-wider rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    View Dossier
                  </button>
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
    </div>
  );
};

export default Engineers;