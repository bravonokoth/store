import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://d995c1540ce2.ngrok-free.app'; // Use HTTPS

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.MODE === 'development') {
      config.headers['ngrok-skip-browser-warning'] = '69420';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 419 && error.config.url !== '/auth/logout') {
      console.warn('CSRF token mismatch, retrying:', error.config.url);
      try {
        await api.get('/sanctum/csrf-cookie');
        return api.request(error.config);
      } catch (retryError) {
        console.error('Retry failed:', retryError);
      }
    }
    if (error.response?.status === 401 && error.config.url !== '/auth/logout') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('session_id');
      window.location.href = '/login';
    }
    if (error.response?.status === 405 && error.config.url === '/sanctum/csrf-cookie') {
      console.warn('CSRF endpoint returned 405, check Sanctum routes');
    }
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('ngrok')) {
      console.error('Ngrok splash page detected:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Parse API response
const parseResponse = (response: any) => {
  if (response.data.cart_items) {
    response.data.cart_items = response.data.cart_items.map((item: any) => ({
      ...item,
      product: item.product
        ? { ...item.product, price: Number(item.product.price || 0), stock: Number(item.product.stock || 0) }
        : { id: '', name: 'Unknown Product', price: 0, stock: 0, image: 'https://via.placeholder.com/150' },
    }));
    response.data.total = Number(response.data.total || 0);
  } else if (response.data.cart_item) {
    response.data.cart_item = {
      ...response.data.cart_item,
      product: response.data.cart_item.product
        ? {
            ...response.data.cart_item.product,
            price: Number(response.data.cart_item.product.price || 0),
            stock: Number(response.data.cart_item.product.stock || 0),
          }
        : { id: '', name: 'Unknown Product', price: 0, stock: 0, image: 'https://via.placeholder.com/150' },
    };
    response.data.total = Number(response.data.total || 0);
  }
  return response;
};

// Generate or retrieve sessionId
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Auth API
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    return api.post('/auth/login', credentials);
  },
  register: async (userData: any) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    return api.post('/auth/register', userData);
  },
  logout: async () => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    localStorage.removeItem('session_id');
    return api.post('/auth/logout');
  },
  getProfile: () => api.get('/auth/profile'),
  updateProfile: async (data: any) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    return api.put('/auth/profile', data);
  },
  updatePassword: async (data: any) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
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
  getCart: async (sessionId?: string) => {
    const effectiveSessionId = sessionId || getSessionId();
    const config = effectiveSessionId ? { params: { sessionId: effectiveSessionId } } : {};
    const response = await api.get('/cart', config);
    return parseResponse(response);
  },
  addToCart: async (data: { product_id: string; quantity: number }, sessionId?: string) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    const effectiveSessionId = sessionId || getSessionId();
    const response = await api.post('/cart', { ...data, sessionId: effectiveSessionId });
    return parseResponse(response);
  },
  updateCartItem: async (id: string, data: { quantity: number }, sessionId?: string) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    const effectiveSessionId = sessionId || getSessionId();
    const response = await api.put(`/cart/${id}`, { ...data, sessionId: effectiveSessionId });
    return parseResponse(response);
  },
  removeFromCart: async (id: string, sessionId?: string) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    const effectiveSessionId = sessionId || getSessionId();
    const response = await api.delete(`/cart/${id}`, { params: { sessionId: effectiveSessionId } });
    return parseResponse(response);
  },
  clearCart: async (sessionId?: string) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    const effectiveSessionId = sessionId || getSessionId();
    const response = await api.delete('/cart', { params: { sessionId: effectiveSessionId } });
    return parseResponse(response);
  },
};

// Address API
export const addressAPI = {
  createAddress: async (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code?: string;
    country?: string;
    type?: 'shipping' | 'billing';
    sessionId?: string;
  }) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    const effectiveSessionId = data.sessionId || getSessionId();
    return api.post('/api/addresses', { ...data, sessionId: effectiveSessionId });
  },
  getAddresses: async (sessionId?: string) => {
    const effectiveSessionId = sessionId || getSessionId();
    const config = effectiveSessionId ? { params: { sessionId: effectiveSessionId } } : {};
    return api.get('/api/addresses', config);
  },
  updateAddress: async (id: string, data: any, sessionId?: string) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    const effectiveSessionId = sessionId || getSessionId();
    return api.put(`/api/addresses/${id}`, { ...data, sessionId: effectiveSessionId });
  },
  deleteAddress: async (id: string, sessionId?: string) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    const effectiveSessionId = sessionId || getSessionId();
    const config = effectiveSessionId ? { params: { sessionId: effectiveSessionId } } : {};
    return api.delete(`/api/addresses/${id}`, config);
  },
};

// Checkout API
export const checkoutAPI = {
  getCheckoutData: async (sessionId?: string) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    const effectiveSessionId = sessionId || getSessionId();
    const config = effectiveSessionId ? { params: { sessionId: effectiveSessionId } } : {};
    const response = await api.get('/checkout', config);
    return parseResponse(response);
  },
};

// Order API
export const orderAPI = {
  createOrder: async (data: {
    shippingAddress: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code?: string;
      country?: string;
    };
    billingAddress: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code?: string;
      country?: string;
    };
    total: number;
    sessionId?: string;
  }) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    const effectiveSessionId = data.sessionId || getSessionId();
    return api.post('/api/orders', {
      shipping_address: data.shippingAddress,
      billing_address: data.billingAddress,
      total: data.total,
      sessionId: effectiveSessionId,
    });
  },
  getOrders: async (params?: any, sessionId?: string) => {
    const effectiveSessionId = sessionId || getSessionId();
    const config = effectiveSessionId ? { params: { ...params, sessionId: effectiveSessionId } } : { params };
    return api.get('/api/orders', config);
  },
  getOrder: async (id: string, sessionId?: string) => {
    const effectiveSessionId = sessionId || getSessionId();
    const config = effectiveSessionId ? { params: { sessionId: effectiveSessionId } } : {};
    return api.get(`/api/orders/${id}`, config);
  },
  updateOrderStatus: async (id: string, status: string, sessionId?: string) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    const effectiveSessionId = sessionId || getSessionId();
    const config = effectiveSessionId ? { params: { sessionId: effectiveSessionId } } : {};
    return api.patch(`/api/orders/${id}/status`, { status }, config);
  },
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAnalytics: (params?: any) => api.get('/admin/analytics', { params }),
  getCategories: (params?: any) => api.get('/admin/categories', { params }),
  createCategory: async (data: FormData) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    return api.post('/admin/categories', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateCategory: async (id: string, data: FormData) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    return api.post(`/admin/categories/${id}?_method=PUT`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),
  getProducts: (params?: any) => api.get('/admin/products', { params }),
  createProduct: async (data: FormData) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    return api.post('/admin/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateProduct: async (id: string, data: FormData) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    return api.post(`/admin/products/${id}?_method=PUT`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
  getOrders: (params?: any) => api.get('/admin/orders', { params }),
  updateOrder: async (id: string, data: any) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    return api.put(`/admin/orders/${id}`, data);
  },
  getInventory: () => api.get('/admin/inventory'),
  updateInventory: async (id: string, data: any) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    return api.put(`/admin/inventory/${id}`, data);
  },
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: async (data: any) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    return api.post('/admin/coupons', data);
  },
  updateCoupon: async (id: string, data: any) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    return api.put(`/admin/coupons/${id}`, data);
  },
  deleteCoupon: (id: string) => api.delete(`/admin/coupons/${id}`),
  uploadMedia: async (file: File) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getBanners: () => api.get('/admin/banners'),
  createBanner: async (data: any) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    return api.post('/admin/banners', data);
  },
  updateBanner: async (id: string, data: any) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    return api.put('/admin/banners/${id}', data);
  },
  deleteBanner: (id: string) => api.delete(`/admin/banners/${id}`),
};

// Contact API
export const contactAPI = {
  sendMessage: async (data: any) => {
    await api.get('/sanctum/csrf-cookie').catch((error) => console.warn('Failed to fetch CSRF token:', error.message));
    return api.post('/contact', data);
  },
};