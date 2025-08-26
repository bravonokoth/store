import React from 'react';
import HeroSlider from '../components/HeroSlider';
import Footer from '../components/Footer';
import ProductGrid from '../components/Product/ProductGrid'; // Import ProductGrid
import { Link } from 'react-router-dom';
import { Star, Shield, Truck, Award, ArrowRight, Sparkles, Wine } from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Authenticity Guaranteed",
      description: "Every bottle is verified for authenticity and quality by our expert sommeliers."
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Premium Delivery",
      description: "Temperature-controlled shipping ensures your wines arrive in perfect condition."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Award-Winning Selection",
      description: "Curated collection of award-winning wines from prestigious vineyards worldwide."
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Expert Recommendations",
      description: "Personal recommendations from certified wine experts and master sommeliers."
    }
  ];

  const categories = [
    {
      name: "Red Wines",
      image: "https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2",
      count: "150+ varieties",
      gradient: "from-red-600 to-red-800"
    },
    {
      name: "White Wines",
      image: "https://images.pexels.com/photos/2912108/pexels-photo-2912108.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2",
      count: "120+ varieties",
      gradient: "from-yellow-400 to-yellow-600"
    },
    {
      name: "Sparkling Wines",
      image: "https://images.pexels.com/photos/1174557/pexels-photo-1174557.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2",
      count: "80+ varieties",
      gradient: "from-purple-500 to-purple-700"
    },
    {
      name: "Rosé Wines",
      image: "https://images.pexels.com/photos/2912108/pexels-photo-2912108.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=2",
      count: "60+ varieties",
      gradient: "from-pink-500 to-pink-700"
    }
  ];

  // Default filters for ProductGrid (e.g., show featured products)
  const defaultFilters = {
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest', // Sort by newest for homepage
    inStock: true, // Only show products in stock
    search: '',
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSlider />

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose <span className="bg-gradient-to-r from-purple-600 to-red-600 bg-clip-text text-transparent">Silverstore</span>
            </h2>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto">
              Experience the finest in wine retail with our commitment to quality, authenticity, and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative group"
              >
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

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <span className="text-purple-600 font-medium text-lg">Explore Categories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Discover Our <span className="bg-gradient-to-r from-purple-600 to-red-600 bg-clip-text text-transparent">Collection</span>
            </h2>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto">
              From bold reds to crisp whites, find the perfect wine for every occasion and palate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/products?category=${category.name.toLowerCase().replace(' ', '-')}`}
                className="group relative overflow-hidden rounded-2xl aspect-square"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
                
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:transform group-hover:translate-y-[-4px] transition-transform duration-300">
                    {category.name}
                  </h3>
                  <p className="text-gray-300 mb-4">{category.count}</p>
                  <div className="flex items-center text-purple-300 group-hover:text-white transition-colors duration-300">
                    <span className="font-medium">Explore Collection</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>

                {/* Floating wine glass icon */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <Wine className="h-8 w-8 text-white" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

  {/* Featured Products Section */}
<section className="py-20 bg-gray-100 shadow-lg">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <Sparkles className="h-6 w-6 text-purple-600" />
        <span className="text-purple-600 font-medium text-lg">Featured Wines</span>
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        Our <span className="bg-gradient-to-r from-purple-600 to-red-600 bg-clip-text text-transparent">Top Picks</span>
      </h2>
      <p className="text-gray-600 text-xl max-w-3xl mx-auto">
        Discover our hand-selected featured wines, perfect for any occasion.
      </p>
    </div>

    {/* Render ProductGrid with limit and isFeatured filter */}
    <ProductGrid
      filters={{ ...defaultFilters, isFeatured: true }}
      viewMode="grid"
      limit={3}
    />

    {/* View More Button */}
    <div className="mt-12 flex justify-center">
      <Link
        to="/products"
        className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-red-600 text-white font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group"
      >
        <Wine className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
        <span>View More Wines</span>
        <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
      </Link>
    </div>
  </div>
</section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-red-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Explore?
          </h2>
          <p className="text-xl text-gray-100 mb-10 max-w-3xl mx-auto">
            Join thousands of wine enthusiasts who trust Silverstore for their finest selections. 
            Start your wine journey today.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center space-x-3 bg-white text-gray-900 font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group"
          >
            <Wine className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
            <span>Browse All Wines</span>
            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {/* Background decoration */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-xl"></div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;