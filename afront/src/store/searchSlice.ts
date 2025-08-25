import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productAPI } from '../services/api';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

interface SearchState {
  query: string;
  results: Product[];
  suggestions: Product[];
  isLoading: boolean;
  showSuggestions: boolean;
  recentSearches: string[];
  error: string | null;
}

const initialState: SearchState = {
  query: '',
  results: [],
  suggestions: [],
  isLoading: false,
  showSuggestions: false,
  recentSearches: JSON.parse(localStorage.getItem('recent_searches') || '[]'),
  error: null,
};

// Async thunks
export const searchProducts = createAsyncThunk(
  'search/searchProducts',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await productAPI.searchProducts(query);
      return { query, results: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const getSuggestions = createAsyncThunk(
  'search/getSuggestions',
  async (query: string, { rejectWithValue }) => {
    try {
      if (query.length < 2) return [];
      const response = await productAPI.searchProducts(query);
      return response.data.slice(0, 5); // Limit to 5 suggestions
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get suggestions');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    clearSearch: (state) => {
      state.query = '';
      state.results = [];
      state.suggestions = [];
      state.showSuggestions = false;
      state.error = null;
    },
    showSuggestions: (state) => {
      state.showSuggestions = true;
    },
    hideSuggestions: (state) => {
      state.showSuggestions = false;
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim();
      if (query && !state.recentSearches.includes(query)) {
        state.recentSearches.unshift(query);
        state.recentSearches = state.recentSearches.slice(0, 10); // Keep only 10 recent searches
        localStorage.setItem('recent_searches', JSON.stringify(state.recentSearches));
      }
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
      localStorage.removeItem('recent_searches');
    },
  },
  extraReducers: (builder) => {
    builder
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.query = action.payload.query;
        state.results = action.payload.results;
        state.showSuggestions = false;
        
        // Add to recent searches
        const query = action.payload.query.trim();
        if (query && !state.recentSearches.includes(query)) {
          state.recentSearches.unshift(query);
          state.recentSearches = state.recentSearches.slice(0, 10);
          localStorage.setItem('recent_searches', JSON.stringify(state.recentSearches));
        }
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get suggestions
      .addCase(getSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      })
      .addCase(getSuggestions.rejected, (state) => {
        state.suggestions = [];
      });
  },
});

export const {
  setQuery,
  clearSearch,
  showSuggestions,
  hideSuggestions,
  addRecentSearch,
  clearRecentSearches,
} = searchSlice.actions;

export default searchSlice.reducer;