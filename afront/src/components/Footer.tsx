import React from 'react';
import { Link } from 'react-router-dom';
import { Wine, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'Home', href: '/Home' },
      { name: 'About Us', href: '/about' },
      { name: 'Products', href: '/product' },
      { name: 'Contact Us', href: '/contact' },
     
    ],
    shop: [
      { name: 'All Wines', href: '/products' },
      { name: 'Red Wines', href: '/products?category=red-wine' },
      { name: 'White Wines', href: '/products?category=white-wine' },
      { name: 'Champagne', href: '/products?category=champagne' },
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Shipping Info', href: '/shipping' },
      { name: 'Returns', href: '/returns' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Age Verification', href: '/age-verification' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/silverstore' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/silverstore' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/silverstore' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/silverstore' },
  ];

  return (
    <footer className="bg-gray-900 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-red-600 rounded-lg">
                  <Wine className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-red-600 bg-clip-text text-transparent">
                  Silversanchor
                </span>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Discover the world's finest wines at Silverstore. From vintage classics to modern favorites, 
                we curate exceptional wines for every palate and occasion.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Rongai, Nairobi, Kenya</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Phone className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">+254 700 123 456</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">info@silverstore.com</span>
                </div>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-600 hover:text-purple-600 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Shop Links */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Shop</h3>
              <ul className="space-y-3">
                {footerLinks.shop.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-600 hover:text-purple-600 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-600 hover:text-purple-600 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-600 hover:text-purple-600 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Stay Updated</h3>
              <p className="text-gray-600 text-sm">Get the latest wine recommendations and exclusive offers.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="text-gray-600 text-sm mb-4 md:mb-0">
              © {currentYear} Silverstore. All rights reserved. | Must be 21+ to purchase alcohol.
            </div>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;