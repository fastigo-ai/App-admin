import React, { useState, useEffect } from 'react';
import { X, Upload, Tag, FileText, Image as ImageIcon } from 'lucide-react';

interface CategoryFormProps {
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  initialData?: any;
  isLoading?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onClose, onSubmit, initialData, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      if (initialData.image) {
        setPreview(initialData.image);
      }
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (image) {
      formData.append('image', image);
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit Category' : 'Create New Category'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <Tag className="w-4 h-4 mr-2 text-blue-600" />
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-blue-600" />
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what types of services belong to this category..."
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <ImageIcon className="w-4 h-4 mr-2 text-blue-600" />
              Category Image
            </label>
            <div className="flex flex-col items-center justify-center w-full">
              <label 
                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  preview ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                {preview ? (
                  <div className="relative w-full h-full p-2">
                    <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                      <p className="text-white text-xs font-medium">Click to change image</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold text-blue-600">Upload Category Image</span>
                    </p>
                    <p className="text-xs text-gray-400">Click to browse or drag and drop</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
              <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100 w-full">
                <p className="text-[10px] text-purple-700 leading-relaxed">
                  💡 Tip: Choose an icon or image that represents this category. Recommended: 400x300px, max 2MB
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Tag className="w-4 h-4 mr-2" />
              )}
              {initialData ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
