import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Landing from './pages/Landing';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import UserDashboard from './pages/UserDashboard';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminReviews from './pages/admin/AdminReviews';

function App() {
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    // Fetch dynamic colors from config.json
    fetch('/config.json')
      .then(response => response.json())
      .then(config => {
        if (config.theme) {
          const root = document.documentElement;
          // Helper to convert hex to space separated RGB
          const hexToRgb = (hex) => {
            const h = hex.replace('#', '');
            if (h.length === 3) {
              return `${parseInt(h[0] + h[0], 16)} ${parseInt(h[1] + h[1], 16)} ${parseInt(h[2] + h[2], 16)}`;
            }
            return `${parseInt(h.slice(0, 2), 16)} ${parseInt(h.slice(2, 4), 16)} ${parseInt(h.slice(4, 6), 16)}`;
          };

          // Dynamically map and set CSS variables based on config.json
          Object.keys(config.theme).forEach(key => {
            root.style.setProperty(`--color-${key}`, hexToRgb(config.theme[key]));
          });
        }
      })
      .catch(error => console.error("Error loading theme config:", error))
      .finally(() => {
        // Render app regardless to use fallback CSS vars if fetch fails
        setConfigLoaded(true);
      });
  }, []);

  if (!configLoaded) {
    return <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">Loading Configuration...</div>;
  }

  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/profile" element={<UserDashboard />} />
                  <Route path="/my-orders" element={<UserDashboard />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/categories" element={<AdminCategories />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/reviews" element={<AdminReviews />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </CartProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
