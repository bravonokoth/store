import React from 'react';

const MapEmbed: React.FC = () => {
  // Coordinates for Rongai, Nairobi
  const mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8756045542324!2d36.78851731475373!3d-1.2420462990653344!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f109df4cb9d69%3A0x8c5f7b8b7b1b7b1b!2sRongai%2C%20Kenya!5e0!3m2!1sen!2ske!4v1647123456789!5m2!1sen!2ske";

  return (
    <div className="relative h-80 w-full">
      <iframe
        src={mapSrc}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Silverstore Location - Rongai, Nairobi"
        className="rounded-b-xl"
      ></iframe>
      
      {/* Overlay with store info */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg max-w-xs">
        <h4 className="font-semibold text-sm mb-1">Silverstore Wine Shop</h4>
        <p className="text-xs text-gray-300">Rongai, Nairobi, Kenya</p>
        <p className="text-xs text-gray-300 mt-1">Open: Mon-Sun, 9AM-8PM</p>
      </div>
    </div>
  );
};

export default MapEmbed;