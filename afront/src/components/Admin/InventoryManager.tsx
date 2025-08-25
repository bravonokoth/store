import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, Package, TrendingDown, TrendingUp, Edit } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface InventoryItem {
  id: string;
  product: {
    id: string;
    name: string;
    image: string;
    category: string;
  };
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  reorder_level: number;
  last_updated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

const InventoryManager: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    current_stock: '',
    reorder_level: '',
  });

  // Mock inventory data
  const mockInventory: InventoryItem[] = [
    {
      id: '1',
      product: {
        id: '1',
        name: 'Château Margaux 2015',
        image: 'https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'Red Wine'
      },
      current_stock: 12,
      reserved_stock: 2,
      available_stock: 10,
      reorder_level: 5,
      last_updated: '2024-01-15T10:30:00Z',
      status: 'in_stock'
    },
    {
      id: '2',
      product: {
        id: '2',
        name: 'Dom Pérignon 2012',
        image: 'https://images.pexels.com/photos/1174557/pexels-photo-1174557.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'Champagne'
      },
      current_stock: 3,
      reserved_stock: 1,
      available_stock: 2,
      reorder_level: 5,
      last_updated: '2024-01-10T14:22:00Z',
      status: 'low_stock'
    },
    {
      id: '3',
      product: {
        id: '3',
        name: 'Caymus Cabernet Sauvignon',
        image: 'https://images.pexels.com/photos/774455/pexels-photo-774455.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'Red Wine'
      },
      current_stock: 0,
      reserved_stock: 0,
      available_stock: 0,
      reorder_level: 10,
      last_updated: '2024-01-08T09:15:00Z',
      status: 'out_of_stock'
    },
    {
      id: '4',
      product: {
        id: '4',
        name: 'Cloudy Bay Sauvignon Blanc',
        image: 'https://images.pexels.com/photos/2912108/pexels-photo-2912108.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'White Wine'
      },
      current_stock: 25,
      reserved_stock: 3,
      available_stock: 22,
      reorder_level: 8,
      last_updated: '2024-01-05T16:45:00Z',
      status: 'in_stock'
    }
  ];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      // const response = await adminAPI.getInventory();
      // setInventory(response.data.data);
      
      // For now, use mock data
      setTimeout(() => {
        setInventory(mockInventory);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem) return;

    try {
      // await adminAPI.updateInventory(editingItem.id, formData);
      toast.success('Inventory updated successfully!');
      
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      fetchInventory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update inventory');
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      current_stock: item.current_stock.toString(),
      reorder_level: item.reorder_level.toString(),
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      current_stock: '',
      reorder_level: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'low_stock':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'out_of_stock':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <TrendingUp className="h-4 w-4" />;
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4" />;
      case 'out_of_stock':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalProducts: inventory.length,
    inStock: inventory.filter(item => item.status === 'in_stock').length,
    lowStock: inventory.filter(item => item.status === 'low_stock').length,
    outOfStock: inventory.filter(item => item.status === 'out_of_stock').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Inventory Management</h2>
        <p className="text-gray-400">Monitor and manage your wine stock levels</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-gray-400 text-sm">Total Products</p>
              <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-gray-400 text-sm">In Stock</p>
              <p className="text-2xl font-bold text-green-400">{stats.inStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-gray-400 text-sm">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.lowStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <TrendingDown className="h-8 w-8 text-red-400" />
            <div>
              <p className="text-gray-400 text-sm">Out of Stock</p>
              <p className="text-2xl font-bold text-red-400">{stats.outOfStock}</p>
            </div>
          </div>
        </div>
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
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">
              {filteredInventory.length} item{filteredInventory.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading inventory...</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Reserved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Reorder Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-lg mr-4"
                        />
                        <div>
                          <div className="text-sm font-medium text-white">{item.product.name}</div>
                          <div className="text-sm text-gray-400">{item.product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {item.current_stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {item.available_stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {item.reserved_stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {item.reorder_level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span className="ml-2 capitalize">{item.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(item.last_updated)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Inventory Modal */}
      {showModal && editingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Update Inventory</h3>
              <p className="text-gray-400 text-sm mt-1">{editingItem.product.name}</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Stock *
                </label>
                <input
                  type="number"
                  name="current_stock"
                  value={formData.current_stock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reorder Level *
                </label>
                <input
                  type="number"
                  name="reorder_level"
                  value={formData.reorder_level}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p className="text-gray-500 text-xs mt-1">
                  Alert when stock falls below this level
                </p>
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
                  Update Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;