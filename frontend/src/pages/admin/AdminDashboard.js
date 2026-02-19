import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Users, AlertTriangle, LogOut } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const adminToken = localStorage.getItem('adminToken');
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    fetchStats();
  }, [adminToken]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired. Please login again.');
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  if (!adminToken) return null;

  return (
    <div className="min-h-screen bg-cream" data-testid="admin-dashboard">
      {/* Admin Navbar */}
      <nav className="bg-earth text-white shadow-lg">
        <div className="container-custom py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-syne">Admin Panel</h1>
              <p className="text-sm text-cream/70">Welcome, {adminUser.username}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm md:text-base">
              <Link to="/admin/products" className="hover:text-lime transition-colors" data-testid="admin-nav-products">Products</Link>
              <Link to="/admin/categories" className="hover:text-lime transition-colors" data-testid="admin-nav-categories">Categories</Link>
              <Link to="/admin/orders" className="hover:text-lime transition-colors" data-testid="admin-nav-orders">Orders</Link>
              <Link to="/admin/users" className="hover:text-lime transition-colors" data-testid="admin-nav-users">Users</Link>
              <button onClick={handleLogout} className="flex items-center space-x-2 hover:text-red-400 transition-colors" data-testid="admin-logout-button">
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-custom py-12">
        <h2 className="text-4xl font-bold mb-8 font-syne text-forest" data-testid="dashboard-title">Dashboard Overview</h2>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-forest border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white" data-testid="stat-products">
              <div className="flex items-center justify-between mb-4">
                <Package className="w-10 h-10" />
                <span className="text-3xl font-bold">{stats?.total_products || 0}</span>
              </div>
              <h3 className="text-lg font-semibold">Total Products</h3>
            </div>

            <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white" data-testid="stat-low-stock">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className="w-10 h-10" />
                <span className="text-3xl font-bold">{stats?.low_stock_products || 0}</span>
              </div>
              <h3 className="text-lg font-semibold">Low Stock Items</h3>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white" data-testid="stat-orders">
              <div className="flex items-center justify-between mb-4">
                <ShoppingCart className="w-10 h-10" />
                <span className="text-3xl font-bold">{stats?.total_orders || 0}</span>
              </div>
              <h3 className="text-lg font-semibold">Total Orders</h3>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white" data-testid="stat-users">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-10 h-10" />
                <span className="text-3xl font-bold">{stats?.total_users || 0}</span>
              </div>
              <h3 className="text-lg font-semibold">Registered Users</h3>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <Link to="/admin/products" className="card hover:scale-105 transition-transform" data-testid="manage-products-card">
            <Package className="w-12 h-12 text-forest mb-4" />
            <h3 className="text-xl font-bold mb-2 font-syne text-forest">Manage Products</h3>
            <p className="text-earth/70">Add, edit, or remove products from your inventory</p>
          </Link>

          <Link to="/admin/categories" className="card hover:scale-105 transition-transform" data-testid="manage-categories-card">
            <svg className="w-12 h-12 text-forest mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="text-xl font-bold mb-2 font-syne text-forest">Manage Categories</h3>
            <p className="text-earth/70">Create and organize product categories</p>
          </Link>

          <Link to="/admin/orders" className="card hover:scale-105 transition-transform" data-testid="manage-orders-card">
            <ShoppingCart className="w-12 h-12 text-forest mb-4" />
            <h3 className="text-xl font-bold mb-2 font-syne text-forest">Manage Orders</h3>
            <p className="text-earth/70">View and update order status</p>
          </Link>

          <Link to="/admin/users" className="card hover:scale-105 transition-transform" data-testid="manage-users-card">
            <Users className="w-12 h-12 text-forest mb-4" />
            <h3 className="text-xl font-bold mb-2 font-syne text-forest">Manage Users</h3>
            <p className="text-earth/70">View and manage registered users</p>
          </Link>
        </div>

        {stats?.pending_orders > 0 && (
          <div className="mt-8 card bg-yellow-50 border-2 border-yellow-400" data-testid="pending-orders-alert">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <h3 className="text-lg font-bold text-yellow-900">Pending Orders</h3>
                <p className="text-yellow-800">You have {stats.pending_orders} pending orders that need attention.</p>
              </div>
              <Link to="/admin/orders" className="ml-auto btn-primary">
                View Orders
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;