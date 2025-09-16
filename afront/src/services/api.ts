import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Enable cookies for CSRF (XSRF-TOKEN)
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add ngrok bypass header for all requests
    config.headers['ngrok-skip-browser-warning'] = '69420';
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 419) {
      // Avoid clearing state for logout endpoint to prevent conflicts
      if (error.config.url !== '/auth/logout') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      if (error.response?.status === 419) {
        console.error('CSRF token mismatch or missing for:', error.config.url);
      }
    }
    // Check for ngrok splash page
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('ngrok')) {
      console.error('Ngrok splash page detected in response:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    await api.get('/sanctum/csrf-cookie'); // Fetch CSRF token
    return api.post('/auth/login', credentials);
  },
  register: async (userData: any) => {
    await api.get('/sanctum/csrf-cookie');
    return api.post('/auth/register', userData);
  },
  logout: async () => {
    await api.get('/sanctum/csrf-cookie');
    return api.post('/auth/logout');
  },
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

// Address API
export const addressAPI = {
  createAddress: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    zip_code?: string;
    type: 'shipping' | 'billing';
    sessionId?: string;
  }) => api.post('/addresses', { ...data, city: 'Nairobi', state: 'Nairobi' }),
  getAddresses: () => api.get('/addresses'),
  updateAddress: (id: string, data: any) => api.put(`/addresses/${id}`, { ...data, city: 'Nairobi', state: 'Nairobi' }),
  deleteAddress: (id: string) => api.delete(`/addresses/${id}`),
};

// Order API
export const orderAPI = {
  createOrder: async (data: {
    items: any[];
    shippingAddress: any;
    billingAddress: any;
    paymentInfo: any;
    total: number;
    sessionId?: string;
  }) => {
    await api.get('/sanctum/csrf-cookie'); // Fetch CSRF token
    const shippingResponse = await addressAPI.createAddress({
      ...data.shippingAddress,
      type: 'shipping',
      sessionId: data.sessionId,
      city: 'Nairobi',
      state: 'Nairobi',
    });
    const billingResponse = data.billingAddress === data.shippingAddress
      ? shippingResponse
      : await addressAPI.createAddress({
          ...data.billingAddress,
          type: 'billing',
          sessionId: data.sessionId,
          city: 'Nairobi',
          state: 'Nairobi',
        });

    return api.post('/orders', {
      items: data.items,
      shipping_address_id: shippingResponse.data.id,
      billing_address_id: billingResponse.data.id,
      paymentInfo: data.paymentInfo,
      total: data.total,
      sessionId: data.sessionId,
    });
  },
  getOrders: (params?: any) => api.get('/orders', { params }),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAnalytics: (params?: any) => api.get('/admin/analytics', { params }),
  getCategories: (params?: any) => api.get('/admin/categories', { params }),
  createCategory: async (data: FormData) => {
    await api.get('/sanctum/csrf-cookie'); // Fetch CSRF token
    return api.post('/admin/categories', data, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'ngrok-skip-browser-warning': '69420', // Bypass ngrok splash
      },
    });
  },
  updateCategory: async (id: string, data: FormData) => {
    await api.get('/sanctum/csrf-cookie'); // Fetch CSRF token
    return api.post(`/admin/categories/${id}?_method=PUT`, data, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'ngrok-skip-browser-warning': '69420', // Bypass ngrok splash
      },
    });
  },
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),
  getProducts: (params?: any) => api.get('/admin/products', { params }),
  createProduct: async (data: FormData) => {
    await api.get('/sanctum/csrf-cookie'); // Fetch CSRF token
    return api.post('/admin/products', data, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'ngrok-skip-browser-warning': '69420',
      },
    });
  },
  updateProduct: async (id: string, data: FormData) => {
    await api.get('/sanctum/csrf-cookie'); // Fetch CSRF token
    return api.post(`/admin/products/${id}?_method=PUT`, data, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'ngrok-skip-browser-warning': '69420',
      },
    });
  },
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
  getOrders: (params?: any) => api.get('/admin/orders', { params }),
  updateOrder: (id: string, data: any) => api.put(`/admin/orders/${id}`, data),
  getInventory: () => api.get('/admin/inventory'),
  updateInventory: (id: string, data: any) => api.put(`/admin/inventory/${id}`, data),
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: async (data: any) => {
    await api.get('/sanctum/csrf-cookie'); // Fetch CSRF token
    return api.post('/admin/coupons', data);
  },
  updateCoupon: async (id: string, data: any) => {
    await api.get('/sanctum/csrf-cookie'); // Fetch CSRF token
    return api.put(`/admin/coupons/${id}`, data);
  },
  deleteCoupon: (id: string) => api.delete(`/admin/coupons/${id}`),
  uploadMedia: async (file: File) => {
    await api.get('/sanctum/csrf-cookie'); // Fetch CSRF token
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/media', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'ngrok-skip-browser-warning': '69420',
      },
    });
  },
  getBanners: () => api.get('/admin/banners'),
  createBanner: async (data: any) => {
    await api.get('/sanctum/csrf-cookie'); // Fetch CSRF token
    return api.post('/admin/banners', data);
  },
  updateBanner: async (id: string, data: any) => {
    await api.get('/sanctum/csrf-cookie'); // Fetch CSRF token
    return api.put(`/admin/banners/${id}`, data);
  },
  deleteBanner: (id: string) => api.delete(`/admin/banners/${id}`),
};

// Contact API
export const contactAPI = {
  sendMessage: async (data: any) => {
    await api.get('/sanctum/csrf-cookie'); // Fetch CSRF token
    return api.post('/contact', data);
  },
};