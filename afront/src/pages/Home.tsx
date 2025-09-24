import React, { useState, useEffect } from 'react';
import HeroSlider from '../components/HeroSlider';
import Footer from '../components/Footer';
import ProductGrid from '../components/Product/ProductGrid';
import { Link } from 'react-router-dom';
import { Star, Shield, Truck, Award, ArrowRight, Sparkles, Wine } from 'lucide-react';
import { productAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  products_count: number;
  parent_id?: string;
}

const Home: React.FC = () => {
  // State for filters - FIXED: Set isFeatured to false to show all products
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
    inStock: true,
    search: '',
    isFeatured: false, // Changed from true to false
  });

  // State for categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Gradients for categories (fallback for UI consistency)
  const categoryGradients: { [key: string]: string } = {
    'Red Wines': 'from-red-600 to-red-800',
    'White Wines': 'from-yellow-400 to-yellow-600',
    'Sparkling Wines': 'from-purple-500 to-purple-700',
    'Rosé Wines': 'from-pink-500 to-pink-700',
  };

  // Placeholder image for categories without images
  const placeholderImage = 'https://images.pexels.com/photos/2912108/pexels-photo-2912108.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2';

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await productAPI.getCategories();
        setCategories(response.data.data);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        toast.error('Failed to load categories');
        // Fallback to empty array or mocked data if desired
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Authenticity Guaranteed",
      description: "Every bottle is verified for authenticity and quality.",
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Free Delivery",
      description: "Free delivery within Rongai, CBD for orders above Ksh 1000.",
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Award-Winning Selection",
      description: "Curated collection of award-winning liquor in Kenya.",
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Expert Recommendations",
      description: "Personal recommendations from certified liquor experts.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSlider />

      {/* Categories Section */}
      <section className="py-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-purple-600 font-medium text-sm">Explore Categories</span>
            </div>
          </div>

          {loadingCategories ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Loading categories...</p>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-gray-400 text-sm">No categories found</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.slug}`}
                  onClick={() => setFilters({ ...filters, category: category.name })}
                  className="group relative overflow-hidden rounded-lg h-48"
                >
                  <img
                    src={category.image ? `${import.meta.env.VITE_API_BASE_URL}/storage/${category.image}` : placeholderImage}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${
                      categoryGradients[category.name] || 'from-gray-600 to-gray-800'
                    } opacity-30 group-hover:opacity-50 transition-opacity duration-300`}
                  ></div>
                  
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:transform group-hover:translate-y-[-2px] transition-transform duration-300">
                      {category.name}
                    </h3>
                    <p className="text-gray-300 text-xs mb-1">
                      {category.products_count} {category.products_count === 1 ? 'variety' : 'varieties'}
                    </p>
                    <div className="flex items-center text-purple-300 group-hover:text-white transition-colors duration-300">
                      <span className="font-medium text-xs">Explore</span>
                      <ArrowRight className="h-2.5 w-2.5 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <Wine className="h-5 w-5 text-white" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-10 bg-gray-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <span className="text-purple-600 font-medium text-lg">Latest Products</span>
            </div>
          </div>

          {/* FIXED: Pass showFilters=false to hide duplicate filters on homepage */}
          <ProductGrid
            filters={filters}
            setFilters={setFilters}
            viewMode="grid"
            limit={4}
            showFilters={false}
          />

          <div className="mt-8 flex justify-center">
            <Link
              to="/products"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-red-600 text-white font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group"
            >
              <Wine className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
              <span>View More</span>
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-purple-600 to-red-600 bg-clip-text text-transparent">Silveranchor</span>
            </h3>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto">
              Experience the finest in Liquor retail with our commitment to quality, authenticity, and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-red-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white border border-gray-200 p-8 rounded-2xl hover:border-purple-500/50 transition-all duration-300 group-hover:transform group-hover:scale-105 shadow-lg">
                  <div className="text-purple-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-red-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Explore?
          </h3>
          <p className="text-xl text-gray-100 mb-10 max-w-3xl mx-auto">
            Join thousands of liquor enthusiasts who trust Silveranchor for their finest selections. 
            Start your liquor journey today.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center space-x-3 bg-white text-gray-900 font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group"
          >
            <Wine className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
            <span>Browse All Liquor</span>
            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-xl"></div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;