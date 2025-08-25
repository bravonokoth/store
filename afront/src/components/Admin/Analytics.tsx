import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Calendar, TrendingUp, Users, Package, DollarSign } from 'lucide-react';

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for charts
  const revenueData = [
    { name: 'Jan', revenue: 4000, orders: 240 },
    { name: 'Feb', revenue: 3000, orders: 139 },
    { name: 'Mar', revenue: 2000, orders: 980 },
    { name: 'Apr', revenue: 2780, orders: 390 },
    { name: 'May', revenue: 1890, orders: 480 },
    { name: 'Jun', revenue: 2390, orders: 380 },
    { name: 'Jul', revenue: 3490, orders: 430 },
    { name: 'Aug', revenue: 4000, orders: 520 },
    { name: 'Sep', revenue: 3200, orders: 410 },
    { name: 'Oct', revenue: 4100, orders: 580 },
    { name: 'Nov', revenue: 3800, orders: 490 },
    { name: 'Dec', revenue: 4500, orders: 620 },
  ];

  const categoryData = [
    { name: 'Red Wine', value: 400, color: '#ef4444' },
    { name: 'White Wine', value: 300, color: '#f59e0b' },
    { name: 'Sparkling', value: 200, color: '#8b5cf6' },
    { name: 'Rosé', value: 150, color: '#ec4899' },
    { name: 'Champagne', value: 100, color: '#06b6d4' },
  ];

  const topProductsData = [
    { name: 'Château Margaux', sales: 120, revenue: 35988 },
    { name: 'Dom Pérignon', sales: 98, revenue: 18601 },
    { name: 'Caymus Cabernet', sales: 86, revenue: 7739 },
    { name: 'Opus One', sales: 72, revenue: 25200 },
    { name: 'Krug Grande', sales: 65, revenue: 19500 },
  ];

  const userGrowthData = [
    { name: 'Week 1', users: 100 },
    { name: 'Week 2', users: 120 },
    { name: 'Week 3', users: 140 },
    { name: 'Week 4', users: 180 },
    { name: 'Week 5', users: 220 },
    { name: 'Week 6', users: 250 },
    { name: 'Week 7', users: 290 },
    { name: 'Week 8', users: 320 },
  ];

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' },
  ];

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header with Date Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Analytics Overview</h2>
          <p className="text-gray-400">Track your store's performance and growth</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Revenue and Orders Chart */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-6">
              <DollarSign className="h-6 w-6 text-green-400" />
              <h3 className="text-xl font-semibold text-white">Revenue & Orders Over Time</h3>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis yAxisId="left" stroke="#9ca3af" />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#8b5cf6" name="Revenue ($)" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales by Category */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Package className="h-6 w-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-white">Sales by Category</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* User Growth */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Users className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">User Growth</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#3b82f6" 
                    fill="url(#colorUsers)" 
                  />
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="h-6 w-6 text-orange-400" />
              <h3 className="text-xl font-semibold text-white">Top Selling Products</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={120} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="sales" fill="#f59e0b" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Conversion Rate</h4>
              <div className="text-3xl font-bold text-green-400 mb-2">3.2%</div>
              <p className="text-gray-400 text-sm">+0.5% from last month</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Average Order Value</h4>
              <div className="text-3xl font-bold text-blue-400 mb-2">$127.50</div>
              <p className="text-gray-400 text-sm">+$12.30 from last month</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Customer Retention</h4>
              <div className="text-3xl font-bold text-purple-400 mb-2">68%</div>
              <p className="text-gray-400 text-sm">+5% from last month</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;