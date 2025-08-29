import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { addToCart } from '../../store/cartSlice';
import { productAPI } from '../../services/api';
import { ShoppingCart, Star, Heart, Eye, Package, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
  stock: number;
  rating: number;
  reviews_count: number;
  vintage?: string;
  alcohol_content?: string;
  region?: string;
  is_featured?: boolean;
}

interface ProductGridProps {
  filters: {
    category: string;
    minPrice: string;
    maxPrice: string;
    sortBy: string;
    inStock: boolean;
    search: string;
    isFeatured?: boolean; // Added to fix TypeScript error
  };
  viewMode: 'grid' | 'list';
  limit?: number; // For limiting products on homepage
}

const ProductGrid: React.FC<ProductGridProps> = ({ filters, viewMode, limit }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  
  const dispatch = useDispatch<AppDispatch>();

  // Mock products data (replace with API call)
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Château Margaux 2015',
      price: 299.99,
      image: 'https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
      category: 'red wine',
      description: 'A legendary wine from one of Bordeaux\'s most prestigious estates.',
      stock: 12,
      rating: 4.9,
      reviews_count: 47,
      vintage: '2015',
      alcohol_content: '13.5%',
      region: 'Bordeaux, France',
      is_featured: true,
    },
    {
      id: '2',
      name: 'Dom Pérignon 2012',
      price: 189.99,
      image: 'https://images.pexels.com/photos/1174557/pexels-photo-1174557.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
      category: 'champagne',
      description: 'The pinnacle of champagne excellence from the prestigious Dom Pérignon house.',
      stock: 8,
      rating: 4.8,
      reviews_count: 32,
      vintage: '2012',
      alcohol_content: '12.5%',
      region: 'Champagne, France',
      is_featured: true,
    },
    {
      id: '3',
      name: 'Caymus Cabernet Sauvignon',
      price: 89.99,
      image: 'https://images.pexels.com/photos/774455/pexels-photo-774455.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
      category: 'red wine',
      description: 'Rich and bold Cabernet Sauvignon from Napa Valley.',
      stock: 25,
      rating: 4.6,
      reviews_count: 128,
      vintage: '2020',
      alcohol_content: '14.8%',
      region: 'Napa Valley, California',
      is_featured: true, 
    },
    {
      id: '4',
      name: 'Cloudy Bay Sauvignon Blanc',
      price: 24.99,
      image: 'https://images.pexels.com/photos/2912108/pexels-photo-2912108.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
      category: 'white wine',
      description: 'Crisp and refreshing Sauvignon Blanc from New Zealand.',
      stock: 45,
      rating: 4.4,
      reviews_count: 89,
      vintage: '2022',
      alcohol_content: '13%',
      region: 'Marlborough, New Zealand',
      is_featured: true,
    },
    {
      id: '5',
      name: 'Whispering Angel Rosé',
      price: 19.99,
      image: 'https://images.pexels.com/photos/1123260/pexels-photo-1123260.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2',
      category: 'rosé wine',
      description: 'Elegant and fresh rosé from Provence.',
      stock: 32,
      rating: 4.3,
      reviews_count: 67,
      vintage: '2022',
      alcohol_content: '12.5%',
      region: 'Provence, France',
      is_featured: true,
    },
    
  ];

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API call
      // const response = await productAPI.getProducts(filters);
      // setProducts(response.data.data || []);
      
      let filteredProducts = mockProducts;

      if (filters.category) {
        filteredProducts = filteredProducts.filter(product => 
          product.category.toLowerCase().includes(filters.category.toLowerCase())
        );
      }

      if (filters.search) {
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          product.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      if (filters.minPrice) {
        filteredProducts = filteredProducts.filter(product => 
          product.price >= parseFloat(filters.minPrice)
        );
      }

      if (filters.maxPrice) {
        filteredProducts = filteredProducts.filter(product => 
          product.price <= parseFloat(filters.maxPrice)
        );
      }

      if (filters.inStock) {
        filteredProducts = filteredProducts.filter(product => product.stock > 0);
      }

      if (filters.isFeatured) { // Handle isFeatured filter
        filteredProducts = filteredProducts.filter(product => product.is_featured);
      }

      switch (filters.sortBy) {
        case 'price':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'name_desc':
          filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'rating':
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          filteredProducts.sort((a, b) => parseInt(b.id) - parseInt(a.id));
          break;
        default:
          filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      }

      setProducts(filteredProducts);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) {
      toast.error('This product is out of stock');
      return;
    }

    dispatch(addToCart({ product_id: product.id, quantity: 1 }))
      .unwrap()
      .then(() => {
        toast.success('Added to cart successfully!');
      })
      .catch((error) => {
        toast.error(error || 'Failed to add to cart');
      });
  };

  const toggleWishlist = (productId: string) => {
    const newWishlist = new Set(wishlist);
    if (wishlist.has(productId)) {
      newWishlist.delete(productId);
      toast.success('Removed from wishlist');
    } else {
      newWishlist.add(productId);
      toast.success('Added to wishlist');
    }
    setWishlist(newWishlist);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
          />
        ))}
        <span className="text-sm text-gray-400 ml-1">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-lg font-medium mb-2">Error loading products</p>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No products found</p>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  // Apply limit if provided, otherwise use all products
  const displayedProducts = limit ? products.slice(0, limit) : products;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400">
          Showing {displayedProducts.length} product{displayedProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className={viewMode === 'grid' 
  ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4' // Changed to lg:grid-cols-4, reduced gap
  : 'space-y-3' // Reduced spacing for list view
}>
  {displayedProducts.map((product) => (
    <div
      key={product.id}
      className={`group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-purple-500/50 transition-all duration-300 shadow-md hover:shadow-lg ${
        viewMode === 'list' ? 'flex' : ''
      }`} // Smaller shadow and rounded corners
    >
      {/* Product Image */}
      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-24 flex-shrink-0' : 'aspect-[1/0.5]'}`}> {/* Changed aspect-square to aspect-[1/0.5] */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" // Reduced scale effect
        />
        
        {/* Featured Badge */}
        {product.is_featured && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-red-500 text-white px-1 py-0.5 text-[10px] font-semibold rounded-full">
            Featured
          </div>
        )}

        {/* Stock Badge */}
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-1 py-0.5 text-[10px] font-semibold rounded-full">
            Out of Stock
          </div>
        )}
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-1 py-0.5 text-[10px] font-semibold rounded-full">
            Low Stock
          </div>
        )}

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
          <Link
            to={`/products/${product.id}`}
            className="p-1 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`p-1 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
              wishlist.has(product.id) 
                ? 'bg-red-500 text-white' 
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${wishlist.has(product.id) ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => handleAddToCart(product)}
            disabled={product.stock === 0}
            className={`p-1 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
              product.stock === 0
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className={`p-3 ${viewMode === 'list' ? 'flex-1' : ''}`}> {/* Reduced padding */}
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2 text-sm"> {/* Reduced to text-sm */}
            <Link to={`/products/${product.id}`}>
              {product.name}
            </Link>
          </h3>
        </div>

        <p className="text-gray-600 text-xs mb-2 line-clamp-2">
          {product.description}
        </p>

        <div className="space-y-1 mb-2">
          {product.region && (
            <p className="text-[10px] text-gray-500">{product.region}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-purple-600 bg-purple-100 px-1 py-0.5 rounded-full">
              {product.category}
            </span>
            {product.vintage && (
              <span className="text-[10px] text-gray-500">{product.vintage}</span>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="mb-2">
          {renderStars(product.rating)}
          <p className="text-[10px] text-gray-500 mt-0.5">{product.reviews_count} reviews</p>
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-gray-900">${product.price}</span> {/* Reduced to text-base */}
          </div>
          <button
            onClick={() => handleAddToCart(product)}
            disabled={product.stock === 0}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg font-medium transition-all duration-300 text-xs ${
              product.stock === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white hover:shadow-lg hover:shadow-purple-500/25'
            }`}
          >
            <ShoppingCart className="h-3 w-3" />
            <span className="hidden sm:inline">
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </span>
          </button>
        </div>

        {/* Stock Info */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Stock:</span>
            <span className={product.stock < 10 ? 'text-orange-400' : 'text-green-400'}>
              {product.stock} available
            </span>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
    </div>
  );
};

export default ProductGrid;