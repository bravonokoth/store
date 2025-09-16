import React, { useState, useEffect, Component, ReactNode } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center text-red-500">
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p>Please try refreshing the page or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  products_count: number;
  created_at: string;
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null as File | null,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Mock categories data (for fallback/testing)
  const mockCategories: Category[] = [
    {
      id: '1',
      name: 'Red Wine',
      slug: 'red-wine',
      description: 'Full-bodied red wines from various regions',
      image: null,
      products_count: 45,
      created_at: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'White Wine',
      slug: 'white-wine',
      description: 'Crisp and refreshing white wines',
      image: null,
      products_count: 32,
      created_at: '2024-01-10T14:22:00Z',
    },
  ];

  useEffect(() => {
    fetchCategories(page);
  }, [page]);

  const fetchCategories = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getCategories({ page: pageNum });
      console.log('Categories API Response:', response.data); // Debug log
      const fetchedCategories = Array.isArray(response.data.data) ? response.data.data : [];
      setCategories(fetchedCategories);
      setTotalPages(Number(response.data.last_page) || 1);
      setTotalItems(Number(response.data.total) || 0);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error fetching categories:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      if (error.response?.status === 419) {
        toast.error('Session expired or CSRF token missing. Please log in again.');
      } else {
        toast.error('Failed to load categories, using mock data');
      }
      setCategories(mockCategories);
      setTotalPages(1);
      setTotalItems(mockCategories.length);
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editingCategory) {
        await adminAPI.updateCategory(editingCategory.id, formDataToSend);
        toast.success('Category updated successfully!');
      } else {
        await adminAPI.createCategory(formDataToSend);
        toast.success('Category created successfully!');
      }
      setShowModal(false);
      setEditingCategory(null);
      setImagePreview(null);
      resetForm();
      setPage(1); // Reset to page 1
      fetchCategories(1);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save category';
      if (error.response?.status === 419) {
        toast.error('Session expired or CSRF token missing. Please log in again.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to perform this action');
      } else {
        toast.error(message);
      }
      console.error('Error saving category:', {
        message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      image: null,
    });
    setImagePreview(category.image ? `/storage/${category.image}` : null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await adminAPI.deleteCategory(id);
        toast.success('Category deleted successfully!');
        setPage(1); // Reset to page 1
        fetchCategories(1);
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to delete category';
        if (error.response?.status === 419) {
          toast.error('Session expired or CSRF token missing. Please log in again.');
        } else if (error.response?.status === 403) {
          toast.error('You do not have permission to perform this action');
        } else {
          toast.error(message);
        }
        console.error('Error deleting category:', {
          message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: null,
    });
    setImagePreview(null);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const filteredCategories = Array.isArray(categories)
    ? categories.filter(category =>
        category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <ErrorBoundary>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Category Management</h2>
            <p className="text-gray-400">Organize your wine collection by categories</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingCategory(null);
              setShowModal(true);
            }}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-400">Loading categories...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 flex items-start space-x-4">
                      {category.image && (
                        <img
                          src={`/storage/${category.image}`}
                          alt={category.name || 'Category'}
                          crossOrigin="anonymous"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                          {category.name || 'Unnamed Category'}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {category.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-300"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{category.products_count || 0}</p>
                      <p className="text-gray-400 text-xs">Products</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Created</p>
                      <p className="text-white text-sm">{formatDate(category.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 text-white">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 transition-all"
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages} ({totalItems} categories)
                </span>
                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {filteredCategories.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {searchQuery ? 'No categories found matching your search.' : 'No categories found.'}
            </div>
            {!searchQuery && (
              <button
                onClick={() => {
                  resetForm();
                  setEditingCategory(null);
                  setShowModal(true);
                }}
                className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
              >
                Create Your First Category
              </button>
            )}
          </div>
        )}

        {/* Category Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-bold text-white">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Red Wine"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Describe this category..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category Image
                  </label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      crossOrigin="anonymous"
                      className="mt-2 w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white rounded-lg transition-all duration-300"
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default CategoryManager;