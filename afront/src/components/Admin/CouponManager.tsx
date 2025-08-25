import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Copy, Eye, EyeOff } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  min_order_amount: number;
  max_discount_amount?: number;
  usage_limit?: number;
  used_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

const CouponManager: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    description: '',
    min_order_amount: '',
    max_discount_amount: '',
    usage_limit: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  // Mock coupons data
  const mockCoupons: Coupon[] = [
    {
      id: '1',
      code: 'WELCOME20',
      type: 'percentage',
      value: 20,
      description: 'Welcome discount for new customers',
      min_order_amount: 100,
      max_discount_amount: 50,
      usage_limit: 100,
      used_count: 23,
      start_date: '2024-01-01T00:00:00Z',
      end_date: '2024-12-31T23:59:59Z',
      is_active: true,
      created_at: '2024-01-01T10:30:00Z',
    },
    {
      id: '2',
      code: 'SAVE50',
      type: 'fixed',
      value: 50,
      description: 'Fixed $50 discount on orders over $200',
      min_order_amount: 200,
      usage_limit: 50,
      used_count: 12,
      start_date: '2024-01-15T00:00:00Z',
      end_date: '2024-02-15T23:59:59Z',
      is_active: true,
      created_at: '2024-01-15T10:30:00Z',
    },
    {
      id: '3',
      code: 'EXPIRED10',
      type: 'percentage',
      value: 10,
      description: 'Expired 10% discount',
      min_order_amount: 50,
      usage_limit: 200,
      used_count: 45,
      start_date: '2023-12-01T00:00:00Z',
      end_date: '2023-12-31T23:59:59Z',
      is_active: false,
      created_at: '2023-12-01T10:30:00Z',
    },
  ];

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      // const response = await adminAPI.getCoupons();
      // setCoupons(response.data.data);
      
      // For now, use mock data
      setTimeout(() => {
        setCoupons(mockCoupons);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCoupon) {
        // await adminAPI.updateCoupon(editingCoupon.id, formData);
        toast.success('Coupon updated successfully!');
      } else {
        // await adminAPI.createCoupon(formData);
        toast.success('Coupon created successfully!');
      }
      
      setShowModal(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      description: coupon.description,
      min_order_amount: coupon.min_order_amount.toString(),
      max_discount_amount: coupon.max_discount_amount?.toString() || '',
      usage_limit: coupon.usage_limit?.toString() || '',
      start_date: coupon.start_date.split('T')[0],
      end_date: coupon.end_date.split('T')[0],
      is_active: coupon.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        // await adminAPI.deleteCoupon(id);
        toast.success('Coupon deleted successfully!');
        fetchCoupons();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete coupon');
      }
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied to clipboard!');
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      description: '',
      min_order_amount: '',
      max_discount_amount: '',
      usage_limit: '',
      start_date: '',
      end_date: '',
      is_active: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = coupon.is_active && !isExpired(coupon.end_date);
    } else if (statusFilter === 'inactive') {
      matchesStatus = !coupon.is_active;
    } else if (statusFilter === 'expired') {
      matchesStatus = isExpired(coupon.end_date);
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Coupon Management</h2>
          <p className="text-gray-400">Create and manage discount coupons</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingCoupon(null);
            setShowModal(true);
          }}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coupons..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Coupons</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">
              {filteredCoupons.length} coupon{filteredCoupons.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Coupons Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading coupons...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className={`bg-gray-800 border rounded-xl p-6 transition-all duration-300 group ${
                coupon.is_active && !isExpired(coupon.end_date)
                  ? 'border-gray-700 hover:border-purple-500/50'
                  : 'border-gray-600 opacity-75'
              }`}
            >
              {/* Coupon Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <code className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-lg font-mono text-lg font-bold">
                      {coupon.code}
                    </code>
                    <button
                      onClick={() => handleCopyCode(coupon.code)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm">{coupon.description}</p>
                </div>
                
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-300"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Coupon Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Discount:</span>
                  <span className="text-white font-semibold">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Min Order:</span>
                  <span className="text-white">${coupon.min_order_amount}</span>
                </div>

                {coupon.max_discount_amount && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Max Discount:</span>
                    <span className="text-white">${coupon.max_discount_amount}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Usage:</span>
                  <span className="text-white">
                    {coupon.used_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : ''}
                  </span>
                </div>
              </div>

              {/* Coupon Status */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  {coupon.is_active && !isExpired(coupon.end_date) ? (
                    <>
                      <Eye className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 text-sm font-medium">Active</span>
                    </>
                  ) : isExpired(coupon.end_date) ? (
                    <>
                      <EyeOff className="h-4 w-4 text-red-400" />
                      <span className="text-red-400 text-sm font-medium">Expired</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400 text-sm font-medium">Inactive</span>
                    </>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-gray-400 text-xs">Expires</p>
                  <p className="text-white text-sm">{formatDate(coupon.end_date)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredCoupons.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {searchQuery ? 'No coupons found matching your search.' : 'No coupons found.'}
          </div>
          {!searchQuery && (
            <button
              onClick={() => {
                resetForm();
                setEditingCoupon(null);
                setShowModal(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
            >
              Create Your First Coupon
            </button>
          )}
        </div>
      )}

      {/* Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Coupon Code *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="flex-1 bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                      placeholder="COUPON20"
                      required
                    />
                    <button
                      type="button"
                      onClick={generateCouponCode}
                      className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Discount Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    step={formData.type === 'percentage' ? '1' : '0.01'}
                    min="0"
                    max={formData.type === 'percentage' ? '100' : undefined}
                    className="w-full bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={formData.type === 'percentage' ? '20' : '50.00'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Minimum Order Amount *
                  </label>
                  <input
                    type="number"
                    name="min_order_amount"
                    value={formData.min_order_amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="100.00"
                    required
                  />
                </div>

                {formData.type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum Discount Amount
                    </label>
                    <input
                      type="number"
                      name="max_discount_amount"
                      value={formData.max_discount_amount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="50.00"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    name="usage_limit"
                    value={formData.usage_limit}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Describe this coupon..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="is_active" className="text-white">
                  Active (coupon can be used)
                </label>
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
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManager;