import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Mail, Star, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { getAllEngineers } from '../api/engineerApi';

const Engineers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [engineers, setEngineers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllEngineers();
      
      // Handle the { success, data, pagination } structure from backend
      const rawData = res.data || (Array.isArray(res) ? res : []);
      
      // Map backend data to UI format
      const mappedEngineers = rawData.map((eng: any) => ({
        id: eng._id,
        name: eng.name,
        email: eng.email || 'N/A',
        phone: eng.mobile,
        specialization: eng.skills || [],
        location: eng.address || eng.currentLocation || 'No location provided',
        status: mapStatus(eng.status),
        rating: eng.rating || 0,
        completedJobs: eng.completedJobs || 0,
        activeJobs: eng.assignedOrders?.length || 0,
        joinDate: eng.createdAt,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(eng.name)}&background=random`,
        experience: 'N/A', // Not in backend yet
        certifications: [] // Not in backend yet
      }));

      setEngineers(mappedEngineers);
    } catch (err: any) {
      console.error('Error fetching engineers:', err);
      setError('Failed to load engineers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const mapStatus = (backendStatus: string) => {
    switch (backendStatus) {
      case 'ONLINE': return 'available';
      case 'BUSY': return 'busy';
      case 'OFFLINE': return 'offline';
      default: return 'offline';
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      available: 'bg-green-100 text-green-800 border-green-200',
      busy: 'bg-amber-100 text-amber-800 border-amber-200',
      offline: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return config[status as keyof typeof config] || config.offline;
  };

  const getStatusIcon = (status: string) => {
    const config = {
      available: 'bg-green-500',
      busy: 'bg-amber-500',
      offline: 'bg-gray-400'
    };
    return config[status as keyof typeof config] || config.offline;
  };

  const filteredEngineers = engineers.filter(engineer => {
    const matchesSearch = (engineer.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (engineer.location?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         engineer.specialization.some((spec: string) => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || engineer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Loading engineers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Data</h3>
        <p className="text-gray-600 mb-6 max-w-sm">{error}</p>
        <button 
          onClick={fetchEngineers}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Engineer Management</h1>
        <p className="text-gray-600 mt-2">View and monitor your team of service engineers and their live status.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Engineers</p>
              <p className="text-2xl font-bold text-gray-900">{engineers.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{engineers.filter(e => e.status === 'available').length}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Busy</p>
              <p className="text-2xl font-bold text-amber-600">{engineers.filter(e => e.status === 'busy').length}</p>
            </div>
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-amber-600 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-purple-600">
                {(engineers.reduce((acc, curr) => acc + curr.rating, 0) / (engineers.length || 1)).toFixed(1)}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, location, or skills..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select
              className="flex-1 md:flex-none px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
            <button 
              onClick={fetchEngineers}
              className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Reload
            </button>
          </div>
        </div>
      </div>

      {/* Engineers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEngineers.map((engineer) => (
          <div key={engineer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={engineer.avatar}
                    alt={engineer.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${getStatusIcon(engineer.status)}`}></div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{engineer.name}</h3>
                  <p className="text-sm text-gray-600">{engineer.experience} experience</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-amber-500 mr-1" />
                    <span className="text-sm font-medium text-gray-900">{engineer.rating}</span>
                  </div>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(engineer.status)}`}>
                {engineer.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                {engineer.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                {engineer.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                {engineer.location}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Specializations</p>
              <div className="flex flex-wrap gap-1">
                {engineer.specialization.map((spec: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-xl font-bold text-green-600">{engineer.completedJobs}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-blue-600">{engineer.activeJobs}</p>
                <p className="text-xs text-gray-500">Active Jobs</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <Clock className="w-4 h-4 inline mr-1" />
                Joined {new Date(engineer.joinDate).toLocaleDateString()}
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Engineers;