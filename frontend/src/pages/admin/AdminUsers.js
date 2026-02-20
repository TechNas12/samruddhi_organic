import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { useAdmin } from '../../context/AdminContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, adminAxios } = useAdmin();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchUsers = async () => {
    try {
      const res = await adminAxios.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await adminAxios.patch(`/admin/users/${userId}/status?is_active=${!currentStatus}`, {});
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-cream" data-testid="admin-users-page">
      <nav className="bg-earth text-white shadow-lg">
        <div className="container-custom py-4 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center space-x-2 hover:text-lime transition-colors" data-testid="back-to-dashboard">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold font-syne">User Management</h1>
        </div>
      </nav>

      <div className="container-custom py-12">
        <h2 className="text-4xl font-bold mb-8 font-syne text-forest">Registered Users</h2>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-forest border-t-transparent"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="card text-center py-20" data-testid="no-users">
            <p className="text-xl text-earth/60">No users found</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full" data-testid="users-table">
              <thead>
                <tr className="border-b-2 border-earth/10">
                  <th className="text-left py-4 px-4 font-bold text-forest">Name</th>
                  <th className="text-left py-4 px-4 font-bold text-forest">Email</th>
                  <th className="text-left py-4 px-4 font-bold text-forest">Phone</th>
                  <th className="text-left py-4 px-4 font-bold text-forest">Registered</th>
                  <th className="text-left py-4 px-4 font-bold text-forest">Last Login</th>
                  <th className="text-center py-4 px-4 font-bold text-forest">Status</th>
                  <th className="text-center py-4 px-4 font-bold text-forest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-earth/10 hover:bg-cream/50" data-testid={`user-row-${user.id}`}>
                    <td className="py-4 px-4 font-medium">{user.name}</td>
                    <td className="py-4 px-4 text-earth/70">{user.email}</td>
                    <td className="py-4 px-4 text-earth/70">{user.phone || '-'}</td>
                    <td className="py-4 px-4 text-earth/70 text-sm">
                      {new Date(user.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-4 px-4 text-earth/70 text-sm">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString('en-IN') : 'Never'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`} data-testid={`user-status-${user.id}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        className={`p-2 rounded-full transition-colors ${
                          user.is_active
                            ? 'hover:bg-red-50 text-red-600'
                            : 'hover:bg-green-50 text-green-600'
                        }`}
                        title={user.is_active ? 'Deactivate User' : 'Activate User'}
                        data-testid={`toggle-user-${user.id}`}
                      >
                        {user.is_active ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;