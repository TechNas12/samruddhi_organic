import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-forest/10" data-testid="main-navbar">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 md:space-x-3" data-testid="logo-link">
            <img 
              src="https://customer-assets.emergentagent.com/job_3b372f6e-faee-4ae6-847e-dee6ad5a47b3/artifacts/w3mczdzd_samruddhi.png" 
              alt="Samruddhi Organics Logo" 
              className="h-10 w-10 md:h-14 md:w-14"
            />
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-forest font-syne">Samruddhi Organics</h1>
              <p className="text-xs text-lime hidden sm:block">Pure & Natural</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-earth hover:text-forest transition-colors" data-testid="nav-home">Home</Link>
            <Link to="/products" className="text-earth hover:text-forest transition-colors" data-testid="nav-products">Products</Link>
            <Link to="/about" className="text-earth hover:text-forest transition-colors" data-testid="nav-about">About</Link>
            <Link to="/contact" className="text-earth hover:text-forest transition-colors" data-testid="nav-contact">Contact</Link>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link 
              to="/cart" 
              className="relative p-2 hover:bg-forest/10 rounded-full transition-colors"
              data-testid="cart-icon-link"
            >
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-forest" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-lime text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" data-testid="cart-count">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-3">
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-2 px-4 py-2 bg-forest/10 rounded-full hover:bg-forest/20 transition-colors"
                  data-testid="dashboard-link"
                >
                  <User className="w-5 h-5 text-forest" />
                  <span className="text-sm font-medium text-forest">{user?.name}</span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="p-2 hover:bg-red-50 rounded-full transition-colors"
                  data-testid="logout-button"
                >
                  <LogOut className="w-5 h-5 text-red-600" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/login" className="text-sm font-medium text-forest hover:text-lime transition-colors" data-testid="login-link">Login</Link>
                <Link to="/signup" className="btn-primary text-sm" data-testid="signup-link">Sign Up</Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-forest/10 rounded-full transition-colors"
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-forest" /> : <Menu className="w-6 h-6 text-forest" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-forest/10" data-testid="mobile-menu">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-earth hover:text-forest transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className="text-earth hover:text-forest transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                to="/about" 
                className="text-earth hover:text-forest transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-earth hover:text-forest transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center space-x-2 py-2 text-forest font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>{user?.name}</span>
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center space-x-2 py-2 text-red-600 font-medium text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-3 pt-2">
                  <Link 
                    to="/login" 
                    className="text-forest font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="btn-primary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;