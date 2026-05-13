import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Ticket, 
  Calendar, 
  Users, 
  CreditCard,
  Filter,
  TrendingUp,
  Target,
  X,
  User as UserIcon,
  MapPin,
  Tag as TagIcon,
  Edit3,
  AlignLeft
} from 'lucide-react';
import { 
  getAllCoupons, 
  createCoupon, 
  updateCoupon,
  toggleCouponStatus, 
  deleteCoupon,
  searchUsers,
  Coupon 
} from '../api/couponApi';
import Pagination from '../components/Pagination';

const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  
  // Search state
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState<any[]>([]);
  const [selectedUserDetails, setSelectedUserDetails] = useState<any[]>([]);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    description: '',
    type: 'FLAT',
    value: 0,
    minOrderAmount: 0,
    maxDiscount: 0,
    usageLimit: 100,
    perUserLimit: 1,
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    targeting: {
      firstTimeUserOnly: false,
      cities: [],
      userSegments: ['NEW', 'ACTIVE'],
      specificUsers: []
    },
    isHidden: false
  });

  const availableCities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'];
  const availableSegments = ['NEW', 'ACTIVE', 'INACTIVE', 'VIP'];

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (userQuery.length >= 2) {
        const results = await searchUsers(userQuery);
        setUserResults(results);
      } else {
        setUserResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [userQuery]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await getAllCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (couponId: string, currentStatus: boolean) => {
    try {
      await toggleCouponStatus(couponId, !currentStatus);
      fetchCoupons();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (couponId: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(couponId);
        fetchCoupons();
      } catch (error) {
        alert('Failed to delete coupon');
      }
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCouponId(coupon._id);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      type: coupon.type,
      value: coupon.type === 'FLAT' ? coupon.value / 100 : coupon.value,
      minOrderAmount: coupon.minOrderAmount / 100,
      maxDiscount: (coupon.maxDiscount || 0) / 100,
      usageLimit: coupon.usageLimit,
      perUserLimit: coupon.perUserLimit,
      isActive: coupon.isActive,
      startDate: new Date(coupon.startDate).toISOString().split('T')[0],
      endDate: new Date(coupon.endDate).toISOString().split('T')[0],
      targeting: {
        firstTimeUserOnly: coupon.targeting?.firstTimeUserOnly || false,
        cities: coupon.targeting?.cities || [],
        userSegments: coupon.targeting?.userSegments || ['NEW', 'ACTIVE'],
        specificUsers: coupon.targeting?.specificUsers || []
      },
      isHidden: coupon.isHidden
    });
    setSelectedUserDetails(coupon.targeting?.specificUsers?.map(id => ({ _id: id, name: 'Targeted User' })) || []);
    setIsModalOpen(true);
  };

  const handleAddUser = (user: any) => {
    if (selectedUserDetails.find(u => u._id === user._id)) return;
    
    const newSelected = [...selectedUserDetails, user];
    setSelectedUserDetails(newSelected);
    setFormData({
      ...formData,
      targeting: {
        ...formData.targeting!,
        specificUsers: newSelected.map(u => u._id)
      }
    });
    setUserQuery('');
    setUserResults([]);
  };

  const handleRemoveUser = (userId: string) => {
    const newSelected = selectedUserDetails.filter(u => u._id !== userId);
    setSelectedUserDetails(newSelected);
    setFormData({
      ...formData,
      targeting: {
        ...formData.targeting!,
        specificUsers: newSelected.map(u => u._id)
      }
    });
  };

  const toggleCity = (city: string) => {
    const currentCities = formData.targeting?.cities || [];
    const newCities = currentCities.includes(city)
      ? currentCities.filter(c => c !== city)
      : [...currentCities, city];
    
    setFormData({
      ...formData,
      targeting: { ...formData.targeting!, cities: newCities }
    });
  };

  const toggleSegment = (segment: string) => {
    const currentSegments = formData.targeting?.userSegments || [];
    const newSegments = currentSegments.includes(segment)
      ? currentSegments.filter(s => s !== segment)
      : [...currentSegments, segment];
    
    setFormData({
      ...formData,
      targeting: { ...formData.targeting!, userSegments: newSegments }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        value: formData.type === 'FLAT' ? (formData.value || 0) * 100 : formData.value,
        minOrderAmount: (formData.minOrderAmount || 0) * 100,
        maxDiscount: (formData.maxDiscount || 0) * 100
      };

      if (editingCouponId) {
        await updateCoupon(editingCouponId, submitData);
      } else {
        await createCoupon(submitData);
      }
      
      setIsModalOpen(false);
      fetchCoupons();
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save coupon');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      type: 'FLAT',
      value: 0,
      minOrderAmount: 0,
      maxDiscount: 0,
      usageLimit: 100,
      perUserLimit: 1,
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      targeting: {
        firstTimeUserOnly: false,
        cities: [],
        userSegments: ['NEW', 'ACTIVE'],
        specificUsers: []
      },
      isHidden: false
    });
    setEditingCouponId(null);
    setSelectedUserDetails([]);
  };

  const filteredCoupons = coupons.filter(coupon => 
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const currentCoupons = filteredCoupons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Coupon Management</h1>
          <p className="text-gray-500 mt-1 font-medium">Create and manage high-conversion discount strategies</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Ticket className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Coupons</p>
          <p className="text-2xl font-black text-gray-900">{coupons.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Redemptions</p>
          <p className="text-2xl font-black text-gray-900">
            {coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Target className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg. Conversion</p>
          <p className="text-2xl font-black text-gray-900">12.4%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-rose-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Discount Burn</p>
          <p className="text-2xl font-black text-gray-900">₹45.2k</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by coupon code..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-bold text-gray-600 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Coupon Code</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Value & Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Usage</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Validity</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">Loading coupons...</td>
                </tr>
              ) : currentCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">No coupons found matching your search.</td>
                </tr>
              ) : (
                currentCoupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-black text-indigo-600 text-xs">
                          {coupon.code.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 uppercase">{coupon.code}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate max-w-[150px]">
                            {coupon.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900">
                          {coupon.type === 'FLAT' ? `₹${(coupon.value / 100).toLocaleString()}` : `${coupon.value}%`}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          Min: ₹{(coupon.minOrderAmount / 100).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between w-24">
                          <span className="text-[10px] font-bold text-gray-600">{coupon.usedCount} / {coupon.usageLimit}</span>
                          <span className="text-[10px] font-bold text-gray-400">{Math.round((coupon.usedCount / coupon.usageLimit) * 100)}%</span>
                        </div>
                        <div className="w-24 bg-gray-100 rounded-full h-1">
                          <div 
                            className="bg-indigo-500 h-1 rounded-full" 
                            style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-xs text-gray-600 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{new Date(coupon.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        coupon.isActive 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(coupon)}
                          className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleToggle(coupon._id, coupon.isActive)}
                          className={`p-2 rounded-lg transition-colors ${coupon.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                          title={coupon.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {coupon.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button 
                          onClick={() => handleDelete(coupon._id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-50 bg-gray-50/30">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => { setIsModalOpen(false); resetForm(); }}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{editingCouponId ? 'Edit Coupon Strategy' : 'Create New Coupon'}</h2>
                  <p className="text-sm text-gray-500 font-medium">Define your discount rules and targeting</p>
                </div>
                <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-gray-400 hover:text-gray-600 p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Basic Info */}
                  <div className="md:col-span-3">
                    <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4">1. Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Coupon Code</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. WELCOME50"
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all uppercase"
                          value={formData.code}
                          onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Discount Type</label>
                        <select 
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all"
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                        >
                          <option value="FLAT">Flat Amount (₹)</option>
                          <option value="PERCENTAGE">Percentage (%)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                          {formData.type === 'FLAT' ? 'Discount Amount (₹)' : 'Discount Percentage (%)'}
                        </label>
                        <input 
                          type="number"
                          required
                          min="1"
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all"
                          value={formData.value}
                          onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                        />
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
                          <AlignLeft className="w-3 h-3 mr-1" /> Description
                        </label>
                        <input 
                          type="text"
                          placeholder="e.g. Get 50% OFF on your first booking"
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-medium text-gray-900 transition-all"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Limits & Budget */}
                  <div className="md:col-span-3">
                    <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4">2. Limits & Budget</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Min. Order Value (₹)</label>
                        <input 
                          type="number"
                          required
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all"
                          value={formData.minOrderAmount}
                          onChange={(e) => setFormData({...formData, minOrderAmount: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Usage Limit</label>
                        <input 
                          type="number"
                          required
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all"
                          value={formData.usageLimit}
                          onChange={(e) => setFormData({...formData, usageLimit: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Start Date</label>
                        <input 
                          type="date"
                          required
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all"
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">End Date</label>
                        <input 
                          type="date"
                          required
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all"
                          value={formData.endDate}
                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Advanced Targeting */}
                  <div className="md:col-span-3">
                    <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4">3. Advanced Targeting</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      
                      {/* Left Side: Segment & City & Hidden */}
                      <div className="space-y-6">
                        {/* Segments */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
                            <TagIcon className="w-3 h-3 mr-1" /> Target Segments
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {availableSegments.map(s => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => toggleSegment(s)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                                  formData.targeting?.userSegments?.includes(s)
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-200'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Cities */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
                            <MapPin className="w-3 h-3 mr-1" /> Target Cities
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {availableCities.map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => toggleCity(c)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                                  formData.targeting?.cities?.includes(c)
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-200'
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-8 pt-2">
                          <label className="flex items-center space-x-3 cursor-pointer group">
                            <div className="relative">
                              <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={formData.targeting?.firstTimeUserOnly}
                                onChange={(e) => setFormData({
                                  ...formData, 
                                  targeting: { ...formData.targeting!, firstTimeUserOnly: e.target.checked }
                                })}
                              />
                              <div className="w-10 h-5 bg-gray-200 peer-checked:bg-indigo-600 rounded-full transition-all"></div>
                              <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all peer-checked:left-6"></div>
                            </div>
                            <span className="text-xs font-bold text-gray-600 uppercase">First-time only</span>
                          </label>

                          <label className="flex items-center space-x-3 cursor-pointer group">
                            <div className="relative">
                              <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={formData.isHidden}
                                onChange={(e) => setFormData({
                                  ...formData, 
                                  isHidden: e.target.checked
                                })}
                              />
                              <div className="w-10 h-5 bg-gray-200 peer-checked:bg-amber-600 rounded-full transition-all"></div>
                              <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all peer-checked:left-6"></div>
                            </div>
                            <span className="text-xs font-bold text-gray-600 uppercase">Hidden (Private)</span>
                          </label>
                        </div>
                      </div>

                      {/* Right Side: Specific User Search */}
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
                          <UserIcon className="w-3 h-3 mr-1" /> Specific User Targeting
                        </label>
                        
                        <div className="relative">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                              type="text"
                              placeholder="Search user by name or mobile..."
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none text-sm font-medium transition-all"
                              value={userQuery}
                              onChange={(e) => setUserQuery(e.target.value)}
                            />
                          </div>

                          {userResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
                              {userResults.map(u => (
                                <button
                                  key={u._id}
                                  type="button"
                                  onClick={() => handleAddUser(u)}
                                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-50 transition-colors text-left border-b border-gray-50 last:border-none"
                                >
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm">{u.name}</p>
                                    <p className="text-xs text-gray-500">{u.mobile}</p>
                                  </div>
                                  <Plus className="w-4 h-4 text-indigo-500" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Selected Users Chips */}
                        <div className="flex flex-wrap gap-2">
                          {selectedUserDetails.map(u => (
                            <div key={u._id} className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-indigo-100">
                              <span>{u.name}</span>
                              <button 
                                type="button"
                                onClick={() => handleRemoveUser(u._id)}
                                className="ml-2 p-0.5 hover:bg-indigo-200 rounded-full transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          {selectedUserDetails.length === 0 && (
                            <p className="text-xs text-gray-400 italic">No specific users selected (Available for everyone by default)</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-8 border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                    className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                  >
                    {editingCouponId ? 'Update Coupon Strategy' : 'Create Coupon Strategy'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
