import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package } from 'lucide-react';
import { toast } from 'sonner';

const MyOrders = () => {
  const { isAuthenticated, loading, userAxios } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error('Please login to view your orders');
      navigate('/login', { state: { from: '/my-orders' } });
      return;
    }
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, loading, navigate]);

  const fetchOrders = async () => {
    try {
      const res = await userAxios.get('/orders/my-orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen py-12" data-testid="my-orders-page">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 font-syne text-forest">
            My Orders
          </h1>
          <p className="text-earth/70">Track your orders and view order history</p>
        </div>

        {loadingOrders ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-forest border-t-transparent"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="card text-center py-20" data-testid="no-orders">
            <Package className="w-16 h-16 text-earth/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 font-syne text-forest">No Orders Yet</h3>
            <p className="text-earth/60 mb-6">Start shopping to see your orders here</p>
            <button onClick={() => navigate('/products')} className="btn-primary">
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card" data-testid={`order-${order.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3
                      className="font-bold text-lg font-syne"
                      data-testid={`order-number-${order.id}`}
                    >
                      Order #{order.order_number}
                    </h3>
                    <p className="text-sm text-earth/60">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      order.status,
                    )}`}
                    data-testid={`order-status-${order.id}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                      data-testid={`order-item-${item.id}`}
                    >
                      <span>
                        {item.product_name} x {item.quantity}
                      </span>
                      <span className="font-medium">₹{item.subtotal}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-earth/10 pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-earth/60">Total Amount</p>
                    <p
                      className="text-2xl font-bold text-forest"
                      data-testid={`order-total-${order.id}`}
                    >
                      ₹{order.total_amount}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-earth/60">Delivery Address:</p>
                    <p className="font-medium">
                      {order.city}, {order.state}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;

