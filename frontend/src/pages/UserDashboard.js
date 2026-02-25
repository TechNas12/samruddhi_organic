import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, User as UserIcon, Edit } from 'lucide-react';
import { toast } from 'sonner';
import IndiaAddressForm from '../components/IndiaAddressForm';

const UserDashboard = () => {
  const { user, setUser, isAuthenticated, loading, userAxios } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initialTab = location.pathname === '/profile' ? 'profile' : 'orders';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (location.pathname === '/profile') {
      setActiveTab('profile');
    } else {
      setActiveTab('orders');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (isAuthenticated && activeTab === 'orders') {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, loading, activeTab, navigate, location.pathname]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
      });
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await userAxios.get('/orders/my-orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await userAxios.put('/auth/profile', formData);
      setUser(res.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading || !isAuthenticated) return null;

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

  return (
    <div className="min-h-screen py-12" data-testid="user-dashboard">
      <div className="container-custom">
        <div className="mb-8">
          <h1
            className="text-4xl md:text-5xl font-bold mb-2 font-syne text-forest"
            data-testid="dashboard-title"
          >
            My Account
          </h1>
          <p className="text-earth/70">Welcome back, {user?.name}!</p>
        </div>

        <div className="flex space-x-4 mb-8 border-b border-earth/10">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-6 font-medium transition-colors ${activeTab === 'orders'
                ? 'border-b-2 border-forest text-forest'
                : 'text-earth/60 hover:text-forest'
              }`}
            data-testid="orders-tab"
          >
            My Orders
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-6 font-medium transition-colors ${activeTab === 'profile'
                ? 'border-b-2 border-forest text-forest'
                : 'text-earth/60 hover:text-forest'
              }`}
            data-testid="profile-tab"
          >
            Profile
          </button>
        </div>

        {activeTab === 'orders' && (
          <div data-testid="orders-section">
            {ordersLoading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-forest border-t-transparent"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="card text-center py-20" data-testid="no-orders">
                <Package className="w-16 h-16 text-earth/30 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 font-syne text-forest">No Orders Yet</h3>
                <p className="text-earth/60 mb-6">
                  Start shopping to see your orders here
                </p>
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
        )}

        {activeTab === 'profile' && (
          <div className="card max-w-2xl" data-testid="profile-section">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 bg-forest/10 rounded-full">
                <UserIcon className="w-8 h-8 text-forest" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-syne text-forest">
                  Profile Information
                </h2>
                <p className="text-earth/60 text-sm">Manage your account details</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-earth mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-earth mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <IndiaAddressForm
                value={{
                  address: formData.address,
                  city: formData.city,
                  state: formData.state,
                  pincode: formData.pincode,
                }}
                onChange={(updated) =>
                  setFormData((prev) => ({
                    ...prev,
                    ...updated,
                  }))
                }
              />

              <button
                type="submit"
                disabled={savingProfile}
                className="btn-primary mt-4 flex items-center space-x-2 disabled:opacity-50"
              >
                <Edit className="w-5 h-5" />
                <span>{savingProfile ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;