import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Users, AlertTriangle, LogOut, MessageSquare, TrendingUp, TrendingDown, DollarSign, Activity, Calendar, Percent } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useAdmin } from '../../context/AdminContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const navigate = useNavigate();
  const { admin, isAuthenticated, loading: authLoading, logout, adminAxios } = useAdmin();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    if (isAuthenticated) {
      fetchStats();
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, navigate, timeRange]);

  const fetchStats = async () => {
    try {
      const res = await adminAxios.get('/admin/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired. Please login again.');
        handleLogout();
      }
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminAxios.get(`/admin/analytics?range=${timeRange}`);
      setAnalytics(res.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load deep analytics.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-cream" data-testid="admin-dashboard">
      {/* Admin Navbar */}
      <nav className="bg-earth text-white shadow-lg">
        <div className="container-custom py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-syne">Admin Panel</h1>
              <p className="text-sm text-cream/70">Welcome, {admin?.username || 'Admin'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm md:text-base">
              <Link to="/admin/products" className="hover:text-lime transition-colors" data-testid="admin-nav-products">Products</Link>
              <Link to="/admin/categories" className="hover:text-lime transition-colors" data-testid="admin-nav-categories">Categories</Link>
              <Link to="/admin/orders" className="hover:text-lime transition-colors" data-testid="admin-nav-orders">Orders</Link>
              <Link to="/admin/users" className="hover:text-lime transition-colors" data-testid="admin-nav-users">Users</Link>
              <Link to="/admin/reviews" className="hover:text-lime transition-colors" data-testid="admin-nav-reviews">Reviews</Link>
              <button onClick={handleLogout} className="flex items-center space-x-2 hover:text-red-400 transition-colors" data-testid="admin-logout-button">
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-custom py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <h2 className="text-4xl font-bold font-syne text-forest" data-testid="dashboard-title">Dashboard Overview</h2>
          <div className="mt-4 md:mt-0 flex items-center bg-white rounded-full border border-earth/20 px-4 py-2 shadow-sm">
            <Calendar className="w-5 h-5 text-earth/50 mr-2" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent border-none outline-none font-medium text-earth focus:ring-0 text-sm cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="1y">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {loading || !stats || !analytics ? (
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

        {!loading && analytics && (
          <>
            <h3 className="text-2xl font-bold mb-6 font-syne text-forest">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
              <div className="card bg-white shadow-sm border border-earth/5 border-l-4 border-l-lime" data-testid="analytics-sales">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-earth/60 font-semibold text-sm uppercase tracking-wider">Total Sales</h3>
                  <div className="p-2 bg-lime/10 rounded-full"><DollarSign className="w-5 h-5 text-lime" /></div>
                </div>
                <div className="text-3xl font-bold text-earth mb-1">₹{analytics.total_sales.toLocaleString('en-IN')}</div>
                <div className="text-xs text-earth/50">Across {analytics.time_range === 'all' ? 'All Time' : `Last ${analytics.time_range}`}</div>
              </div>

              <div className="card bg-white shadow-sm border border-earth/5 border-l-4 border-l-forest" data-testid="analytics-products">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-earth/60 font-semibold text-sm uppercase tracking-wider">Products Sold</h3>
                  <div className="p-2 bg-forest/10 rounded-full"><Package className="w-5 h-5 text-forest" /></div>
                </div>
                <div className="text-3xl font-bold text-earth mb-1">{analytics.total_products_sold} Unit{analytics.total_products_sold !== 1 ? 's' : ''}</div>
                <div className="text-xs text-earth/50">From {analytics.total_orders} valid orders</div>
              </div>

              <div className="card bg-white shadow-sm border border-earth/5 border-l-4 border-l-purple-500" data-testid="analytics-avg-ticket">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-earth/60 font-semibold text-sm uppercase tracking-wider">Avg Order Value</h3>
                  <div className="p-2 bg-purple-500/10 rounded-full"><Activity className="w-5 h-5 text-purple-600" /></div>
                </div>
                <div className="text-3xl font-bold text-earth mb-1">₹{analytics.mean_ticket_price.toLocaleString('en-IN')}</div>
                <div className="text-xs text-earth/50">Per completed transaction</div>
              </div>

              <div className="card bg-white shadow-sm border border-earth/5 border-l-4 border-l-blue-500" data-testid="analytics-monthly-sales">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-earth/60 font-semibold text-sm uppercase tracking-wider">Avg Sales / Month</h3>
                  <div className="p-2 bg-blue-500/10 rounded-full"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
                </div>
                <div className="text-3xl font-bold text-earth mb-1">₹{analytics.avg_sales_per_month.toLocaleString('en-IN')}</div>
                <div className="text-xs text-earth/50">Calculated over {analytics.active_months_calculated} months</div>
              </div>

              <div className="card bg-white shadow-sm border border-earth/5 border-l-4 border-l-orange-500" data-testid="analytics-monthly-orders">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-earth/60 font-semibold text-sm uppercase tracking-wider">Avg Orders / Month</h3>
                  <div className="p-2 bg-orange-500/10 rounded-full"><ShoppingCart className="w-5 h-5 text-orange-600" /></div>
                </div>
                <div className="text-3xl font-bold text-earth mb-1">{analytics.avg_orders_per_month}</div>
                <div className="text-xs text-earth/50">Calculated over {analytics.active_months_calculated} months</div>
              </div>

              <div className={`card bg-white shadow-sm border border-earth/5 border-l-4 ${analytics.sales_growth_rate >= 0 ? 'border-l-lime' : 'border-l-red-500'}`} data-testid="analytics-sales-growth">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-earth/60 font-semibold text-sm uppercase tracking-wider">Sales Growth Rate</h3>
                  <div className={`p-2 rounded-full ${analytics.sales_growth_rate >= 0 ? 'bg-lime/10' : 'bg-red-500/10'}`}>
                    {analytics.sales_growth_rate >= 0 ? <TrendingUp className="w-5 h-5 text-lime" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
                  </div>
                </div>
                <div className={`text-3xl font-bold mb-1 ${analytics.sales_growth_rate >= 0 ? 'text-lime' : 'text-red-500'}`}>
                  {analytics.sales_growth_rate > 0 ? '+' : ''}{analytics.sales_growth_rate}%
                </div>
                <div className="text-xs text-earth/50">Compared to previous period</div>
              </div>
            </div>

            {/* Charts Section */}
            {analytics.chart_data && analytics.chart_data.length > 0 && (
              <div className="grid lg:grid-cols-2 gap-6 mb-12">
                {/* Sales Chart */}
                <div className="card bg-white shadow-sm border border-earth/5" data-testid="analytics-sales-chart">
                  <h3 className="text-xl font-bold mb-6 font-syne text-forest">Revenue Trends</h3>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.chart_data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#418b33" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#418b33" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#6b6960" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6b6960" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e2d3" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#2b2a27', color: '#fff', borderRadius: '8px', border: 'none' }}
                          itemStyle={{ color: '#bce474' }}
                          formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
                        />
                        <Area
                          type="monotone"
                          dataKey="sales"
                          stroke="#418b33"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorSales)"
                          dot={{ r: 4, fill: '#fff', strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Products Sold Chart */}
                <div className="card bg-white shadow-sm border border-earth/5" data-testid="analytics-products-chart">
                  <h3 className="text-xl font-bold mb-6 font-syne text-forest">Units Sold Volume</h3>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.chart_data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec932e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ec932e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#6b6960" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6b6960" fontSize={12} tickLine={false} axisLine={false} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e2d3" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#2b2a27', color: '#fff', borderRadius: '8px', border: 'none' }}
                          itemStyle={{ color: '#ec932e' }}
                          formatter={(value) => [value, 'Units Sold']}
                        />
                        <Area
                          type="monotone"
                          dataKey="products"
                          stroke="#ec932e"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorProducts)"
                          dot={{ r: 4, fill: '#fff', strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <h3 className="text-2xl font-bold mb-6 font-syne text-forest mt-8">Quick Actions</h3>
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

          <Link to="/admin/reviews" className="card hover:scale-105 transition-transform" data-testid="manage-reviews-card">
            <MessageSquare className="w-12 h-12 text-forest mb-4" />
            <h3 className="text-xl font-bold mb-2 font-syne text-forest">Manage Reviews</h3>
            <p className="text-earth/70">Add and manage brand reviews</p>
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