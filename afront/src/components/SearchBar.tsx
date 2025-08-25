import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/store';
import { setQuery, searchProducts, getSuggestions, showSuggestions, hideSuggestions, clearSearch } from '../store/searchSlice';
import { Search, Clock, X } from 'lucide-react';

const SearchBar: React.FC = () => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { query, suggestions, showSuggestions: showSuggestionsList, recentSearches, isLoading } = useSelector(
    (state: RootState) => state.search
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        dispatch(hideSuggestions());
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dispatch]);

  // Get suggestions when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2 && isFocused) {
        dispatch(getSuggestions(query));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, dispatch, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    dispatch(setQuery(value));
    
    if (value.length >= 2) {
      dispatch(showSuggestions());
    } else {
      dispatch(hideSuggestions());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      dispatch(searchProducts(query));
      dispatch(hideSuggestions());
      navigate('/products?search=' + encodeURIComponent(query));
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    dispatch(setQuery(suggestion.name));
    dispatch(searchProducts(suggestion.name));
    dispatch(hideSuggestions());
    navigate('/products/' + suggestion.id);
  };

  const handleRecentSearchClick = (searchQuery: string) => {
    dispatch(setQuery(searchQuery));
    dispatch(searchProducts(searchQuery));
    dispatch(hideSuggestions());
    navigate('/products?search=' + encodeURIComponent(searchQuery));
  };

  const clearInput = () => {
    dispatch(clearSearch());
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (query.length >= 2 || recentSearches.length > 0) {
      dispatch(showSuggestions());
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder="Search wines, categories..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
          />
          {query && (
            <button
              type="button"
              onClick={clearInput}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
          </div>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestionsList && (isFocused || query.length >= 2) && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          {/* Product Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                Products
              </h3>
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSuggestionClick(product)}
                  className="w-full flex items-center space-x-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Search className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium truncate">{product.name}</p>
                    <p className="text-gray-600 text-sm">{product.category}</p>
                    <p className="text-purple-600 font-semibold">${product.price}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && query.length < 2 && (
            <div className="p-2 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                Recent Searches
              </h3>
              {recentSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700 truncate">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query.length >= 2 && suggestions.length === 0 && !isLoading && (
            <div className="p-6 text-center">
              <Search className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-600">No products found for "{query}"</p>
              <p className="text-sm text-gray-500 mt-1">Try different keywords</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;