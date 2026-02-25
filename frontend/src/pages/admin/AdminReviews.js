import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft, Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useAdmin } from '../../context/AdminContext';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [formData, setFormData] = useState({
        customer_name: '',
        rating: 5.0,
        comment: ''
    });
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading, adminAxios } = useAdmin();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/admin/login');
            return;
        }
        if (isAuthenticated) {
            fetchReviews();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, authLoading, navigate]);

    const fetchReviews = async () => {
        try {
            const res = await adminAxios.get('/admin/reviews');
            setReviews(res.data);
        } catch (error) {
            toast.error('Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.comment && formData.comment.length > 150) {
            toast.error('Comment must be 150 characters or less');
            return;
        }
        if (formData.rating < 0.5 || formData.rating > 5) {
            toast.error('Rating must be between 0.5 and 5.0');
            return;
        }
        try {
            if (editingReview) {
                await adminAxios.put(`/admin/reviews/${editingReview}`, formData);
                toast.success('Brand review updated successfully!');
            } else {
                await adminAxios.post('/admin/reviews', formData);
                toast.success('Brand review created successfully!');
            }
            setShowForm(false);
            setEditingReview(null);
            setFormData({ customer_name: '', rating: 5.0, comment: '' });
            fetchReviews();
        } catch (error) {
            toast.error(error.response?.data?.detail || `Failed to ${editingReview ? 'update' : 'create'} review`);
        }
    };

    const handleEdit = (review) => {
        setFormData({
            customer_name: review.customer_name,
            rating: review.rating,
            comment: review.comment || ''
        });
        setEditingReview(review.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this review?')) {
            try {
                await adminAxios.delete(`/admin/reviews/${id}`);
                toast.success('Review deleted successfully!');
                fetchReviews();
            } catch (error) {
                toast.error('Failed to delete review');
            }
        }
    };

    const toggleApproval = async (id, currentStatus) => {
        try {
            await adminAxios.patch(`/admin/reviews/${id}/approve?is_approved=${!currentStatus}`);
            toast.success(`Review ${!currentStatus ? 'approved' : 'hidden'} successfully!`);
            fetchReviews();
        } catch (error) {
            toast.error('Failed to update review status');
        }
    };

    if (authLoading || !isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-cream" data-testid="admin-reviews-page">
            <nav className="bg-earth text-white shadow-lg">
                <div className="container-custom py-4 flex items-center justify-between">
                    <Link to="/admin/dashboard" className="flex items-center space-x-2 hover:text-lime transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Dashboard</span>
                    </Link>
                    <h1 className="text-2xl font-bold font-syne">Review Management</h1>
                </div>
            </nav>

            <div className="container-custom py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-4xl font-bold font-syne text-forest">Brand Reviews</h2>
                        <p className="text-earth/70 mt-2">Manage customer reviews for the landing page</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowForm(true);
                            setEditingReview(null);
                            setFormData({ customer_name: '', rating: 5.0, comment: '' });
                        }}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Brand Review</span>
                    </button>
                </div>

                {showForm && (
                    <div className="card mb-8">
                        <h3 className="text-2xl font-bold mb-6 font-syne text-forest">
                            {editingReview ? 'Edit Brand Review' : 'Add Brand Review'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-earth mb-2">Reviewer Name *</label>
                                <input
                                    type="text"
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                    className="w-full"
                                    placeholder="e.g., John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-earth mb-2">Rating (0.5 to 5.0) *</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0.5"
                                    max="5.0"
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                                    className="w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-earth mb-2">Review Text (max 150 chars)</label>
                                <textarea
                                    value={formData.comment}
                                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                    className="w-full"
                                    rows="3"
                                    maxLength="150"
                                    placeholder="Review comment..."
                                />
                                <p className="text-xs mt-1 text-earth/60">{formData.comment.length} / 150 characters</p>
                            </div>
                            <div className="flex space-x-4">
                                <button type="submit" className="btn-primary">
                                    {editingReview ? 'Save Changes' : 'Create Review'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingReview(null);
                                    }}
                                    className="px-8 py-3 rounded-full border-2 border-earth/20 hover:border-earth/40 transition-colors"
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
                ) : reviews.length === 0 ? (
                    <div className="card text-center py-20">
                        <MessageSquare className="w-16 h-16 text-earth/30 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2 font-syne text-forest">No Reviews Yet</h3>
                        <p className="text-earth/60 mb-6">Create brand reviews to show on the landing page</p>
                        <button onClick={() => setShowForm(true)} className="btn-primary">
                            Create First Review
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="card flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-xl font-syne text-forest">
                                            {review.customer_name}
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center space-x-1 text-yellow-500 mr-2">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="text-sm font-bold">{review.rating}</span>
                                            </div>
                                            <button
                                                onClick={() => handleEdit(review)}
                                                className="p-1 hover:text-earth/80 transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="p-1 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {review.product_id ? (
                                        <p className="text-xs text-earth/60 mb-2">Product Review</p>
                                    ) : (
                                        <p className="text-xs text-earth/60 mb-2 font-semibold">Brand Review</p>
                                    )}
                                    {review.comment && (
                                        <p className="text-earth/70 text-sm mb-4 line-clamp-3">"{review.comment}"</p>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-earth/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${review.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {review.is_approved ? 'Approved' : 'Pending/Hidden'}
                                        </span>
                                        <p className="text-xs text-earth/50">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => toggleApproval(review.id, review.is_approved)}
                                        className={`w-full py-2 rounded-full font-semibold transition-colors ${review.is_approved ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                    >
                                        {review.is_approved ? 'Hide Review' : 'Approve Review'}
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

export default AdminReviews;
