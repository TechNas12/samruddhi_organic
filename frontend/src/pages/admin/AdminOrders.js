import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAdmin } from '../../context/AdminContext';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, adminAxios } = useAdmin();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    if (isAuthenticated) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, navigate, statusFilter]);

  const fetchOrders = async () => {
    try {
      let url = '/admin/orders';
      if (statusFilter) url += `?status_filter=${statusFilter}`;
      const res = await adminAxios.get(url);
      setOrders(res.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await adminAxios.patch(`/admin/orders/${orderId}/status?status=${newStatus}`, {});
      toast.success('Order status updated!');
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-cream" data-testid="admin-orders-page">
      <nav className="bg-earth text-white shadow-lg">
        <div className="container-custom py-4 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center space-x-2 hover:text-lime transition-colors" data-testid="back-to-dashboard">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold font-syne">Order Management</h1>
        </div>
      </nav>

      <div className="container-custom py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold font-syne text-forest">Orders</h2>
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-full border-2 border-forest/20"
              data-testid="status-filter"
            >
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-forest border-t-transparent"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="card text-center py-20" data-testid="no-orders">
            <p className="text-xl text-earth/60">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card" data-testid={`order-${order.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-xl font-syne" data-testid={`order-number-${order.id}`}>
                      Order #{order.order_number}
                    </h3>
                    <p className="text-sm text-earth/60">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`} data-testid={`order-status-${order.id}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      className="p-2 hover:bg-forest/10 rounded-full transition-colors"
                      data-testid={`view-order-${order.id}`}
                    >
                      <Eye className="w-5 h-5 text-forest" />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-earth/60">Customer</p>
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-sm text-earth/70">{order.email}</p>
                    <p className="text-sm text-earth/70">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-earth/60">Delivery Address</p>
                    <p className="text-sm">{order.address}</p>
                    <p className="text-sm">{order.city}, {order.state} - {order.pincode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-earth/60">Total Amount</p>
                    <p className="text-2xl font-bold text-forest" data-testid={`order-total-${order.id}`}>₹{order.total_amount}</p>
                  </div>
                </div>

                {selectedOrder?.id === order.id && (
                  <div className="border-t border-earth/10 pt-4 mt-4" data-testid={`order-details-${order.id}`}>
                    <h4 className="font-bold mb-3">Order Items:</h4>
                    <div className="space-y-2 mb-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between bg-cream p-3 rounded-lg">
                          <span>{item.product_name} x {item.quantity}</span>
                          <span className="font-medium">₹{item.subtotal}</span>
                        </div>
                      ))}
                    </div>
                    {order.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-earth/60">Order Notes:</p>
                        <p className="text-sm italic">{order.notes}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-earth mb-2">Update Status:</p>
                      <div className="flex flex-wrap gap-2">
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(order.id, status)}
                            disabled={order.status === status}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${order.status === status
                              ? 'bg-earth/20 text-earth/50 cursor-not-allowed'
                              : 'bg-forest/10 text-forest hover:bg-forest hover:text-white'
                              }`}
                            data-testid={`update-status-${status}-${order.id}`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;