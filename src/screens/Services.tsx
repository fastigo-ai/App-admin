import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Wrench } from 'lucide-react';
import ServiceForm from '../components/ServiceForm';
import { getAllServices, deleteService, getCategories, getPlanTypes } from '../api/serviceApi';

const Services = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [planTypes, setPlanTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesRes, categoriesRes, planTypesRes] = await Promise.all([
        getAllServices(),
        getCategories(),
        getPlanTypes()
      ]);

      if (servicesRes.success) {
        setServices(servicesRes.data);
      }
      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }
      if (planTypesRes.success) {
        setPlanTypes(planTypesRes.data);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch services. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddService = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const res = await deleteService(id);
        if (res.success) {
          setServices(prev => prev.filter(s => s._id !== id));
        }
      } catch (err) {
        console.error('Error deleting service:', err);
        alert('Failed to delete service.');
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingService(null);
  };

  const handleSaveService = () => {
    fetchData(); // Refresh list after save
    handleCloseForm();
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category?._id === categoryFilter || service.category?.name === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl font-medium text-gray-600">Loading services...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <button 
          onClick={fetchData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
        <p className="text-gray-600 mt-2">Manage your repair services, pricing, and availability.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{services.length}</p>
            </div>
            <Wrench className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Services</p>
              <p className="text-2xl font-bold text-green-600">{services.filter(s => (s.status || 'active') === 'active').length}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Plan Types</p>
              <p className="text-2xl font-bold text-amber-600">{planTypes.length}</p>
            </div>
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-amber-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddService}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <Wrench className="w-12 h-12 text-gray-300" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(service.status || 'active')}`}>
                  {service.status || 'active'}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{service.name}</h3>
                  <p className="text-sm text-blue-600 font-medium">{service.category?.name || 'Uncategorized'}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditService(service)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteService(service._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.subtitle || service.description || 'No description available'}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Base Price</p>
                  <p className="text-lg font-bold text-gray-900">₹{service.price || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Est. Time</p>
                  <p className="text-sm font-medium text-gray-900">{service.duration ? `${service.duration} mins` : service.estimatedTime || 'N/A'}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Features</p>
                <div className="flex flex-wrap gap-1">
                  {(service.features || []).slice(0, 3).map((feature: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                      {feature}
                    </span>
                  ))}
                  {service.features?.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                      +{service.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{service.bookingsCount} bookings</span>
                  <span className="flex items-center">
                    <span className="text-amber-600 mr-1">★</span>
                    {service.rating}
                  </span>
                </div>
                <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                  <Eye className="w-4 h-4 mr-1" />
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Form Modal */}
      {showForm && (
        <ServiceForm
          service={editingService}
          categories={categories}
          planTypes={planTypes}
          onClose={handleCloseForm}
          onSave={handleSaveService}
        />
      )}
    </div>
  );
};

export default Services;