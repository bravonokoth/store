import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../../store/store';
import { orderAPI } from '../../services/api';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  Star, 
  Heart,
  ShoppingBag,
  TrendingUp,
  Calendar,
  Eye
} from 'lucide-react';
import OrderHistory from './OrderHistory';

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  created_at: string;
  items: any[];
}

const UserDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteProducts: 0,
    loyaltyPoints: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for recent orders
  const mockOrders: Order[] = [
    {
      id: '1',
      order_number: 'ORD-001',
      status: 'delivered',
      total: 299.99,
      created_at: '2024-01-15T10:30:00Z',
      items: [
        { id: '1', product: { name: 'Château Margaux 2015', image: 'https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg?auto=compress&cs=tinysrgb&w=300' }, quantity: 1 }
      ]
    },
    {
      id: '2',
      order_number: 'ORD-002',
      status: 'shipped',
      total: 189.99,
      created_at: '2024-01-10T14:22:00Z',
      items: [
        { id: '2', product: { name: 'Dom Pérignon 2012', image: 'https://images.pexels.com/photos/1174557/pexels-photo-1174557.jpeg?auto=compress&cs=tinysrgb&w=300' }, quantity: 1 }
      ]
    },
    {
      id: '3',
      order_number: 'ORD-003',
      status: 'processing',
      total: 89.99,
      created_at: '2024-01-08T09:15:00Z',
      items: [
        { id: '3', product: { name: 'Caymus Cabernet Sauvignon', image: 'https://images.pexels.com/photos/774455/pexels-photo-774455.jpeg?auto=compress&cs=tinysrgb&w=300' }, quantity: 1 }
      ]
    }
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls - replace with actual API calls
      // const ordersResponse = await orderAPI.getOrders({ limit: 5 });
      // setRecentOrders(ordersResponse.data.data);
      
      // For now, use mock data
      setRecentOrders(mockOrders);
      setStats({
        totalOrders: 12,
        totalSpent: 1459.87,
        favoriteProducts: 5,
        loyaltyPoints: 2840,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
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
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'processing':
        return 'text-blue-400 bg-blue-500/20';
      case 'shipped':
        return 'text-purple-400 bg-purple-500/20';
      case 'delivered':
        return 'text-green-400 bg-green-500/20';
      case 'cancelled':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="h-5 w-5" /> },
    { id: 'orders', label: 'Order History', icon: <Package className="h-5 w-5" /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent">{user?.name}!</span>
          </h1>
          <p className="text-gray-400">Here's what's happening with your account</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800 rounded-xl p-1 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400 group-hover:scale-110 transition-transform duration-300">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Orders</p>
                    <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-500/20 rounded-lg text-green-400 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Spent</p>
                    <p className="text-2xl font-bold text-white">${stats.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-500/20 rounded-lg text-red-400 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Favorites</p>
                    <p className="text-2xl font-bold text-white">{stats.favoriteProducts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform duration-300">
                    <Star className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Loyalty Points</p>
                    <p className="text-2xl font-bold text-white">{stats.loyaltyPoints}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Orders</h2>
                <Link
                  to="#"
                  onClick={() => setActiveTab('orders')}
                  className="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
                >
                  View All
                </Link>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading orders...</p>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No orders yet</p>
                  <Link
                    to="/products"
                    className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                    >
                      {/* Order Image */}
                      <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {order.items[0]?.product?.image ? (
                          <img
                            src={order.items[0].product.image}
                            alt={order.items[0].product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <p className="font-semibold text-white">#{order.order_number}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {formatDate(order.created_at)}
                        </p>
                      </div>

                      {/* Order Total */}
                      <div className="text-right">
                        <p className="font-bold text-white">${order.total.toFixed(2)}</p>
                        <button className="text-purple-400 hover:text-purple-300 transition-colors text-sm flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/products"
                className="bg-gradient-to-br from-purple-600/20 to-red-600/20 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500 transition-all duration-300 group"
              >
                <ShoppingBag className="h-8 w-8 text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-lg font-semibold text-white mb-2">Continue Shopping</h3>
                <p className="text-gray-400">Discover new wines and expand your collection</p>
              </Link>

              <button
                onClick={() => setActiveTab('wishlist')}
                className="bg-gradient-to-br from-red-600/20 to-pink-600/20 border border-red-500/30 rounded-xl p-6 hover:border-red-500 transition-all duration-300 group text-left"
              >
                <Heart className="h-8 w-8 text-red-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-lg font-semibold text-white mb-2">View Wishlist</h3>
                <p className="text-gray-400">Check your saved favorite wines</p>
              </button>

              <Link
                to="/profile"
                className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 hover:border-blue-500 transition-all duration-300 group"
              >
                <Calendar className="h-8 w-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-lg font-semibold text-white mb-2">Profile Settings</h3>
                <p className="text-gray-400">Update your account information</p>
              </Link>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && <OrderHistory />}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Your Wishlist</h2>
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <p className="text-gray-400 text-lg mb-4">Your wishlist is empty</p>
              <p className="text-gray-500 mb-6">Save your favorite wines to purchase later</p>
              <Link
                to="/products"
                className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300"
              >
                Browse Wines
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;