import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch } from '../../store/store';
import { addToCart } from '../../store/cartSlice';
import { productAPI } from '../../services/api';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  ArrowLeft, 
  Plus, 
  Minus,
  Truck,
  Shield,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
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
  grape_variety?: string;
  serving_temperature?: string;
  food_pairing?: string[];
  wine_maker?: string;
  is_featured?: boolean;
}

interface ProductDetailsProps {
  productId: string;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ productId }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Mock product data
  const mockProduct: Product = {
    id: productId,
    name: 'Château Margaux 2015',
    price: 299.99,
    image: 'https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=2',
    images: [
      'https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=2',
      'https://images.pexels.com/photos/774455/pexels-photo-774455.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=2',
      'https://images.pexels.com/photos/1123260/pexels-photo-1123260.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=2',
    ],
    category: 'Red Wine',
    description: 'A legendary wine from one of Bordeaux\'s most prestigious estates. This exceptional vintage showcases the elegance and power that has made Château Margaux world-renowned. Complex aromas of blackcurrant, violets, and cedar lead to a palate of extraordinary depth and finesse.',
    stock: 12,
    rating: 4.9,
    reviews_count: 47,
    vintage: '2015',
    alcohol_content: '13.5%',
    region: 'Margaux, Bordeaux, France',
    grape_variety: 'Cabernet Sauvignon, Merlot, Petit Verdot, Cabernet Franc',
    serving_temperature: '16-18°C',
    food_pairing: ['Grilled red meat', 'Game', 'Aged cheeses', 'Dark chocolate desserts'],
    wine_maker: 'Paul Pontallier',
    is_featured: true,
  };

  const mockRelatedProducts: Product[] = [
    {
      id: '2',
      name: 'Dom Pérignon 2012',
      price: 189.99,
      image: 'https://images.pexels.com/photos/1174557/pexels-photo-1174557.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
      category: 'Champagne',
      description: 'Premium champagne',
      stock: 8,
      rating: 4.8,
      reviews_count: 32,
    },
    {
      id: '3',
      name: 'Caymus Cabernet Sauvignon',
      price: 89.99,
      image: 'https://images.pexels.com/photos/774455/pexels-photo-774455.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
      category: 'Red Wine',
      description: 'Rich Cabernet Sauvignon',
      stock: 25,
      rating: 4.6,
      reviews_count: 128,
    },
  ];

  useEffect(() => {
    fetchProductDetails();
    fetchRelatedProducts();
  }, [productId]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      setProduct(mockProduct);
      setError(null);
    } catch (err) {
      setError('Failed to fetch product details');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      setRelatedProducts(mockRelatedProducts);
    } catch (err) {
      console.error('Error fetching related products:', err);
    }
  };

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;

    dispatch(addToCart({ product_id: product.id, quantity }))
      .unwrap()
      .then(() => {
        toast.success('Added to cart successfully!');
      })
      .catch((error) => {
        toast.error(error || 'Failed to add to cart');
      });
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${i < Math.floor(rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-gray-600 ml-2">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-3"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg font-medium mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const images = product.images || [product.image];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative h-96 bg-gray-50 rounded-2xl overflow-hidden group shadow-md">
              <img
                src={images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition-all duration-300"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition-all duration-300"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Featured Badge */}
              {product.is_featured && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-red-500 text-white px-3 py-1 text-sm font-semibold rounded-full">
                  Featured
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedImageIndex === index 
                        ? 'border-purple-500' 
                        : 'border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-purple-600 bg-purple-100 px-3 py-1 rounded-full text-sm font-medium">
                  {product.category}
                </span>
                {product.vintage && (
                  <span className="text-gray-600 text-sm">{product.vintage}</span>
                )}
              </div>
              
              <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>
              
              <div className="flex items-center space-x-4 mb-4">
                {renderStars(product.rating)}
                <span className="text-gray-600">({product.reviews_count} reviews)</span>
              </div>
              
              <p className="text-2xl font-bold text-gray-800 mb-6">${product.price}</p>
            </div>

            {/* Product Details */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.region && (
                  <div>
                    <span className="text-gray-600">Region:</span>
                    <span className="text-gray-800 ml-2">{product.region}</span>
                  </div>
                )}
                {product.alcohol_content && (
                  <div>
                    <span className="text-gray-600">Alcohol:</span>
                    <span className="text-gray-800 ml-2">{product.alcohol_content}</span>
                  </div>
                )}
                {product.grape_variety && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Grape Variety:</span>
                    <span className="text-gray-800 ml-2">{product.grape_variety}</span>
                  </div>
                )}
                {product.serving_temperature && (
                  <div>
                    <span className="text-gray-600">Serving Temp:</span>
                    <span className="text-gray-800 ml-2">{product.serving_temperature}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-6 border-t border-gray-200 pt-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-gray-100 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 text-gray-800 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-gray-600 text-sm">
                    {product.stock} available
                  </span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </span>
                </button>

                <button
                  onClick={toggleWishlist}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                    isWishlisted
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-3 rounded-xl border-2 border-gray-300 text-gray-600 hover:border-purple-500 hover:text-purple-500 transition-all duration-300"
                >
                  <Share2 className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center space-x-6 border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-2 text-green-600">
                <Shield className="h-5 w-5" />
                <span className="text-sm">Authenticity Guaranteed</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-600">
                <Truck className="h-5 w-5" />
                <span className="text-sm">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2 text-yellow-600">
                <Award className="h-5 w-5" />
                <span className="text-sm">Award Winning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {['description', 'details', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-purple-600'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 text-lg leading-relaxed">
                  {product.description}
                </p>
                {product.food_pairing && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Food Pairing</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.food_pairing.map((pairing, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm"
                        >
                          {pairing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Wine Details</h3>
                  <dl className="space-y-3">
                    {[
                      ['Region', product.region],
                      ['Vintage', product.vintage],
                      ['Alcohol Content', product.alcohol_content],
                      ['Grape Variety', product.grape_variety],
                      ['Serving Temperature', product.serving_temperature],
                      ['Wine Maker', product.wine_maker],
                    ].filter(([, value]) => value).map(([label, value]) => (
                      <div key={label} className="flex justify-between">
                        <dt className="text-gray-600">{label}:</dt>
                        <dd className="text-gray-800 font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Customer Reviews</h3>
                <p className="text-gray-600">Reviews feature coming soon...</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/products/${relatedProduct.id}`}
                  className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden hover:border-purple-500 transition-all duration-300 group shadow-md"
                >
                  <div className="h-40 overflow-hidden">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors mb-2">
                      {relatedProduct.name}
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">{relatedProduct.description}</p>
                    <p className="text-xl font-bold text-gray-800">${relatedProduct.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;