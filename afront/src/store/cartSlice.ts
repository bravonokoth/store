import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { cartAPI } from '../services/api';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
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

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async ({ sessionId }: { sessionId?: string }, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: { isAuthenticated: boolean } };
    try {
      const response = await cartAPI.getCart(sessionId);
      const cartItems = (response.data.cart_items || []).map((item: any) => ({
        ...item,
        product: {
          ...item.product,
          price: Number(item.product.price), // Parse price as number
        },
      }));
      return {
        items: cartItems,
        total: Number(response.data.total || 0), // Parse total as number
      };
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
      const response = await cartAPI.addToCart({ product_id, quantity }, sessionId);
      const cartItem = {
        ...response.data.cart_item,
        product: {
          ...response.data.cart_item.product,
          price: Number(response.data.cart_item.product.price), // Parse price
        },
      };
      return {
        cartItem,
        total: Number(response.data.total || 0), // Parse total
      };
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
      const response = await cartAPI.updateCartItem(id, { quantity }, sessionId);
      const cartItems = (response.data.cart_items || []).map((item: any) => ({
        ...item,
        product: {
          ...item.product,
          price: Number(item.product.price),
        },
      }));
      return {
        items: cartItems,
        total: Number(response.data.total || 0),
      };
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
      const response = await cartAPI.removeFromCart(id, sessionId);
      const cartItems = (response.data.cart_items || []).map((item: any) => ({
        ...item,
        product: {
          ...item.product,
          price: Number(item.product.price),
        },
      }));
      return {
        items: cartItems,
        total: Number(response.data.total || 0),
      };
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
      await cartAPI.clearCart(sessionId);
      return { items: [], total: 0 };
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
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<{ items: CartItem[]; total: number }>) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.itemCount = state.items.reduce((count, item) => count + item.quantity, 0);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<{ cartItem: CartItem; total: number }>) => {
        const existingItem = state.items.find((item) => item.product_id === action.payload.cartItem.product_id);
        if (existingItem) {
          existingItem.quantity += action.payload.cartItem.quantity;
        } else {
          state.items.push(action.payload.cartItem);
        }
        state.total = action.payload.total;
        state.itemCount = state.items.reduce((count, item) => count + item.quantity, 0);
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateCartItem.fulfilled, (state, action: PayloadAction<{ items: CartItem[]; total: number }>) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.itemCount = state.items.reduce((count, item) => count + item.quantity, 0);
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(removeFromCart.fulfilled, (state, action: PayloadAction<{ items: CartItem[]; total: number }>) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.itemCount = state.items.reduce((count, item) => count + item.quantity, 0);
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload as string;
      })
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