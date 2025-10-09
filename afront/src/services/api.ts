import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
      if (error.config.url !== '/auth/logout') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      if (error.response?.status === 419) {
        console.error('CSRF token mismatch or missing for:', error.config.url);
      }
    }
    if (error.response?.status === 405 && error.config.url === '/sanctum/csrf-cookie') {
      console.warn('CSRF endpoint returned 405, check Sanctum route registration');
      // Optionally proceed without CSRF if endpoint is exempted
    }
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
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.post('/auth/login', credentials);
  },
  register: async (userData: any) => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.post('/auth/register', userData);
  },
  logout: async () => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.post('/auth/logout');
  },
  getProfile: () => api.get('/auth/profile'),
  updateProfile: async (data: any) => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.put('/auth/profile', data);
  },
  updatePassword: async (data: any) => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.put('/auth/password', data);
  },
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
  getCart: (sessionId?: string) => {
    const config = sessionId ? { params: { sessionId } } : {};
    return api.get('/cart', config);
  },

  addToCart: async (data: any, sessionId?: string) => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.post('/cart', { ...data, sessionId });
  },

  updateCartItem: async (id: string, data: any, sessionId?: string) => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.put(`/cart/${id}`, { ...data, sessionId });
  },

  removeFromCart: (id: string, sessionId?: string) => {
    const config = sessionId ? { params: { sessionId } } : {};
    return api.delete(`/cart/${id}`, config);
  },

  clearCart: (sessionId?: string) => {
    const config = sessionId ? { params: { sessionId } } : {};
    return api.delete('/cart', config);
  },
};

// Address API
export const addressAPI = {
  createAddress: async (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string; // Changed from phone
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code?: string; // Changed from zip_code
    country?: string;
    type?: 'shipping' | 'billing';
    sessionId?: string;
  }) => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.post('/api/addresses', { ...data });
  },
  getAddresses: (sessionId?: string) => {
    const config = sessionId ? { params: { sessionId } } : {};
    return api.get('/api/addresses', config);
  },
  updateAddress: async (id: string, data: any, sessionId?: string) => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.put(`/api/addresses/${id}`, { ...data, sessionId });
  },
  deleteAddress: (id: string, sessionId?: string) => {
    const config = sessionId ? { params: { sessionId } } : {};
    return api.delete(`/api/addresses/${id}`, config);
  },
};

// Checkout API
export const checkoutAPI = {
  getCheckoutData: async (sessionId?: string) => {
    try {
      await api.get('/sanctum/csrf-cookie');
      const config = sessionId ? { params: { sessionId } } : {};
      return await api.get('/checkout', config);
    } catch (error) {
      console.warn('Failed to fetch checkout data:', error);
      throw error;
    }
  },
};

// Order API
export const orderAPI = {
  createOrder: async (data: {
    shippingAddress: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string; // Changed from phone
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code?: string; // Changed from zip_code
      country?: string;
    };
    billingAddress: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string; // Changed from phone
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code?: string; // Changed from zip_code
      country?: string;
    };
    total: number;
    sessionId?: string;
  }) => {
    try {
      await api.get('/sanctum/csrf-cookie');
      return await api.post('/api/orders', {
        shipping_address: data.shippingAddress,
        billing_address: data.billingAddress,
        total: data.total,
        sessionId: data.sessionId,
      });
    } catch (error) {
      console.error('Order creation failed:', error);
      throw error;
    }
  },
  getOrders: (params?: any, sessionId?: string) => {
    const config = sessionId ? { params: { ...params, sessionId } } : { params };
    return api.get('/api/orders', config);
  },
  getOrder: (id: string, sessionId?: string) => {
    const config = sessionId ? { params: { sessionId } } : {};
    return api.get(`/api/orders/${id}`, config);
  },
  updateOrderStatus: async (id: string, status: string, sessionId?: string) => {
    try {
      await api.get('/sanctum/csrf-cookie');
      const config = sessionId ? { params: { sessionId } } : {};
      return await api.patch(`/api/orders/${id}/status`, { status }, config);
    } catch (error) {
      console.warn('Failed to update order status:', error);
      throw error;
    }
  },
};


// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAnalytics: (params?: any) => api.get('/admin/analytics', { params }),
  getCategories: (params?: any) => api.get('/admin/categories', { params }),
  createCategory: async (data: FormData) => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.post('/admin/categories', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'ngrok-skip-browser-warning': '69420',
      },
    });
  },
  updateCategory: async (id: string, data: FormData) => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.post(`/admin/categories/${id}?_method=PUT`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'ngrok-skip-browser-warning': '69420',
      },
    });
  },
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),
  getProducts: (params?: any) => api.get('/admin/products', { params }),
  createProduct: async (data: FormData) => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.post('/admin/products', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'ngrok-skip-browser-warning': '69420',
      },
    });
  },
  updateProduct: async (id: string, data: FormData) => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.post(`/admin/products/${id}?_method=PUT`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'ngrok-skip-browser-warning': '69420',
      },
    });
  },
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
  getOrders: (params?: any) => api.get('/admin/orders', { params }),
  updateOrder: async (id: string, data: any) => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.put(`/admin/orders/${id}`, data);
  },
  getInventory: () => api.get('/admin/inventory'),
  updateInventory: async (id: string, data: any) => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.put(`/admin/inventory/${id}`, data);
  },
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: async (data: any) => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.post('/admin/coupons', data);
  },
  updateCoupon: async (id: string, data: any) => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.put(`/admin/coupons/${id}`, data);
  },
  deleteCoupon: (id: string) => api.delete(`/admin/coupons/${id}`),
  uploadMedia: async (file: File) => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
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
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.post('/admin/banners', data);
  },
  updateBanner: async (id: string, data: any) => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.put(`/admin/banners/${id}`, data);
  },
  deleteBanner: (id: string) => api.delete(`/admin/banners/${id}`),
};

// Contact API
export const contactAPI = {
  sendMessage: async (data: any) => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (error: any) {
      console.warn('Failed to fetch CSRF token:', error.message);
    }
    return api.post('/contact', data);
  },
};