import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAdmin } from '../../context/AdminContext';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: ''
  });
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, adminAxios } = useAdmin();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchCategories = async () => {
    try {
      const res = await adminAxios.get('/categories');
      setCategories(res.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminAxios.put(`/admin/categories/${editingCategory.id}`, formData);
        toast.success('Category updated successfully!');
      } else {
        await adminAxios.post('/admin/categories', formData);
        toast.success('Category created successfully!');
      }
      
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', image_url: '' });
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All products in this category will remain but will have no category.')) return;
    try {
      await adminAxios.delete(`/admin/categories/${id}`);
      toast.success('Category deleted successfully!');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-cream" data-testid="admin-categories-page">
      <nav className="bg-earth text-white shadow-lg">
        <div className="container-custom py-4 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center space-x-2 hover:text-lime transition-colors" data-testid="back-to-dashboard">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold font-syne">Category Management</h1>
        </div>
      </nav>

      <div className="container-custom py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold font-syne text-forest">Categories</h2>
            <p className="text-earth/70 mt-2">Manage product categories for filtering</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingCategory(null);
              setFormData({ name: '', description: '', image_url: '' });
            }}
            className="btn-primary flex items-center space-x-2"
            data-testid="add-category-button"
          >
            <Plus className="w-5 h-5" />
            <span>Add Category</span>
          </button>
        </div>

        {showForm && (
          <div className="card mb-8" data-testid="category-form">
            <h3 className="text-2xl font-bold mb-6 font-syne text-forest">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-earth mb-2">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full"
                  placeholder="e.g., Organic Seeds"
                  required
                  data-testid="category-name-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full"
                  rows="3"
                  placeholder="Brief description of this category"
                  data-testid="category-description-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth mb-2">Category Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full"
                  placeholder="https://example.com/category-image.jpg"
                  data-testid="category-image-input"
                />
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="btn-primary" data-testid="save-category-button">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCategory(null);
                  }}
                  className="px-8 py-3 rounded-full border-2 border-earth/20 hover:border-earth/40 transition-colors"
                  data-testid="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-forest border-t-transparent"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="card text-center py-20" data-testid="no-categories">
            <FolderPlus className="w-16 h-16 text-earth/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 font-syne text-forest">No Categories Yet</h3>
            <p className="text-earth/60 mb-6">Create your first category to organize products</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Create First Category
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="card" data-testid={`category-card-${category.id}`}>
                {category.image_url && (
                  <div className="h-32 bg-cream rounded-2xl overflow-hidden mb-4">
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <h3 className="font-bold text-xl mb-2 font-syne text-forest" data-testid={`category-name-${category.id}`}>
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-earth/70 text-sm mb-4 line-clamp-2">{category.description}</p>
                )}
                <p className="text-xs text-earth/60 mb-4">
                  Created: {new Date(category.created_at).toLocaleDateString()}
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                    data-testid={`edit-category-${category.id}`}
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
                    data-testid={`delete-category-${category.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
