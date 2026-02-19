import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(formData);
      toast.success('Login successful!');
      const from = location.state?.from || '/';
      navigate(from);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12" data-testid="login-page">
      <div className="container-custom">
        <div className="max-w-md mx-auto card">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-forest/10 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-forest" />
            </div>
            <h1 className="text-3xl font-bold mb-2 font-syne text-forest" data-testid="login-title">Welcome Back</h1>
            <p className="text-earth/70">Login to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-earth mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full"
                required
                data-testid="email-input"
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
                data-testid="password-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
              data-testid="login-submit-button"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center mt-6 text-earth/70">
            Don't have an account?{' '}
            <Link to="/signup" className="text-forest font-medium hover:text-lime transition-colors" data-testid="signup-link">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;