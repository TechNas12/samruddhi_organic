import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import axios from 'axios';
import { CheckCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Checkout = () => {
  const { user, token, isAuthenticated } = useAuth();
  const { cart, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }
    if (user) {
      setFormData(prev => ({
        ...prev,
        customer_name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || ''
      }));
    }
  }, [isAuthenticated, cart, navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        ...formData
      };

      const res = await axios.post(`${API_URL}/api/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      clearCart();
      toast.success('Order placed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || cart.length === 0) return null;

  return (
    <div className="min-h-screen py-12" data-testid="checkout-page">
      <div className="container-custom">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 font-syne text-forest" data-testid="checkout-title">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="card space-y-4">
              <h2 className="text-2xl font-bold mb-4 font-syne text-forest">Delivery Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-earth mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full"
                    required
                    data-testid="customer-name-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full"
                    required
                    data-testid="phone-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-earth mb-2">Address *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full"
                  rows="3"
                  required
                  data-testid="address-input"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-earth mb-2">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full"
                    required
                    data-testid="city-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth mb-2">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full"
                    required
                    data-testid="state-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth mb-2">Pincode *</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full"
                    required
                    data-testid="pincode-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-earth mb-2">Order Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full"
                  rows="2"
                  placeholder="Any special instructions?"
                  data-testid="notes-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 flex items-center justify-center space-x-2"
                data-testid="place-order-button"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{loading ? 'Placing Order...' : 'Place Order'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-2xl font-bold mb-6 font-syne text-forest">Order Summary</h2>
              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm" data-testid={`summary-item-${item.id}`}>
                    <span>{item.name} x {item.quantity}</span>
                    <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-earth/10 pt-3 space-y-2">
                <div className="flex justify-between text-earth/70">
                  <span>Subtotal</span>
                  <span data-testid="subtotal-amount">₹{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-earth/70">
                  <span>Shipping</span>
                  <span className="text-lime font-medium">FREE</span>
                </div>
                <div className="border-t border-earth/10 pt-3 flex justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span className="text-forest" data-testid="total-amount">₹{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;