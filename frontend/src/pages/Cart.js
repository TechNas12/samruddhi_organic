import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen py-20" data-testid="empty-cart">
        <div className="container-custom text-center">
          <div className="max-w-md mx-auto">
            <ShoppingBag className="w-24 h-24 text-earth/30 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4 font-syne text-forest">Your Cart is Empty</h2>
            <p className="text-earth/60 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/products" className="btn-primary" data-testid="continue-shopping-button">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" data-testid="cart-page">
      <div className="container-custom">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 font-syne text-forest" data-testid="cart-title">
          Shopping Cart ({getTotalItems()} items)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="card flex items-center space-x-4" data-testid={`cart-item-${item.id}`}>
                <img
                  src={item.image_url || 'https://via.placeholder.com/150x150?text=Product'}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-2xl bg-cream"
                />
                <div className="flex-grow">
                  <h3 className="font-bold text-lg font-syne" data-testid={`item-name-${item.id}`}>{item.name}</h3>
                  <p className="text-earth/60 text-sm">₹{item.price} per unit</p>
                  <p className="text-forest font-bold" data-testid={`item-subtotal-${item.id}`}>
                    Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-forest/10 hover:bg-forest/20 flex items-center justify-center transition-colors"
                    data-testid={`decrease-qty-${item.id}`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold w-8 text-center" data-testid={`item-quantity-${item.id}`}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-forest/10 hover:bg-forest/20 flex items-center justify-center transition-colors"
                    data-testid={`increase-qty-${item.id}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors"
                  data-testid={`remove-item-${item.id}`}
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-2xl font-bold mb-6 font-syne text-forest" data-testid="order-summary-title">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-earth/70">
                  <span>Items ({getTotalItems()})</span>
                  <span data-testid="items-total">₹{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-earth/70">
                  <span>Shipping</span>
                  <span className="text-lime font-medium">FREE</span>
                </div>
                <div className="border-t border-earth/10 pt-3 mt-3 flex justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span className="text-forest" data-testid="total-price">₹{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="btn-primary w-full"
                data-testid="proceed-to-checkout-button"
              >
                Proceed to Checkout
              </button>
              {!isAuthenticated && (
                <p className="text-xs text-center text-earth/60 mt-3" data-testid="login-required-message">
                  *You need to login to complete checkout
                </p>
              )}
              <Link
                to="/products"
                className="block text-center mt-4 text-forest hover:text-lime transition-colors"
                data-testid="continue-shopping-link"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;