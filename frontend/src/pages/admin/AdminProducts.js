import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    price: '',
    stock: '',
    image_url: '',
    is_featured: false
  });
  const navigate = useNavigate();
  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    fetchProducts();
    fetchCategories();
  }, [adminToken]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products`);
      setProducts(res.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categories`);
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        await axios.put(`${API_URL}/api/admin/products/${editingProduct.id}`, data, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        toast.success('Product updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/admin/products`, data, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        toast.success('Product created successfully!');
      }
      
      setShowForm(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', category_id: '', price: '', stock: '', image_url: '', is_featured: false });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category_id: product.category_id || '',
      price: product.price,
      stock: product.stock,
      image_url: product.image_url || '',
      is_featured: product.is_featured
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (!adminToken) return null;

  return (
    <div className="min-h-screen bg-cream" data-testid="admin-products-page">
      <nav className="bg-earth text-white shadow-lg">
        <div className="container-custom py-4 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center space-x-2 hover:text-lime transition-colors" data-testid="back-to-dashboard">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold font-syne">Product Management</h1>
        </div>
      </nav>

      <div className="container-custom py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold font-syne text-forest">Products</h2>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingProduct(null);
              setFormData({ name: '', description: '', category_id: '', price: '', stock: '', image_url: '', is_featured: false });
            }}
            className="btn-primary flex items-center space-x-2"
            data-testid="add-product-button"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>

        {showForm && (
          <div className="card mb-8" data-testid="product-form">
            <h3 className="text-2xl font-bold mb-6 font-syne text-forest">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-earth mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full"
                    required
                    data-testid="product-name-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth mb-2">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full"
                    data-testid="product-category-select"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-earth mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full"
                  rows="3"
                  data-testid="product-description-input"
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-earth mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full"
                    required
                    data-testid="product-price-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth mb-2">Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full"
                    required
                    data-testid="product-stock-input"
                  />
                </div>
                <div className="flex items-center pt-8">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-5 h-5"
                      data-testid="product-featured-checkbox"
                    />
                    <span className="text-sm font-medium text-earth">Featured Product</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-earth mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full"
                  placeholder="https://example.com/image.jpg"
                  data-testid="product-image-input"
                />
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="btn-primary" data-testid="save-product-button">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
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
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full" data-testid="products-table">
              <thead>
                <tr className="border-b-2 border-earth/10">
                  <th className="text-left py-4 px-4 font-bold text-forest">Image</th>
                  <th className="text-left py-4 px-4 font-bold text-forest">Name</th>
                  <th className="text-left py-4 px-4 font-bold text-forest">Category</th>
                  <th className="text-left py-4 px-4 font-bold text-forest">Price</th>
                  <th className="text-left py-4 px-4 font-bold text-forest">Stock</th>
                  <th className="text-left py-4 px-4 font-bold text-forest">Featured</th>
                  <th className="text-right py-4 px-4 font-bold text-forest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-earth/10 hover:bg-cream/50" data-testid={`product-row-${product.id}`}>
                    <td className="py-4 px-4">
                      <img
                        src={product.image_url || 'https://via.placeholder.com/50'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    </td>
                    <td className="py-4 px-4 font-medium">{product.name}</td>
                    <td className="py-4 px-4 text-earth/70">{product.category_name || '-'}</td>
                    <td className="py-4 px-4 font-bold text-forest">₹{product.price}</td>
                    <td className="py-4 px-4">
                      <span className={`${product.stock < 10 ? 'text-red-600 font-bold' : ''}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {product.is_featured && (
                        <span className="bg-lime text-white px-2 py-1 rounded-full text-xs">Featured</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                          data-testid={`edit-product-${product.id}`}
                        >
                          <Edit className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-50 rounded-full transition-colors"
                          data-testid={`delete-product-${product.id}`}
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
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

export default AdminProducts;
