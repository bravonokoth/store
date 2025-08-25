import React, { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import { Package, Search, Filter, Eye, Download, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  created_at: string;
  items: Array<{
    id: string;
    product: {
      id: string;
      name: string;
      image: string;
    };
    quantity: number;
    price: number;
  }>;
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mock data for orders
  const mockOrders: Order[] = [
    {
      id: '1',
      order_number: 'ORD-001',
      status: 'delivered',
      total: 299.99,
      created_at: '2024-01-15T10:30:00Z',
      items: [
        {
          id: '1',
          product: {
            id: '1',
            name: 'Château Margaux 2015',
            image: 'https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg?auto=compress&cs=tinysrgb&w=300'
          },
          quantity: 1,
          price: 299.99
        }
      ]
    },
    {
      id: '2',
      order_number: 'ORD-002',
      status: 'shipped',
      total: 189.99,
      created_at: '2024-01-10T14:22:00Z',
      items: [
        {
          id: '2',
          product: {
            id: '2',
            name: 'Dom Pérignon 2012',
            image: 'https://images.pexels.com/photos/1174557/pexels-photo-1174557.jpeg?auto=compress&cs=tinysrgb&w=300'
          },
          quantity: 1,
          price: 189.99
        }
      ]
    },
    {
      id: '3',
      order_number: 'ORD-003',
      status: 'processing',
      total: 179.97,
      created_at: '2024-01-08T09:15:00Z',
      items: [
        {
          id: '3',
          product: {
            id: '3',
            name: 'Caymus Cabernet Sauvignon',
            image: 'https://images.pexels.com/photos/774455/pexels-photo-774455.jpeg?auto=compress&cs=tinysrgb&w=300'
          },
          quantity: 2,
          price: 89.99
        }
      ]
    },
    {
      id: '4',
      order_number: 'ORD-004',
      status: 'pending',
      total: 44.98,
      created_at: '2024-01-05T16:45:00Z',
      items: [
        {
          id: '4',
          product: {
            id: '4',
            name: 'Cloudy Bay Sauvignon Blanc',
            image: 'https://images.pexels.com/photos/2912108/pexels-photo-2912108.jpeg?auto=compress&cs=tinysrgb&w=300'
          },
          quantity: 1,
          price: 24.99
        },
        {
          id: '5',
          product: {
            id: '5',
            name: 'Whispering Angel Rosé',
            image: 'https://images.pexels.com/photos/1123260/pexels-photo-1123260.jpeg?auto=compress&cs=tinysrgb&w=300'
          },
          quantity: 1,
          price: 19.99
        }
      ]
    }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // const response = await orderAPI.getOrders();
      // setOrders(response.data.data);
      
      // For now, use mock data
      setTimeout(() => {
        setOrders(mockOrders);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'processing':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'shipped':
        return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'delivered':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'cancelled':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.product.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-400">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders by number or product..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
          <p className="text-gray-400">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search criteria'
              : 'You haven\'t placed any orders yet'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">#{order.order_number}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-2 capitalize">{order.status}</span>
                    </span>
                  </div>
                  <p className="text-gray-400">Placed on {formatDate(order.created_at)}</p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-white">${order.total.toFixed(2)}</p>
                  <p className="text-gray-400 text-sm">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{item.product.name}</p>
                      <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                    <Download className="h-4 w-4" />
                    <span>Download Invoice</span>
                  </button>
                </div>

                {order.status === 'delivered' && (
                  <button className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300">
                    Reorder
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Order Info */}
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">#{selectedOrder.order_number}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ml-2 capitalize">{selectedOrder.status}</span>
                    </span>
                  </div>
                  <p className="text-gray-400">Placed on {formatDate(selectedOrder.created_at)}</p>
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white">{item.product.name}</p>
                          <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                          <p className="text-gray-400 text-sm">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <span className="text-xl font-bold text-white">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;