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
  price: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCart = createAsyncThunk('cart/fetchCart', async () => {
  const response = await cartAPI.getCart();
  return response.data;
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ product_id, quantity }: { product_id: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.addToCart({ product_id, quantity });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ id, quantity }: { id: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.updateCartItem(id, { quantity });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart item');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (id: string, { rejectWithValue }) => {
    try {
      await cartAPI.removeFromCart(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

export const clearCart = createAsyncThunk('cart/clearCart', async () => {
  await cartAPI.clearCart();
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    calculateTotals: (state) => {
      state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      state.itemCount = state.items.reduce((count, item) => count + item.quantity, 0);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
        state.itemCount = action.payload.item_count || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch cart';
      })
      
      // Add to cart
      .addCase(addToCart.fulfilled, (state, action) => {
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
      .addCase(updateCartItem.fulfilled, (state, action) => {
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
      .addCase(removeFromCart.fulfilled, (state, action) => {
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