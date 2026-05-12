import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Image as ImageIcon, 
  Calendar, 
  Tag,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';
import CategoryForm from '../components/CategoryForm';
import { 
  getAllCategories, 
  deleteCategory, 
  createCategory, 
  editCategory 
} from '../api/serviceApi';
import { useDebounce } from '../hooks/useDebounce';
import Pagination from '../components/Pagination';

const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Stats state (separate from paginated data)
  const [totalCount, setTotalCount] = useState(0);

  const [pagination, setPagination] = useState({
    totalCategories: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10
  });

  // URL State
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';

  // Local Search Input (for instant typing)
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

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllCategories({ 
        page, 
        limit: 10, 
        search 
      });
      
      if (res && res.success) {
        setCategories(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
          setTotalCount(res.pagination.totalCategories);
        }
      } else {
        setError('Invalid data format received from server');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', newPage.toString());
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const res = await deleteCategory(id);
      if (res && res.success) {
        fetchCategories();
      } else {
        alert('Delete failed: ' + (res?.message || 'Server error'));
      }
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Catalog Management</h1>
          <p className="text-gray-500 mt-1">Manage your service categories and organization.</p>
        </div>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
          className="flex items-center justify-center space-x-2 bg-gray-900 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl transition-all font-bold shadow-lg shadow-gray-200 hover:shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          <span>New Category</span>
        </button>
      </div>

      {/* Toolbar & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5" />
            <span>{totalCount} Categories</span>
          </div>
          <button 
            onClick={fetchCategories}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center">
          <AlertCircle className="w-5 h-5 mr-3" />
          {error}
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div 
            key={category._id}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative"
          >
            <div className="h-48 relative overflow-hidden bg-gray-50">
              {category.image ? (
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-200">
                  <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">No Image</p>
                </div>
              )}
              
              <div className="absolute top-4 right-4 flex space-x-2 z-10">
                <button 
                  onClick={() => {
                    setEditingCategory(category);
                    setShowForm(true);
                  }}
                  className="p-2 bg-white/90 backdrop-blur-sm shadow-sm rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(category._id)}
                  className="p-2 bg-white/90 backdrop-blur-sm shadow-sm rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{category.name}</h3>
              
              {category.description && (
                <p className="text-sm text-gray-500 line-clamp-2 font-medium mt-2 leading-relaxed">
                  {category.description}
                </p>
              )}
              
              <div className="flex items-center justify-between pt-5 mt-5 border-t border-gray-100">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                  {category.createdAt ? new Date(category.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                </div>
                <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                  Active
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Tag className="w-12 h-12 text-gray-100 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">No categories found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Try a different search term or create a new category.</p>
        </div>
      )}

      <Pagination 
        currentPage={page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />

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
