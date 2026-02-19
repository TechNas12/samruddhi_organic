import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-earth text-cream mt-20" data-testid="main-footer">
      <div className="container-custom py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <img 
              src="https://customer-assets.emergentagent.com/job_3b372f6e-faee-4ae6-847e-dee6ad5a47b3/artifacts/w3mczdzd_samruddhi.png" 
              alt="Samruddhi Organics" 
              className="h-16 w-16 mb-4"
            />
            <h3 className="text-xl font-bold mb-2 font-syne">Samruddhi Organics</h3>
            <p className="text-sm text-cream/80">Your trusted source for organic farming supplies and natural products.</p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-lime font-syne">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-lime transition-colors" data-testid="footer-home">Home</Link></li>
              <li><Link to="/products" className="hover:text-lime transition-colors" data-testid="footer-products">Products</Link></li>
              <li><Link to="/about" className="hover:text-lime transition-colors" data-testid="footer-about">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-lime transition-colors" data-testid="footer-contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-lime font-syne">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/dashboard" className="hover:text-lime transition-colors">My Account</Link></li>
              <li><Link to="/cart" className="hover:text-lime transition-colors">Shopping Cart</Link></li>
              <li><a href="#" className="hover:text-lime transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-lime transition-colors">Shipping Info</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-lime font-syne">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>123 Organic Street, Green City, India</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+91 9876543210</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>info@samruddhiorganics.com</span>
              </li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-lime transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-lime transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-lime transition-colors"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-cream/20 mt-8 pt-8 text-center text-sm text-cream/60">
          <p>&copy; 2026 Samruddhi Organics. All rights reserved. | <Link to="/admin/login" className="hover:text-lime transition-colors">Admin</Link></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;