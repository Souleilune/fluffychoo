'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Plus, X, Edit2, Trash2, Check, Clock, AlertCircle, Ban, Users } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

interface Admin {
  name: string;
  email: string;
}

interface Suggestion {
  id: string;
  title: string;
  suggestion: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  created_by: string | null;
  created_at: string;
  updated_at: string;
  admins: Admin | null;
}

interface CustomerFeedback {
  id: string;
  name: string | null;
  email: string | null;
  title: string;
  feedback: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [customerFeedback, setCustomerFeedback] = useState<CustomerFeedback[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<CustomerFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<Suggestion | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'admin' | 'customer'>('admin');
  const [formData, setFormData] = useState({
    title: '',
    suggestion: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSuggestions();
    fetchCustomerFeedback();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredSuggestions(suggestions);
      setFilteredFeedback(customerFeedback);
    } else {
      setFilteredSuggestions(suggestions.filter(s => s.status === statusFilter));
      setFilteredFeedback(customerFeedback.filter(f => f.status === statusFilter));
    }
  }, [statusFilter, suggestions, customerFeedback]);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/admin/suggestions');
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data);
        setFilteredSuggestions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerFeedback = async () => {
    try {
      const response = await fetch('/api/admin/customer-feedback');
      const data = await response.json();
      if (data.success) {
        setCustomerFeedback(data.data);
        setFilteredFeedback(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch customer feedback:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = '/api/admin/suggestions';
      const method = editingSuggestion ? 'PATCH' : 'POST';
      
      const body = editingSuggestion
        ? { id: editingSuggestion.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        await fetchSuggestions();
        setShowModal(false);
        setEditingSuggestion(null);
        setFormData({ title: '', suggestion: '' });
      }
    } catch (error) {
      console.error('Failed to submit suggestion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/admin/suggestions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchSuggestions();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleCustomerFeedbackStatusUpdate = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/admin/customer-feedback', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchCustomerFeedback();
      }
    } catch (error) {
      console.error('Failed to update customer feedback status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this suggestion?')) return;

    try {
      const response = await fetch(`/api/admin/suggestions?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        await fetchSuggestions();
      }
    } catch (error) {
      console.error('Failed to delete suggestion:', error);
    }
  };

  const handleDeleteCustomerFeedback = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer feedback?')) return;

    try {
      const response = await fetch(`/api/admin/customer-feedback?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        await fetchCustomerFeedback();
      }
    } catch (error) {
      console.error('Failed to delete customer feedback:', error);
    }
  };

  const openEditModal = (suggestion: Suggestion) => {
    setEditingSuggestion(suggestion);
    setFormData({
      title: suggestion.title,
      suggestion: suggestion.suggestion,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSuggestion(null);
    setFormData({ title: '', suggestion: '' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'resolved':
        return <Check className="w-4 h-4" />;
      case 'rejected':
        return <Ban className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">Suggestions & Feedback</h1>
            <p className="text-amber-700 mt-1">Manage team suggestions and customer feedback</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 text-amber-900 font-semibold rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
            style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
          >
            <Plus className="w-5 h-5" />
            <span>New Suggestion</span>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'admin'
                  ? 'text-amber-900 shadow-lg'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
              style={
                activeTab === 'admin'
                  ? { background: 'linear-gradient(to right, #fef9c3, #fde68a)' }
                  : {}
              }
            >
              <MessageSquare className="w-4 h-4" />
              <span>Admin Suggestions ({suggestions.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('customer')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'customer'
                  ? 'text-amber-900 shadow-lg'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
              style={
                activeTab === 'customer'
                  ? { background: 'linear-gradient(to right, #fef9c3, #fde68a)' }
                  : {}
              }
            >
              <Users className="w-4 h-4" />
              <span>Customer Feedback ({customerFeedback.length})</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  statusFilter === status.value
                    ? 'text-amber-900 shadow-lg'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
                style={
                  statusFilter === status.value
                    ? { background: 'linear-gradient(to right, #fef9c3, #fde68a)' }
                    : {}
                }
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Admin Suggestions Grid */}
        {activeTab === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-amber-900 mb-1">
                        {suggestion.title}
                      </h3>
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          suggestion.status
                        )}`}
                      >
                        {getStatusIcon(suggestion.status)}
                        <span className="capitalize">{suggestion.status.replace('-', ' ')}</span>
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(suggestion)}
                        className="text-amber-600 hover:text-amber-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(suggestion.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-amber-700 text-sm mb-4 line-clamp-3">
                    {suggestion.suggestion}
                  </p>

                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-amber-700 mb-1">
                      Change Status
                    </label>
                    <select
                      value={suggestion.status}
                      onChange={(e) => handleStatusUpdate(suggestion.id, e.target.value)}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-amber-900"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="pt-3 border-t border-amber-100">
                    <div className="flex items-center justify-between text-xs text-amber-600">
                      <span>
                        By: {suggestion.admins?.name || 'Unknown'}
                      </span>
                      <span>
                        {new Date(suggestion.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <MessageSquare className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <p className="text-amber-700">No suggestions found</p>
              </div>
            )}
          </div>
        )}

        {/* Customer Feedback Grid */}
        {activeTab === 'customer' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeedback.length > 0 ? (
              filteredFeedback.map((feedback) => (
                <div
                  key={feedback.id}
                  className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-amber-900 mb-1">
                        {feedback.title}
                      </h3>
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          feedback.status
                        )}`}
                      >
                        {getStatusIcon(feedback.status)}
                        <span className="capitalize">{feedback.status.replace('-', ' ')}</span>
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteCustomerFeedback(feedback.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-amber-700 text-sm mb-4 line-clamp-3">
                    {feedback.feedback}
                  </p>

                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-amber-700 mb-1">
                      Change Status
                    </label>
                    <select
                      value={feedback.status}
                      onChange={(e) => handleCustomerFeedbackStatusUpdate(feedback.id, e.target.value)}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-amber-900"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="pt-3 border-t border-amber-100">
                    <div className="flex items-center justify-between text-xs text-amber-600">
                      <span>
                        {feedback.name || 'Anonymous'}
                        {feedback.email && ` (${feedback.email})`}
                      </span>
                      <span>
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Users className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <p className="text-amber-700">No customer feedback found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-900">
                {editingSuggestion ? 'Edit Suggestion' : 'New Suggestion'}
              </h2>
              <button
                onClick={closeModal}
                className="text-amber-600 hover:text-amber-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">
                  Suggestion / Complaint
                </label>
                <textarea
                  value={formData.suggestion}
                  onChange={(e) => setFormData({ ...formData, suggestion: e.target.value })}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-32"
                  placeholder="Describe your suggestion or complaint"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-amber-200 text-amber-900 font-semibold rounded-lg hover:bg-amber-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-amber-900 font-semibold rounded-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
                >
                  {isSubmitting ? 'Saving...' : editingSuggestion ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}