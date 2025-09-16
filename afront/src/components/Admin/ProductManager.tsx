import React, { useState, useEffect, Component, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Search, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { RootState } from '../../store/store';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';


const API_BASE_URL = process.env.VITE_APP_API_BASE_URL || 'http://localhost:8000';

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

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: { id: string; name: string };
  description: string | null;
  stock: number;
  sku: string;
  discount_price: number | null;
  seo_title: string | null;
  seo_description: string | null;
  is_active: boolean;
  created_at: string;
  media: { path: string }[];
}

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    category_id: '',
    description: '',
    stock: '',
    is_active: 'true',
    sku: '',
    discount_price: '',
    seo_title: '',
    seo_description: '',
    image: null as File | null,
  });
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [token]);

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.getCategories();
      console.log('Categories API Response:', response.data);
      const fetchedCategories = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];
      setCategories(fetchedCategories);
    } catch (error: any) {
      console.error('Error fetching categories:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      if (error.response?.status === 419) {
        toast.error('Session expired or CSRF token missing. Please log in again.');
      } else if (error.response?.status === 405) {
        toast.error('CSRF endpoint unavailable. Please check backend configuration.');
      } else {
        toast.error('Failed to fetch categories');
      }
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getProducts();
      console.log('Products API Response:', response.data);
      const fetchedProducts = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];
      setProducts(fetchedProducts);
    } catch (error: any) {
      console.error('Error fetching products:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      if (error.response?.status === 419) {
        toast.error('Session expired or CSRF token missing. Please log in again.');
      } else if (error.response?.status === 405) {
        toast.error('CSRF endpoint unavailable. Please check backend configuration.');
      } else {
        toast.error('Failed to fetch products');
      }
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'name' && { slug: value.toLowerCase().replace(/\s+/g, '-') }),
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
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('is_active', formData.is_active === 'true' ? '1' : '0');
      if (formData.image) formDataToSend.append('image', formData.image);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('sku', formData.sku);
      formDataToSend.append('discount_price', formData.discount_price);
      formDataToSend.append('seo_title', formData.seo_title);
      formDataToSend.append('seo_description', formData.seo_description);

      // Log FormData for debugging
      console.log('FormData to send:', Array.from(formDataToSend.entries()));

      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct.id, formDataToSend);
        toast.success('Product updated successfully!');
      } else {
        await adminAPI.createProduct(formDataToSend);
        toast.success('Product created successfully!');
      }

      setShowModal(false);
      setEditingProduct(null);
      setImagePreview(null);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save product';
      const errors = error.response?.data?.errors || {};
      if (error.response?.status === 419) {
        toast.error('Session expired or CSRF token missing. Please log in again.');
      } else if (error.response?.status === 405) {
        toast.error('CSRF endpoint unavailable. Please check backend configuration.');
      } else if (error.response?.status === 422) {
        const errorMessages = Object.values(errors).flat().join(', ');
        toast.error(`Validation error: ${errorMessages || message}`);
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to perform this action');
      } else {
        toast.error(message);
      }
      console.error('Error saving product:', {
        message,
        errors,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      price: product.price?.toString() || '',
      category_id: product.category?.id || '',
      description: product.description || '',
      stock: product.stock?.toString() || '',
      is_active: product.is_active ? 'true' : 'false',
      sku: product.sku || '',
      discount_price: product.discount_price?.toString() || '',
      seo_title: product.seo_title || '',
      seo_description: product.seo_description || '',
      image: null,
    });
    setImagePreview(product.media?.[0]?.path ? `${API_BASE_URL}/storage/${product.media[0].path}` : null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminAPI.deleteProduct(id);
        toast.success('Product deleted successfully!');
        fetchProducts();
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to delete product';
        if (error.response?.status === 419) {
          toast.error('Session expired or CSRF token missing. Please log in again.');
        } else if (error.response?.status === 405) {
          toast.error('CSRF endpoint unavailable. Please check backend configuration.');
        } else if (error.response?.status === 403) {
          toast.error('You do not have permission to perform this action');
        } else {
          toast.error(message);
        }
        console.error('Error deleting product:', {
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
      slug: '',
      price: '',
      category_id: '',
      description: '',
      stock: '',
      is_active: 'true',
      sku: '',
      discount_price: '',
      seo_title: '',
      seo_description: '',
      image: null,
    });
    setImagePreview(null);
  };

  const filteredProducts = Array.isArray(products)
    ? products.filter((product) => {
        const matchesSearch =
          product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = categoryFilter === 'all' || product.category?.id === categoryFilter;
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? product.is_active : !product.is_active);
        return matchesSearch && matchesCategory && matchesStatus;
      })
    : [];

  return (
    <ErrorBoundary>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
            <p className="text-gray-600">Manage your wine inventory</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingProduct(null);
              setShowModal(true);
            }}
            className="mt-4 sm:mt-0 bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-all flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        </div>

        <div className="bg-white border border-gray-300 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 text-gray-800 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name || 'Unnamed Category'}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 text-gray-800 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600 text-sm">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-300 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-100 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={
                              product.media?.[0]?.path
                                ? `${API_BASE_URL}/storage/${product.media[0].path}`
                                : '/fallback-image.jpg'
                            }
                            alt={product.name || 'Product'}
                            crossOrigin="anonymous"
                            className="w-12 h-12 object-cover rounded-lg mr-4"
                            onError={(e) => {
                              console.error('Failed to load image:', e.currentTarget.src);
                              e.currentTarget.src = '/fallback-image.jpg';
                            }}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-800">
                              {product.name || 'Unnamed Product'}
                            </div>
                            <div className="text-sm text-gray-600 truncate max-w-xs">
                              {product.description || 'No description'}
                            </div>
                          </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-600">
                            {product.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          ${product.discount_price || product.price?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          <span
                            className={
                              product.stock === 0
                                ? 'text-red-500'
                                : product.stock < 10
                                ? 'text-yellow-500'
                                : 'text-green-500'
                            }
                          >
                            {product.stock || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.is_active
                                ? 'bg-green-500/20 text-green-600'
                                : 'bg-red-500/20 text-red-600'
                            }`}
                          >
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-blue-600 hover:text-blue-500 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-500 transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white border border-gray-300 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-300">
                  <h3 className="text-xl font-bold text-gray-800">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 text-gray-800 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 text-gray-800 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full border border-gray-300 text-gray-800 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price</label>
                      <input
                        type="number"
                        name="discount_price"
                        value={formData.discount_price}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full border border-gray-300 text-gray-800 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 text-gray-800 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name || 'Unnamed Category'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 text-gray-800 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                      <select
                        name="is_active"
                        value={formData.is_active}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 text-gray-800 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 text-gray-800 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                      <input
                        type="file"
                        name="image"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="w-full border border-gray-300 text-gray-800 px-4 py-3 rounded-lg"
                      />
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          crossOrigin="anonymous"
                          className="mt-2 w-32 h-32 object-cover rounded-lg"
                          onError={(e) => {
                            console.error('Failed to load image preview:', e.currentTarget.src);
                            e.currentTarget.src = '/fallback-image.jpg';
                          }}
                        />
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full border border-gray-300 text-gray-800 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        placeholder="Enter product description..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                      <input
                        type="text"
                        name="seo_title"
                        value={formData.seo_title}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 text-gray-800 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
                      <textarea
                        name="seo_description"
                        value={formData.seo_description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full border border-gray-300 text-gray-800 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                    >
                      {editingProduct ? 'Update Product' : 'Create Product'}
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

  export default ProductManager;