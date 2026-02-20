import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAdmin } from '../../context/AdminContext';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdmin();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData);
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-earth" data-testid="admin-login-page">
      <div className="container-custom">
        <div className="max-w-md mx-auto card">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-red-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2 font-syne text-forest" data-testid="admin-login-title">Admin Login</h1>
            <p className="text-earth/70">Access administrative panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-earth mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full"
                required
                data-testid="admin-username-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full"
                required
                data-testid="admin-password-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-medium w-full transition-all disabled:opacity-50"
              data-testid="admin-login-submit-button"
            >
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-earth/60">
            Default: username=admin, password=admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;