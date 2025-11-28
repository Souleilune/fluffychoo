// src/app/track-order/page.tsx
'use client';

import { useState } from 'react';
import { Search, Package, Clock, CheckCircle, XCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface OrderData {
  order_reference: string;
  name: string;
  order: string;
  quantity: number;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function TrackOrderPage() {
  const [reference, setReference] = useState('');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reference.trim()) {
      setError('Please enter your order reference number');
      return;
    }

    setIsLoading(true);
    setError('');
    setOrderData(null);

    try {
      const response = await fetch(`/api/track-order?reference=${encodeURIComponent(reference.trim())}`);
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to fetch order details');
        return;
      }

      setOrderData(result.data);
    } catch (err) {
      console.error('Error tracking order:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-amber-600" />;
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-blue-600" />;
      case 'processing':
        return <Package className="w-6 h-6 text-purple-600" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'confirmed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your order has been received and is awaiting confirmation.';
      case 'confirmed':
        return 'Your order has been confirmed and will be processed soon.';
      case 'processing':
        return 'We are currently preparing your order.';
      case 'completed':
        return 'Your order is ready for pickup!';
      case 'cancelled':
        return 'This order has been cancelled.';
      default:
        return 'Status unknown';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-900 mb-2">Track Your Order</h1>
          <p className="text-amber-700">Enter your order reference number to check your order status</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-8 mb-6">
          <form onSubmit={handleTrackOrder} className="space-y-4">
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-amber-900 mb-2">
                Order Reference Number
              </label>
              <input
                type="text"
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                placeholder="FLC-20241128-A3K9P"
                className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-amber-900 placeholder-amber-400"
                disabled={isLoading}
              />
              <p className="text-xs text-amber-600 mt-1">
                Format: FLC-YYYYMMDD-XXXXX
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-200 hover:bg-yellow-300 text-amber-900 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Tracking...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Track Order
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Order Details */}
        {orderData && (
          <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
            {/* Status Header */}
            <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-900 mb-1">Order Status</p>
                  <div className="flex items-center gap-3">
                    <div className="bg-white/40 p-2 rounded-lg">
                      {getStatusIcon(orderData.status)}
                    </div>
                    <h2 className="text-2xl font-bold text-amber-900 capitalize">{orderData.status}</h2>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="p-6 space-y-6">
              {/* Status Description */}
              <div className={`p-4 rounded-lg border ${getStatusColor(orderData.status)}`}>
                <p className="text-sm font-medium">{getStatusDescription(orderData.status)}</p>
              </div>

              {/* Reference Number */}
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-xs text-amber-700 font-medium uppercase tracking-wide mb-1">
                  Order Reference
                </p>
                <p className="text-xl font-mono font-bold text-amber-900">
                  {orderData.order_reference}
                </p>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-amber-700 font-medium uppercase tracking-wide mb-1">
                    Customer Name
                  </p>
                  <p className="text-amber-900 font-medium">{orderData.name}</p>
                </div>

                <div>
                  <p className="text-xs text-amber-700 font-medium uppercase tracking-wide mb-1">
                    Total Amount
                  </p>
                  <p className="text-amber-900 font-medium">{formatCurrency(orderData.total_amount)}</p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs text-amber-700 font-medium uppercase tracking-wide mb-1">
                    Order Details
                  </p>
                  <p className="text-amber-900">{orderData.order}</p>
                </div>

                <div>
                  <p className="text-xs text-amber-700 font-medium uppercase tracking-wide mb-1">
                    Quantity
                  </p>
                  <p className="text-amber-900 font-medium">{orderData.quantity}</p>
                </div>

                <div>
                  <p className="text-xs text-amber-700 font-medium uppercase tracking-wide mb-1">
                    Order Date
                  </p>
                  <p className="text-amber-900 text-sm">{formatDate(orderData.created_at)}</p>
                </div>

                {orderData.updated_at !== orderData.created_at && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-amber-700 font-medium uppercase tracking-wide mb-1">
                      Last Updated
                    </p>
                    <p className="text-amber-900 text-sm">{formatDate(orderData.updated_at)}</p>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="border-t border-amber-200 pt-6">
                <h3 className="text-sm font-medium text-amber-900 mb-4">Order Timeline</h3>
                <div className="space-y-3">
                  <div className={`flex items-start gap-3 ${orderData.status !== 'pending' ? 'opacity-50' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      orderData.status === 'pending' || orderData.status === 'confirmed' || orderData.status === 'processing' || orderData.status === 'completed'
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {orderData.status === 'pending' || orderData.status === 'confirmed' || orderData.status === 'processing' || orderData.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-900">Order Placed</p>
                      <p className="text-xs text-amber-600">{formatDate(orderData.created_at)}</p>
                    </div>
                  </div>

                  <div className={`flex items-start gap-3 ${orderData.status === 'pending' ? 'opacity-50' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      orderData.status === 'confirmed' || orderData.status === 'processing' || orderData.status === 'completed'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {orderData.status === 'confirmed' || orderData.status === 'processing' || orderData.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-900">Order Confirmed</p>
                      <p className="text-xs text-amber-600">
                        {orderData.status === 'confirmed' || orderData.status === 'processing' || orderData.status === 'completed'
                          ? formatDate(orderData.updated_at)
                          : 'Pending'}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-start gap-3 ${orderData.status === 'pending' || orderData.status === 'confirmed' ? 'opacity-50' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      orderData.status === 'processing' || orderData.status === 'completed'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {orderData.status === 'processing' || orderData.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-900">Processing</p>
                      <p className="text-xs text-amber-600">
                        {orderData.status === 'processing' || orderData.status === 'completed'
                          ? formatDate(orderData.updated_at)
                          : 'Pending'}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-start gap-3 ${orderData.status !== 'completed' ? 'opacity-50' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      orderData.status === 'completed'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {orderData.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-900">Ready for Pickup</p>
                      <p className="text-xs text-amber-600">
                        {orderData.status === 'completed' ? formatDate(orderData.updated_at) : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="border-t border-amber-200 pt-6">
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Need help?</strong> If you have any questions about your order, please contact us with your order reference number.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}