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
  MoreHorizontal
} from 'lucide-react';
import CategoryForm from '../components/CategoryForm';
import { getAllCategories, createCategory, editCategory, deleteCategory } from '../api/serviceApi';
import { useDebounce } from '../hooks/useDebounce';

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

  // Helper to generate page numbers with ellipses
  const getPageNumbers = () => {
    const total = pagination.totalPages;
    const current = pagination.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', total);
      } else if (current >= total - 3) {
        pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }
    return pages;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Catalog</h1>
          <p className="text-gray-500 mt-2 font-medium text-lg">Manage your service categories and organization.</p>
        </div>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
          className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-[2rem] shadow-2xl shadow-emerald-200 active:scale-95 transition-all text-base font-black"
        >
          <Plus className="w-6 h-6" />
          <span>New Category</span>
        </button>
      </div>

      {/* Toolbar & Search */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative w-full md:w-[32rem]">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300" />
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-16 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white rounded-[2rem] outline-none transition-all placeholder:text-gray-400 font-bold text-gray-700"
          />
        </div>
        
        <div className="flex items-center space-x-6 text-sm font-bold text-gray-400">
          <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-2xl">
            <Tag className="w-4 h-4 text-emerald-500" />
            <span>{totalCount} Results</span>
          </div>
          <button 
            onClick={fetchCategories}
            className="p-3 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-6 bg-red-50 border-2 border-red-100 rounded-3xl text-red-600 font-bold flex items-center shadow-sm">
          <div className="p-2 bg-red-100 rounded-xl mr-4">
            <Tag className="w-5 h-5" />
          </div>
          {error}
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <div 
            key={category._id}
            className="group bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-500 relative"
          >
            <div className="h-64 relative overflow-hidden bg-gray-50">
              {category.image ? (
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                  <ImageIcon className="w-16 h-16 mb-4 opacity-10" />
                  <p className="text-[12px] uppercase font-black tracking-[0.2em] opacity-30">Visual Asset Required</p>
                </div>
              )}
              
              <div className="absolute top-6 right-6 flex space-x-3 z-30">
                <button 
                  onClick={() => {
                    setEditingCategory(category);
                    setShowForm(true);
                  }}
                  className="p-3 bg-white/90 backdrop-blur-md shadow-xl rounded-2xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110 active:scale-90"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(category._id)}
                  className="p-3 bg-white/90 backdrop-blur-md shadow-xl rounded-2xl text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:scale-110 active:scale-90"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-2xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors truncate">{category.name}</h3>
              </div>
              
              {category.description && (
                <p className="text-gray-500 line-clamp-2 font-medium leading-relaxed mb-6">
                  {category.description}
                </p>
              )}
              
              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
                  {category.createdAt ? new Date(category.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                  Active Category
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && !loading && (
        <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-gray-50 shadow-inner">
          <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
            <Tag className="w-12 h-12 text-gray-200" />
          </div>
          <h3 className="text-3xl font-black text-gray-900">No results matched</h3>
          <p className="text-gray-500 mt-3 font-medium text-lg max-w-md mx-auto">We couldn't find any categories matching "{search}". Try another keyword or create a new one.</p>
        </div>
      )}

      {/* Proper Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-gray-100">
          <p className="text-sm font-bold text-gray-400">
            Showing <span className="text-gray-900">{(page - 1) * pagination.limit + 1}</span> to <span className="text-gray-900">{Math.min(page * pagination.limit, totalCount)}</span> of <span className="text-gray-900">{totalCount}</span> Categories
          </p>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-4 bg-white border-2 border-gray-50 rounded-2xl shadow-sm hover:shadow-xl hover:border-emerald-100 disabled:opacity-20 disabled:hover:shadow-none transition-all text-gray-600"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-2">
              {getPageNumbers().map((num, i) => (
                num === '...' ? (
                  <div key={`dots-${i}`} className="px-2">
                    <MoreHorizontal className="w-5 h-5 text-gray-300" />
                  </div>
                ) : (
                  <button
                    key={num}
                    onClick={() => handlePageChange(num as number)}
                    className={`w-12 h-12 rounded-2xl text-sm font-black transition-all ${
                      page === num 
                        ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-200 scale-110' 
                        : 'bg-white border-2 border-gray-50 text-gray-400 hover:border-emerald-500/20 hover:text-emerald-600'
                    }`}
                  >
                    {num}
                  </button>
                )
              ))}
            </div>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === pagination.totalPages}
              className="p-4 bg-white border-2 border-gray-50 rounded-2xl shadow-sm hover:shadow-xl hover:border-emerald-100 disabled:opacity-20 disabled:hover:shadow-none transition-all text-gray-600"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
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
