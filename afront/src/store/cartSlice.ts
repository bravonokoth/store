import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { cartAPI } from '../services/api';

interface CartItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
  };
  quantity: number;
  session_id?: string; // Added for guest cart
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: JSON.parse(localStorage.getItem('guest_cart') || '[]'), // Initialize with guest cart
  total: 0,
  itemCount: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { getState }) => {
  const { auth } = getState() as { auth: { isAuthenticated: boolean } };
  if (auth.isAuthenticated) {
    const response = await cartAPI.getCart();
    return response.data.cart_items;
  }
  return JSON.parse(localStorage.getItem('guest_cart') || '[]');
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ product_id, quantity }: { product_id: string; quantity: number }, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: { isAuthenticated: boolean } };
    try {
      if (auth.isAuthenticated) {
        const response = await cartAPI.addToCart({ product_id, quantity });
        return response.data.cart_item;
      } else {
        const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
        const existingItem = guestCart.find((item: CartItem) => item.product_id === product_id);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          // Mock product data (fetch from API if needed)
          guestCart.push({ id: Date.now().toString(), product_id, quantity, product: { id: product_id, name: 'Product', price: 0, image: '', stock: 0 } });
        }
        localStorage.setItem('guest_cart', JSON.stringify(guestCart));
        return guestCart[guestCart.length - 1];
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ id, quantity }: { id: string; quantity: number }, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: { isAuthenticated: boolean } };
    try {
      if (auth.isAuthenticated) {
        const response = await cartAPI.updateCartItem(id, { quantity });
        return response.data;
      } else {
        const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
        const item = guestCart.find((item: CartItem) => item.id === id);
        if (item) {
          item.quantity = quantity;
          localStorage.setItem('guest_cart', JSON.stringify(guestCart));
          return item;
        }
        throw new Error('Item not found');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart item');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (id: string, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: { isAuthenticated: boolean } };
    try {
      if (auth.isAuthenticated) {
        await cartAPI.removeFromCart(id);
        return id;
      } else {
        const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
        const updatedCart = guestCart.filter((item: CartItem) => item.id !== id);
        localStorage.setItem('guest_cart', JSON.stringify(updatedCart));
        return id;
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { getState }) => {
  const { auth } = getState() as { auth: { isAuthenticated: boolean } };
  if (auth.isAuthenticated) {
    await cartAPI.clearCart();
  } else {
    localStorage.setItem('guest_cart', '[]');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    calculateTotals: (state) => {
      state.total = state.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      state.itemCount = state.items.reduce((count, item) => count + item.quantity, 0);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.isLoading = false;
        state.items = action.payload;
        cartSlice.caseReducers.calculateTotals(state);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch cart';
      })
      // Add to cart
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<CartItem>) => {
        const existingItem = state.items.find(item => item.product_id === action.payload.product_id);
        if (existingItem) {
          existingItem.quantity += action.payload.quantity;
        } else {
          state.items.push(action.payload);
        }
        cartSlice.caseReducers.calculateTotals(state);
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Update cart item
      .addCase(updateCartItem.fulfilled, (state, action: PayloadAction<CartItem>) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        cartSlice.caseReducers.calculateTotals(state);
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Remove from cart
      .addCase(removeFromCart.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        cartSlice.caseReducers.calculateTotals(state);
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Clear cart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.total = 0;
        state.itemCount = 0;
      });
  },
});

export const { clearError, calculateTotals } = cartSlice.actions;
export default cartSlice.reducer;