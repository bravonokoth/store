import React from 'react';
import ContactForm from '../components/Contact/ContactForm';
import MapEmbed from '../components/Contact/MapEmbed';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const ContactPage: React.FC = () => {
  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Address',
      details: [
        'Silverstore Wine Shop',
        'Rongai, Nairobi',
        'Kenya'
      ]
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Phone',
      details: [
        '+254 700 123 456',
        '+254 711 654 321'
      ]
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email',
      details: [
        'info@silverstore.com',
        'support@silverstore.com'
      ]
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Business Hours',
      details: [
        'Monday - Friday: 9:00 AM - 8:00 PM',
        'Saturday: 10:00 AM - 6:00 PM',
        'Sunday: 12:00 PM - 5:00 PM'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900/20 to-red-900/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Get in <span className="bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <ContactForm />
          </div>

          {/* Contact Information & Map */}
          <div className="space-y-8">
            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-purple-600/20 to-red-600/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform duration-300">
                      {info.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white">{info.title}</h3>
                  </div>
                  <div className="space-y-1">
                    {info.details.map((detail, detailIndex) => (
                      <p key={detailIndex} className="text-gray-400 text-sm">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-2">Visit Our Store</h3>
                <p className="text-gray-400">
                  Located in the heart of Rongai, Nairobi. Come visit our physical store to explore our wine collection in person.
                </p>
              </div>
              <MapEmbed />
            </div>

            {/* Additional Info */}
            <div className="bg-gradient-to-br from-purple-900/20 to-red-900/20 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Why Choose Silverstore?</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">Expert wine curation and recommendations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-gray-300">Premium wines from around the world</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">Temperature-controlled storage and delivery</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-gray-300">Exceptional customer service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;