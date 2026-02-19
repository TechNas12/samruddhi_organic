import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categories`);
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/products`;
      if (selectedCategory) {
        url += `?category_id=${selectedCategory}`;
      }
      const res = await axios.get(url);
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen py-12" data-testid="products-page">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-syne text-forest" data-testid="products-title">Our Products</h1>
          <p className="text-earth/70 text-lg">Explore our wide range of organic farming supplies</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-earth/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-forest/20 focus:border-forest"
              data-testid="search-input"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12" data-testid="category-filter">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-2 rounded-full transition-all ${
              selectedCategory === null
                ? 'bg-forest text-white'
                : 'bg-white text-earth hover:bg-forest/10'
            }`}
            data-testid="category-all"
          >
            All Products
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full transition-all ${
                selectedCategory === category.id
                  ? 'bg-forest text-white'
                  : 'bg-white text-earth hover:bg-forest/10'
              }`}
              data-testid={`category-${category.id}`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-forest border-t-transparent"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20" data-testid="no-products">
            <p className="text-xl text-earth/60">No products found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card group"
                data-testid={`product-card-${product.id}`}
              >
                <Link to={`/products/${product.id}`}>
                  <div className="relative h-48 bg-cream rounded-2xl overflow-hidden mb-4">
                    <img
                      src={product.image_url || 'https://via.placeholder.com/300x300?text=Product'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.is_featured && (
                      <div className="absolute top-3 right-3 bg-lime text-white px-3 py-1 rounded-full text-xs font-bold">
                        Featured
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2 font-syne">{product.name}</h3>
                  <p className="text-earth/70 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-forest">₹{product.price}</span>
                    <span className="text-sm text-earth/60">Stock: {product.stock}</span>
                  </div>
                </Link>
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  disabled={product.stock === 0}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid={`add-to-cart-${product.id}`}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;