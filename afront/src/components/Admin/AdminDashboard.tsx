import React, { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  DollarSign,
  Eye,
  Settings
} from 'lucide-react';
import Analytics from './Analytics';
import ProductManager from './ProductManager';
import OrderManager from './OrderManager';
import CategoryManager from './CategoryManager';
import InventoryManager from './InventoryManager';
import CouponManager from './CouponManager';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  const tabs = [
    { id: 'analytics', label: '📊 Analytics', icon: <BarChart3 className="h-5 w-5" /> },
    { id: 'products', label: '📦 Products', icon: <Package className="h-5 w-5" /> },
    { id: 'orders', label: '🛒 Orders', icon: <ShoppingCart className="h-5 w-5" /> },
    { id: 'categories', label: '📂 Categories', icon: <Settings className="h-5 w-5" /> },
    { id: 'inventory', label: '📋 Inventory', icon: <Eye className="h-5 w-5" /> },
    { id: 'coupons', label: '🎫 Coupons', icon: <TrendingUp className="h-5 w-5" /> },
  ];

  // Mock stats data
  const stats = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1%',
      changeType: 'positive' as const,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Orders',
      value: '2,350',
      change: '+180.1%',
      changeType: 'positive' as const,
      icon: <ShoppingCart className="h-6 w-6" />,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Products',
      value: '1,234',
      change: '+19%',
      changeType: 'positive' as const,
      icon: <Package className="h-6 w-6" />,
      color: 'from-purple-500 to-violet-600'
    },
    {
      title: 'Active Users',
      value: '573',
      change: '+201',
      changeType: 'positive' as const,
      icon: <Users className="h-6 w-6" />,
      color: 'from-orange-500 to-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Admin <span className="bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-gray-400">Manage your wine store operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">from last month</span>
                  </div>
                </div>
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 bg-gray-800 rounded-xl p-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'products' && <ProductManager />}
          {activeTab === 'orders' && <OrderManager />}
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'inventory' && <InventoryManager />}
          {activeTab === 'coupons' && <CouponManager />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;