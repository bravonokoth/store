import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { addToCart } from '../../store/cartSlice';
import { productAPI } from '../../services/api';
import { ShoppingCart, Heart, Eye, Package, AlertCircle } from 'lucide-react';
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
    isFeatured?: boolean;
  };
  viewMode: 'grid' | 'list';
  limit?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({ filters, viewMode, limit }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Map filters to API query parameters
      const params = {
        category: filters.category || undefined,
        min_price: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        max_price: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        sort_by: filters.sortBy || undefined,
        in_stock: filters.inStock ? 1 : undefined,
        search: filters.search || undefined,
        is_featured: filters.isFeatured ? 1 : undefined,
      };

      // Fetch products from the API
      const response = await productAPI.getProducts(params);

      // Map API response to the Product interface
      const fetchedProducts: Product[] = response.data.data.map((product: any) => ({
        id: product.id.toString(),
        name: product.name,
        price: parseFloat(product.price),
        // Use the first media item as the main image, or a fallback
        image: product.media && product.media.length > 0 
          ? `${import.meta.env.VITE_API_BASE_URL}/storage/${product.media[0].path}`
          : 'https://via.placeholder.com/300',
        images: product.media?.map((media: any) => 
          `${import.meta.env.VITE_API_BASE_URL}/storage/${media.path}`) || [],
        category: product.category?.name || 'Uncategorized',
        description: product.description || '',
        stock: product.stock || 0,
        rating: product.rating || 0,
        reviews_count: product.reviews_count || 0,
        vintage: product.vintage || undefined,
        alcohol_content: product.alcohol_content || undefined,
        region: product.region || undefined,
        is_featured: product.is_featured || false,
      }));

      setProducts(fetchedProducts);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-3"></div>
          <p className="text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 text-base font-medium mb-2">Error loading products</p>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400 text-base">No products found</p>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  const displayedProducts = limit ? products.slice(0, limit) : products;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400 text-sm">
          Showing {displayedProducts.length} product{displayedProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'
        : 'space-y-2'
      }>
        {displayedProducts.map((product) => (
          <div
            key={product.id}
            className={`group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-purple-500/50 transition-all duration-300 shadow-md hover:shadow-lg ${
              viewMode === 'list' ? 'flex' : ''
            }`}
          >
            {/* Product Image */}
            <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-20 flex-shrink-0' : 'h-40'}`}>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
              />
              
              {/* Featured Badge */}
              {product.is_featured && (
                <div className="absolute top-1.5 left-1.5 bg-gradient-to-r from-purple-500 to-red-500 text-white px-1 py-0.5 text-[9px] font-semibold rounded-full">
                  Featured
                </div>
              )}

              {/* Stock Badges */}
              {product.stock === 0 && (
                <div className="absolute top-1.5 right-1.5 bg-red-500 text-white px-1 py-0.5 text-[9px] font-semibold rounded-full">
                  Out of Stock
                </div>
              )}
              {product.stock < 10 && product.stock > 0 && (
                <div className="absolute top-1.5 right-1.5 bg-orange-500 text-white px-1 py-0.5 text-[9px] font-semibold rounded-full">
                  Low Stock
                </div>
              )}

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-1.5">
                <Link
                  to={`/products/${product.id}`}
                  className="p-1 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-1 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
                    wishlist.has(product.id) 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${wishlist.has(product.id) ? 'fill-current' : ''}`} />
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
                  <ShoppingCart className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className={`p-1.5 ${viewMode === 'list' ? 'flex-1' : ''}`}>
              <div className="flex items-start justify-between mb-0.5">
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2 text-xs">
                  <Link to={`/products/${product.id}`}>
                    {product.name}
                  </Link>
                </h3>
              </div>

              <p className="text-gray-600 text-[10px] mb-0.5 line-clamp-2">
                {product.description}
              </p>

              <div className="space-y-0.5 mb-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-purple-600 bg-purple-100 px-1 py-0.5 rounded-full">
                    {product.category}
                  </span>
                  {product.vintage && (
                    <span className="text-[9px] text-gray-500">{product.vintage}</span>
                  )}
                </div>
              </div>

              {/* Price and Add to Cart + Checkout */}
              <div className="flex items-center justify-between mb-0.5">
                <div>
                  <span className="text-sm font-bold text-gray-900">${product.price}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`flex items-center space-x-0.5 px-1.5 py-1 rounded-lg font-medium transition-all duration-300 text-[10px] ${
                      product.stock === 0
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white hover:shadow-lg hover:shadow-purple-500/25'
                    }`}
                  >
                    <ShoppingCart className="h-2.5 w-2.5" />
                    <span className="hidden sm:inline">
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      if (product.stock === 0) {
                        toast.error('This product is out of stock');
                        return;
                      }
                      dispatch(addToCart({ product_id: product.id, quantity: 1 }))
                        .unwrap()
                        .then(() => {
                          toast.success('Added to cart! Proceeding to checkout...');
                          navigate('/checkout');
                        })
                        .catch((error) => {
                          toast.error(error || 'Failed to add to cart');
                        });
                    }}
                    disabled={product.stock === 0}
                    className={`flex items-center space-x-0.5 px-1.5 py-1 rounded-lg font-medium transition-all duration-300 text-[10px] ${
                      product.stock === 0
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-lg hover:shadow-green-500/25'
                    }`}
                  >
                    <Package className="h-2.5 w-2.5" />
                    <span className="hidden sm:inline">Checkout</span>
                  </button>
                </div>
              </div>

              {/* Stock Info */}
              <div className="mt-0.5">
                <div className="flex items-center justify-between text-[10px]">
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