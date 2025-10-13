'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, Filter, Trash2, Edit, X, Save, ExternalLink, FileText, MapPin, Phone, Mail, Package, Calendar, Eye } from 'lucide-react';
import Image from 'next/image';

interface Order {
  id: string;
  name: string;
  location: string;
  email: string | null;
  contact_number: string;
  order: string;
  quantity: number;
  status: string;
  notes: string | null;
  order_reference: string;
  payment_proof_url: string | null;
  terms_accepted: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Partial<Order>>({});

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, searchQuery]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder.id) return;

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingOrder),
      });

      if (response.ok) {
        await fetchOrders();
        setIsEditModalOpen(false);
        setEditingOrder({});
        // Refresh the view modal if it's open
        if (selectedOrder && selectedOrder.id === editingOrder.id) {
          const updatedOrder = orders.find(o => o.id === editingOrder.id);
          if (updatedOrder) setSelectedOrder(updatedOrder);
        }
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const response = await fetch(`/api/admin/orders?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchOrders();
        setIsViewModalOpen(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const openViewModal = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const openEditModal = (order: Order) => {
    setSelectedOrder(order);
    setEditingOrder({
      id: order.id,
      status: order.status,
      notes: order.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-amber-900">Order Management</h1>
          <p className="text-amber-700 mt-1">View and manage all customer orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, contact, or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-amber-50 border-b border-amber-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-amber-50 cursor-pointer transition-colors"
                      onClick={() => openViewModal(order)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-semibold text-amber-900">
                          {order.order_reference}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-amber-900">{order.name}</div>
                        <div className="text-sm text-amber-600">{order.contact_number}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-amber-900">{order.order}</div>
                        <div className="text-sm text-amber-600">Qty: {order.quantity}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openEditModal(order)}
                            className="p-2 text-amber-900 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                            style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transform hover:scale-105 transition-all duration-300"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-amber-600">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Order Detail Modal */}
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-amber-50 to-yellow-50 p-6 border-b border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-amber-900">Order Details</h2>
                  <p className="text-sm text-amber-700 mt-1 font-mono font-semibold">
                    {selectedOrder.order_reference}
                  </p>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-2 hover:bg-amber-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-amber-900" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status.toUpperCase()}
                </span>
                <div className="text-sm text-amber-600">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {new Date(selectedOrder.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-amber-700 font-medium uppercase tracking-wide">Name</label>
                    <p className="text-amber-900 font-medium mt-1">{selectedOrder.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-amber-700 font-medium uppercase tracking-wide">Contact Number</label>
                    <p className="text-amber-900 font-medium mt-1 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {selectedOrder.contact_number}
                    </p>
                  </div>
                  {selectedOrder.email && (
                    <div>
                      <label className="text-xs text-amber-700 font-medium uppercase tracking-wide">Email</label>
                      <p className="text-amber-900 font-medium mt-1 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {selectedOrder.email}
                      </p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="text-xs text-amber-700 font-medium uppercase tracking-wide">Delivery Location</label>
                    <p className="text-amber-900 font-medium mt-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedOrder.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-5 border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-700">Product</span>
                    <span className="text-amber-900 font-semibold">{selectedOrder.order}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-amber-700">Quantity</span>
                    <span className="text-amber-900 font-semibold">{selectedOrder.quantity} pcs</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-amber-300">
                    <span className="text-amber-700">Terms Accepted</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      selectedOrder.terms_accepted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedOrder.terms_accepted ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Proof */}
              {selectedOrder.payment_proof_url && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Proof of Payment
                    </span>
                    <a
                      href={selectedOrder.payment_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      Open Full Size
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </h3>
                  <div className="relative w-full h-96 bg-white rounded-lg overflow-hidden border border-gray-300">
                    <Image
                      src={selectedOrder.payment_proof_url}
                      alt="Payment proof"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                  <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Notes
                  </h3>
                  <p className="text-amber-900 whitespace-pre-wrap leading-relaxed">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(selectedOrder);
                  }}
                  className="flex-1 py-3 px-4 text-amber-900 font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
                >
                  <Edit className="w-5 h-5" />
                  Edit Order
                </button>
                <button
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  className="px-6 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-amber-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-amber-900">Edit Order</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-amber-600 hover:text-amber-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Details (Read-only) */}
              <div className="bg-amber-50 rounded-lg p-4 space-y-2">
                <div className="text-sm">
                  <strong className="text-amber-900">Reference:</strong>{' '}
                  <span className="font-mono">{selectedOrder.order_reference}</span>
                </div>
                <div className="text-sm">
                  <strong className="text-amber-900">Customer:</strong> {selectedOrder.name}
                </div>
                <div className="text-sm">
                  <strong className="text-amber-900">Contact:</strong> {selectedOrder.contact_number}
                </div>
                <div className="text-sm">
                  <strong className="text-amber-900">Location:</strong> {selectedOrder.location}
                </div>
                <div className="text-sm">
                  <strong className="text-amber-900">Order:</strong> {selectedOrder.order}
                </div>
                <div className="text-sm">
                  <strong className="text-amber-900">Quantity:</strong> {selectedOrder.quantity}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Status
                </label>
                <select
                  value={editingOrder.status}
                  onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Notes
                </label>
                <textarea
                  value={editingOrder.notes || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Add notes about this order..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border-2 border-amber-300 text-amber-900 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateOrder}
                  className="flex-1 px-4 py-2 text-amber-900 font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}