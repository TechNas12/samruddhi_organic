import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products/${id}`);
      setProduct(res.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (quantity > product.stock) {
      toast.error('Insufficient stock');
      return;
    }
    addToCart(product, quantity);
    toast.success(`${quantity} x ${product.name} added to cart!`);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-forest border-t-transparent"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen py-12" data-testid="product-detail-page">
      <div className="container-custom">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center space-x-2 text-forest hover:text-lime mb-8 transition-colors"
          data-testid="back-button"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Products</span>
        </button>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-cream rounded-3xl overflow-hidden">
            <img
              src={product.image_url || 'https://via.placeholder.com/600x600?text=Product'}
              alt={product.name}
              className="w-full h-full object-cover"
              data-testid="product-image"
            />
          </div>

          <div>
            {product.is_featured && (
              <span className="inline-block bg-lime text-white px-4 py-1 rounded-full text-sm font-bold mb-4">
                Featured
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-syne text-forest" data-testid="product-name">
              {product.name}
            </h1>
            {product.category_name && (
              <p className="text-earth/60 mb-4" data-testid="product-category">Category: {product.category_name}</p>
            )}
            <div className="text-4xl font-bold text-forest mb-6" data-testid="product-price">
              ₹{product.price}
            </div>

            <div className="bg-cream rounded-2xl p-6 mb-6">
              <p className="text-earth/80 leading-relaxed" data-testid="product-description">
                {product.description || 'No description available'}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-earth/60 mb-2">Stock Available</p>
              <p className="text-2xl font-bold text-forest" data-testid="product-stock">{product.stock} units</p>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <label className="text-sm font-medium text-earth">Quantity:</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-forest/10 hover:bg-forest/20 flex items-center justify-center font-bold transition-colors"
                  data-testid="decrease-quantity"
                >
                  -
                </button>
                <span className="text-xl font-bold w-12 text-center" data-testid="quantity-display">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-full bg-forest/10 hover:bg-forest/20 flex items-center justify-center font-bold transition-colors"
                  data-testid="increase-quantity"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="add-to-cart-button"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;