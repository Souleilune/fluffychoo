'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, Filter, Trash2, Edit, Eye, X, Save } from 'lucide-react';

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
  created_at: string;
  updated_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        setIsModalOpen(false);
        setEditingOrder({});
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
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const openEditModal = (order: Order) => {
    setSelectedOrder(order);
    setEditingOrder({
      id: order.id,
      status: order.status,
      notes: order.notes || '',
    });
    setIsModalOpen(true);
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
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
                  placeholder="Search by name, email, or contact..."
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
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-amber-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-amber-900">{order.name}</div>
                          <div className="text-sm text-amber-600">{order.contact_number}</div>
                          {order.email && (
                            <div className="text-sm text-amber-600">{order.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-amber-900">{order.order}</div>
                          <div className="text-sm text-amber-600">Qty: {order.quantity}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-amber-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(order)}
                            className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
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
                    <td colSpan={5} className="px-6 py-12 text-center text-amber-600">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-amber-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-amber-900">Edit Order</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-amber-600 hover:text-amber-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Details (Read-only) */}
              <div className="bg-amber-50 rounded-lg p-4 space-y-2">
                <div><strong>Customer:</strong> {selectedOrder.name}</div>
                <div><strong>Contact:</strong> {selectedOrder.contact_number}</div>
                <div><strong>Location:</strong> {selectedOrder.location}</div>
                <div><strong>Order:</strong> {selectedOrder.order}</div>
                <div><strong>Quantity:</strong> {selectedOrder.quantity}</div>
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

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-amber-200 text-amber-900 font-semibold rounded-full hover:bg-amber-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateOrder}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}