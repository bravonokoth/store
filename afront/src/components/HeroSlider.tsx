import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingBag, Sparkles } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: string;
  link: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Premium Wine Collection",
    subtitle: "Discover Excellence",
    description: "Explore our curated selection of the finest wines from around the world. Each bottle tells a story of tradition, passion, and exceptional craftsmanship.",
    image: "https://images.pexels.com/photos/3407019/pexels-photo-3407019.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    cta: "Shop Collection",
    link: "/products"
  },
  {
    id: 2,
    title: "Vintage Treasures",
    subtitle: "Rare & Exclusive",
    description: "Uncover rare vintage wines that have been carefully aged to perfection. These exceptional bottles are perfect for special occasions and collectors.",
    image: "https://images.pexels.com/photos/774455/pexels-photo-774455.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    cta: "Explore Vintages",
    link: "/products?category=vintage"
  },
  {
    id: 3,
    title: "New Arrivals",
    subtitle: "Fresh Selections",
    description: "Be the first to taste our latest wine arrivals. From emerging vineyards to established estates, discover your next favorite bottle.",
    image: "https://images.pexels.com/photos/1123260/pexels-photo-1123260.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    cta: "View New Arrivals",
    link: "/products?sort=newest"
  }
];

const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <div className="relative h-[45vh] overflow-hidden">
      {/* Slides Container */}
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="min-w-full relative">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            
            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                  {/* Subtitle with icon */}
                  <div className="flex items-center space-x-2 mb-4">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    <span className="text-purple-400 font-medium text-lg">
                      {slide.subtitle}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                    <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                      {slide.title}
                    </span>
                  </h1>
                  
                  {/* Description */}
                  <p className="text-gray-300 text-xl mb-8 leading-relaxed">
                    {slide.description}
                  </p>
                  
                  {/* CTA Button */}
                  <Link
                    to={slide.link}
                    className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600 via-red-600 to-pink-600 hover:from-purple-700 hover:via-red-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 group"
                  >
                    <ShoppingBag className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="text-lg">{slide.cta}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 text-white rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 text-white rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? 'bg-gradient-to-r from-purple-500 to-red-500 w-8'
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Floating Elements for Visual Appeal */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-red-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-32 left-20 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
    </div>
  );
};

export default HeroSlider;