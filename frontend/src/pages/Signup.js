import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await signup(formData);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12" data-testid="signup-page">
      <div className="container-custom">
        <div className="max-w-md mx-auto card">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-lime/10 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-forest" />
            </div>
            <h1 className="text-3xl font-bold mb-2 font-syne text-forest" data-testid="signup-title">Create Account</h1>
            <p className="text-earth/70">Join Samruddhi Organics today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-earth mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full"
                required
                data-testid="name-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth mb-2">Email *</label>
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
              <label className="block text-sm font-medium text-earth mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full"
                data-testid="phone-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth mb-2">Password *</label>
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
              data-testid="signup-submit-button"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center mt-6 text-earth/70">
            Already have an account?{' '}
            <Link to="/login" className="text-forest font-medium hover:text-lime transition-colors" data-testid="login-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;