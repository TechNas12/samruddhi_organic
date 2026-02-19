import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Truck, Shield, Star } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Landing = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchReviews();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products?featured=true`);
      setFeaturedProducts(res.data.slice(0, 4));
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/reviews`);
      setReviews(res.data.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  return (
    <div className="bg-cream" data-testid="landing-page">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden" data-testid="hero-section">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.pexels.com/photos/4863823/pexels-photo-4863823.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-earth/90 to-forest/80"></div>
        </div>
        
        <div className="relative container-custom h-full flex items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white px-4"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 font-syne" data-testid="hero-title">
              Pure Organic <span className="text-lime">Farming Supplies</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-cream/90">
              Nurture your farm with 100% natural and organic products. From seeds to soil, we've got you covered.
            </p>
            <Link to="/products" className="btn-primary inline-flex items-center space-x-2" data-testid="shop-now-button">
              <span>Shop Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16" data-testid="features-section">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: Leaf, title: '100% Organic', desc: 'All products are certified organic and chemical-free' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Quick and reliable delivery across India' },
              { icon: Shield, title: 'Quality Assured', desc: 'Tested and verified for purity and effectiveness' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="card text-center"
                data-testid={`feature-card-${idx}`}
              >
                <div className="inline-flex p-4 bg-lime/10 rounded-full mb-4">
                  <feature.icon className="w-8 h-8 text-forest" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-syne">{feature.title}</h3>
                <p className="text-earth/70">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-white" data-testid="featured-products-section">
        <div className="container-custom">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font-syne text-forest">Featured Products</h2>
            <p className="text-earth/70 text-base md:text-lg">Handpicked organic essentials for your farm</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="card group hover:scale-105"
                data-testid={`featured-product-${product.id}`}
              >
                <div className="relative h-48 bg-cream rounded-2xl overflow-hidden mb-4">
                  <img
                    src={product.image_url || 'https://via.placeholder.com/300x300?text=Product'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-lime text-white px-3 py-1 rounded-full text-xs font-bold">
                    Featured
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2 font-syne">{product.name}</h3>
                <p className="text-earth/70 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-forest">₹{product.price}</span>
                  <span className="text-sm text-earth/60">Stock: {product.stock}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/products" className="btn-primary" data-testid="view-all-products-button">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      {reviews.length > 0 && (
        <section className="py-16" data-testid="reviews-section">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-syne text-forest">What Our Customers Say</h2>
              <p className="text-earth/70 text-lg">Real experiences from real farmers</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="card"
                  data-testid={`review-${review.id}`}
                >
                  <div className="flex items-center mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-lime text-lime" />
                    ))}
                  </div>
                  <p className="text-earth/80 mb-4 italic">"{review.comment}"</p>
                  <p className="font-bold text-forest">{review.customer_name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-forest text-white" data-testid="cta-section">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-syne">Ready to Go Organic?</h2>
          <p className="text-xl mb-8 text-cream/90 max-w-2xl mx-auto">
            Join thousands of farmers who trust Samruddhi Organics for their farming needs
          </p>
          <Link to="/signup" className="btn-secondary" data-testid="get-started-button">
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;