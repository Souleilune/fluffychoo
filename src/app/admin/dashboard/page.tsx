'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Package, DollarSign, Clock, TrendingUp, CheckCircle2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

interface Stats {
  orders: {
    total: number;
    pending: number;
    completed: number;
    byStatus: Record<string, number>;
  };
  products: {
    total: number;
    active: number;
  };
  revenue: {
    total: string;
  };
  recentOrders: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats?.orders.total || 0,
      icon: ShoppingBag,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Pending Orders',
      value: stats?.orders.pending || 0,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
    },
    {
      title: 'Completed Orders',
      value: stats?.orders.completed || 0,
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Revenue',
      value: `${stats?.revenue.total || '0.00'}`,
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
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
        <div>
          <h1 className="text-3xl font-bold text-amber-900">Dashboard</h1>
          <p className="text-amber-700 mt-1">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-600">{card.title}</p>
                    <p className="text-3xl font-bold text-amber-900 mt-2">{card.value}</p>
                  </div>
                  <div className={`${card.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-100">
            <h2 className="text-xl font-semibold text-amber-900">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-amber-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-amber-50/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-amber-900">{order.name}</div>
                        <div className="text-sm text-amber-600">{order.contact_number}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-amber-800">{order.order}</td>
                      <td className="px-6 py-4 text-sm text-amber-800">{order.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-amber-600">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Products Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-amber-900">Products</h3>
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-amber-700">Total Products</span>
                <span className="font-semibold text-amber-900">{stats?.products.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-700">Active Products</span>
                <span className="font-semibold text-amber-900">{stats?.products.active || 0}</span>
              </div>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-amber-900">Order Status</h3>
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div className="space-y-3">
              {stats?.orders.byStatus &&
                Object.entries(stats.orders.byStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-amber-700 capitalize">{status}</span>
                    <span className="font-semibold text-amber-900">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}