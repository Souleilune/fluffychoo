'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, DollarSign, Clock, CheckCircle2, Settings, Clock3, Users } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

interface Orders {
  id: string;
  name: string;
  order: string;
  quantity: number;
  status: string;
  created_at: string;
  contact_number: string;
}

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
  recentOrders: Orders[];
}

interface AppSettings {
  id: string;
  order_form_enabled: boolean;
  max_daily_orders: number;
  manual_override: boolean;
  operating_hours_start: number;
  operating_hours_end: number;
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [maxDailyOrders, setMaxDailyOrders] = useState<number>(10);
  const [operatingHoursStart, setOperatingHoursStart] = useState<number>(6);
  const [operatingHoursEnd, setOperatingHoursEnd] = useState<number>(21);

  useEffect(() => {
    fetchStats();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setMaxDailyOrders(settings.max_daily_orders || 10);
      setOperatingHoursStart(settings.operating_hours_start || 6);
      setOperatingHoursEnd(settings.operating_hours_end || 21);
    }
  }, [settings]);

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

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const toggleOrderForm = async () => {
    if (!settings || isUpdatingSettings) return;
    
    setIsUpdatingSettings(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_form_enabled: !settings.order_form_enabled,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      } else {
        console.error('Failed to update settings:', data.error);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const updateMaxDailyOrders = async () => {
    if (!settings || isUpdatingSettings) return;
    
    setIsUpdatingSettings(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          max_daily_orders: maxDailyOrders,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      } else {
        console.error('Failed to update settings:', data.error);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const updateOperatingHours = async () => {
    if (!settings || isUpdatingSettings) return;
    
    if (operatingHoursStart >= operatingHoursEnd) {
      alert('Start time must be before end time');
      return;
    }

    setIsUpdatingSettings(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operating_hours_start: operatingHoursStart,
          operating_hours_end: operatingHoursEnd,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      } else {
        console.error('Failed to update settings:', data.error);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setIsUpdatingSettings(false);
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
        <div>
          <h1 className="text-3xl font-bold text-amber-900">Dashboard</h1>
          <p className="text-amber-700 mt-1">Welcome back!</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Settings className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900">Order Form Control</h3>
                <p className="text-sm text-amber-700">
                  {settings?.order_form_enabled 
                    ? 'Form enabled - Auto-rules apply (time & order count)'
                    : 'Form manually disabled - Customers cannot order'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={toggleOrderForm}
              disabled={isUpdatingSettings}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                settings?.order_form_enabled ? 'bg-amber-600' : 'bg-gray-200'
              } ${isUpdatingSettings ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings?.order_form_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900">Maximum Daily Orders</h3>
                <p className="text-sm text-amber-700">
                  Form auto-closes when limit is reached
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="1"
                max="100"
                value={maxDailyOrders}
                onChange={(e) => setMaxDailyOrders(parseInt(e.target.value) || 1)}
                className="flex-1 px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={updateMaxDailyOrders}
                disabled={isUpdatingSettings || maxDailyOrders === settings?.max_daily_orders}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock3 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900">Operating Hours</h3>
                <p className="text-sm text-amber-700">
                  Philippine Time (UTC+8)
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <label className="w-20 text-sm font-medium text-amber-900">Start:</label>
                <select
                  value={operatingHoursStart}
                  onChange={(e) => setOperatingHoursStart(parseInt(e.target.value))}
                  className="flex-1 px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-3">
                <label className="w-20 text-sm font-medium text-amber-900">End:</label>
                <select
                  value={operatingHoursEnd}
                  onChange={(e) => setOperatingHoursEnd(parseInt(e.target.value))}
                  className="flex-1 px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={updateOperatingHours}
                disabled={
                  isUpdatingSettings || 
                  (operatingHoursStart === settings?.operating_hours_start && 
                   operatingHoursEnd === settings?.operating_hours_end)
                }
                className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Hours
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">{card.title}</p>
                    <p className="text-2xl font-bold text-amber-900 mt-1">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${card.bgColor}`}>
                    <Icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-amber-100">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-4">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-amber-100">
                    <th className="text-left py-3 px-4 font-semibold text-amber-900">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold text-amber-900">Order</th>
                    <th className="text-left py-3 px-4 font-semibold text-amber-900">Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold text-amber-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-amber-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-amber-50 hover:bg-amber-50 transition-colors">
                        <td className="py-3 px-4 text-amber-900">{order.name}</td>
                        <td className="py-3 px-4 text-amber-700">{order.order}</td>
                        <td className="py-3 px-4 text-amber-700">{order.quantity}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-amber-700">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-amber-600">
                        No recent orders
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}