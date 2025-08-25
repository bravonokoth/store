import axios from 'axios';

const API_BASE_URL = 'https://d933519734ab.ngrok-free.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  updatePassword: (data: any) => api.put('/auth/password', data),
};

// Product API
export const productAPI = {
  getProducts: (params?: any) => api.get('/products', { params }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  searchProducts: (query: string) => api.get(`/products/search?q=${query}`),
  getCategories: () => api.get('/categories'),
  getRelatedProducts: (id: string) => api.get(`/products/${id}/related`),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data: any) => api.post('/cart', data),
  updateCartItem: (id: string, data: any) => api.put(`/cart/${id}`, data),
  removeFromCart: (id: string) => api.delete(`/cart/${id}`),
  clearCart: () => api.delete('/cart'),
};

// Order API
export const orderAPI = {
  createOrder: (data: any) => api.post('/orders', data),
  getOrders: (params?: any) => api.get('/orders', { params }),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAnalytics: (params?: any) => api.get('/admin/analytics', { params }),
  
  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data: any) => api.post('/admin/categories', data),
  updateCategory: (id: string, data: any) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),
  
  // Products
  getProducts: (params?: any) => api.get('/admin/products', { params }),
  createProduct: (data: any) => api.post('/admin/products', data),
  updateProduct: (id: string, data: any) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
  
  // Orders
  getOrders: (params?: any) => api.get('/admin/orders', { params }),
  updateOrder: (id: string, data: any) => api.put(`/admin/orders/${id}`, data),
  
  // Inventory
  getInventory: () => api.get('/admin/inventory'),
  updateInventory: (id: string, data: any) => api.put(`/admin/inventory/${id}`, data),
  
  // Coupons
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data: any) => api.post('/admin/coupons', data),
  updateCoupon: (id: string, data: any) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id: string) => api.delete(`/admin/coupons/${id}`),
  
  // Media
  uploadMedia: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  // Banners
  getBanners: () => api.get('/admin/banners'),
  createBanner: (data: any) => api.post('/admin/banners', data),
  updateBanner: (id: string, data: any) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id: string) => api.delete(`/admin/banners/${id}`),
};

// Contact API
export const contactAPI = {
  sendMessage: (data: any) => api.post('/contact', data),
};