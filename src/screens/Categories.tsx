import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Image as ImageIcon, 
  Calendar, 
  Tag,
  RefreshCw,
  Filter
} from 'lucide-react';
import CategoryForm from '../components/CategoryForm';
import { getAllCategories, createCategory, editCategory, deleteCategory } from '../api/serviceApi';

const Categories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllCategories();
      if (res && res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        setError('Invalid data format received from server');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateOrUpdate = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await editCategory(editingCategory._id, formData);
      } else {
        await createCategory(formData);
      }
      setShowForm(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    console.log('UI: Deletion triggered for ID:', id);
    if (!id) {
      alert('Error: No category ID found.');
      return;
    }
    
    // TEMPORARILY REMOVING confirm TO DEBUG BLOCKING
    console.log('UI: Bypassing confirm for debug');

    try {
      console.log('UI: Calling API directly via service to delete:', id);
      const res = await deleteCategory(id);
      
      if (res && res.success) {
        alert('Category deleted successfully!');
        fetchCategories();
      } else {
        alert('Delete failed in response: ' + (res?.message || 'Server error'));
      }
    } catch (err: any) {
      console.error('UI: Delete Exception:', err);
      alert('Exception catch: ' + (err.message || 'Unknown error'));
    }
  };

  const filteredCategories = (Array.isArray(categories) ? categories : []).filter(cat => {
    if (!cat || !cat.name) return false;
    return cat.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const stats = {
    total: categories?.length || 0,
    withImages: Array.isArray(categories) ? categories.filter(c => c?.image).length : 0,
    recentlyAdded: Array.isArray(categories) ? categories.filter(c => {
      if (!c?.createdAt) return false;
      const created = new Date(c.createdAt);
      if (isNaN(created.getTime())) return false;
      const now = new Date();
      return (now.getTime() - created.getTime()) < 7 * 24 * 60 * 60 * 1000;
    }).length : 0
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Categories</h1>
          <p className="text-gray-500 mt-1">Manage your service categories and organization.</p>
        </div>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
          className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg active:scale-95 transition-all text-sm font-bold"
        >
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center">
          <Tag className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <Tag className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Categories</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <ImageIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">With Images</p>
            <p className="text-2xl font-bold text-gray-900">{stats.withImages}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 rounded-xl">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recently Added</p>
            <p className="text-2xl font-bold text-gray-900">{stats.recentlyAdded}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchCategories}
            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div 
            key={category._id || category.id}
            className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative"
          >
            <div className="h-48 relative overflow-hidden bg-gray-100">
              {category.image ? (
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <p className="text-xs uppercase font-bold tracking-widest">No Image</p>
                </div>
              )}
              
              <div className="absolute top-4 right-4 flex space-x-2 z-30 pointer-events-auto">
                <button 
                  onClick={() => {
                    console.log('UI: Edit clicked for:', category._id);
                    setEditingCategory(category);
                    setShowForm(true);
                  }}
                  className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110 active:scale-90"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    const id = category._id || category.id;
                    console.log('UI: Delete clicked for ID:', id);
                    handleDelete(id);
                  }}
                  className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:scale-110 active:scale-90"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                  {category.description}
                </p>
              )}
              <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <div className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                </div>
                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full text-gray-500">
                  <Tag className="w-3 h-3 mr-1" />
                  Category
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No categories found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or add a new category.</p>
        </div>
      )}

      {showForm && (
        <CategoryForm 
          onClose={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
          onSubmit={handleCreateOrUpdate}
          initialData={editingCategory}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default Categories;
