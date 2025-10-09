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
  session_id?: string; // For guest cart
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [], // Initialize empty; fetchCart will populate for both guest and authenticated users
  total: 0,
  itemCount: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async ({ sessionId }: { sessionId?: string }, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: { isAuthenticated: boolean } };
    try {
      if (auth.isAuthenticated) {
        const response = await cartAPI.getCart();
        return response.data.cart_items || [];
      } else {
        const response = await cartAPI.getCart(sessionId);
        return response.data.cart_items || [];
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (
    { product_id, quantity, sessionId }: { product_id: string; quantity: number; sessionId?: string },
    { getState, rejectWithValue }
  ) => {
    const { auth } = getState() as { auth: { isAuthenticated: boolean } };
    try {
      if (auth.isAuthenticated) {
        const response = await cartAPI.addToCart({ product_id, quantity });
        return response.data.cart_item;
      } else {
        const response = await cartAPI.addToCart({ product_id, quantity }, sessionId);
        return response.data.cart_item;
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async (
    { id, quantity, sessionId }: { id: string; quantity: number; sessionId?: string },
    { getState, rejectWithValue }
  ) => {
    const { auth } = getState() as { auth: { isAuthenticated: boolean } };
    try {
      if (auth.isAuthenticated) {
        const response = await cartAPI.updateCartItem(id, { quantity });
        return response.data;
      } else {
        const response = await cartAPI.updateCartItem(id, { quantity }, sessionId);
        return response.data;
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart item');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ id, sessionId }: { id: string; sessionId?: string }, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: { isAuthenticated: boolean } };
    try {
      if (auth.isAuthenticated) {
        await cartAPI.removeFromCart(id);
        return id;
      } else {
        await cartAPI.removeFromCart(id, sessionId);
        return id;
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async ({ sessionId }: { sessionId?: string }, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: { isAuthenticated: boolean } };
    try {
      if (auth.isAuthenticated) {
        await cartAPI.clearCart();
      } else {
        await cartAPI.clearCart(sessionId);
      }
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    calculateTotals: (state) => {
      state.total = state.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      state.itemCount = state.items.reduce((count, item) => count + item.quantity, 0);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.isLoading = false;
        state.items = action.payload;
        cartSlice.caseReducers.calculateTotals(state);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add to cart
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<CartItem>) => {
        const existingItem = state.items.find((item) => item.product_id === action.payload.product_id);
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
        const index = state.items.findIndex((item) => item.id === action.payload.id);
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
        state.items = state.items.filter((item) => item.id !== action.payload);
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
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, calculateTotals } = cartSlice.actions;
export default cartSlice.reducer;