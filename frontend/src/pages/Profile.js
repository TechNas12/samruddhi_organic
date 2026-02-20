import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { User as UserIcon } from 'lucide-react';
import IndiaAddressForm from '../components/IndiaAddressForm';

const Profile = () => {
  const { user, setUser, isAuthenticated, loading, userAxios } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
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
    if (!loading && !isAuthenticated) {
      navigate('/login', { state: { from: '/profile' } });
    }
  }, [isAuthenticated, loading, navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userAxios.put('/auth/profile', formData);
      setUser(res.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen py-12" data-testid="profile-page">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto card">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-4 bg-forest/10 rounded-full">
              <UserIcon className="w-8 h-8 text-forest" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-syne text-forest">My Profile</h1>
              <p className="text-earth/60 text-sm">Manage your personal information and address</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-earth mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-earth mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
              disabled={saving}
              className="btn-primary mt-4 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

