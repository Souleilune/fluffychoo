'use client';

import { useState } from 'react';
import { X, ShoppingBag, Loader2 } from 'lucide-react';
import { products } from '@/data/products';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct?: string;
}

export default function OrderForm({ isOpen, onClose, selectedProduct }: OrderFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    email: '',
    contactNumber: '',
    order: selectedProduct || '',
    quantity: 1,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit order');
      }

      setSubmitStatus({
        type: 'success',
        message: 'Order submitted successfully! We\'ll contact you soon.',
      });

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          location: '',
          email: '',
          contactNumber: '',
          order: '',
          quantity: 1,
        });
        setSubmitStatus({ type: null, message: '' });
        onClose();
      }, 2000);
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value,
    }));
  };

  if (!isOpen) return null;

  // Get available products (filter out "Soon" products)
  const availableProducts = products.filter(p => p.price > 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all">
          {/* Header */}
          <div className="rounded-t-3xl p-6" style={{ background: 'linear-gradient(to right, #fffcdb, #fef3c7)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-amber-900" />
                <h2 className="text-2xl font-bold text-amber-900">Place Your Order</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-amber-900/10 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-amber-900" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-amber-900 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                placeholder="Juan Dela Cruz"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-amber-900 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                placeholder="Manila, Philippines"
              />
            </div>

            {/* Email (Optional) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-amber-900 mb-1">
                Email <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                placeholder="juan@example.com"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-amber-900 mb-1">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                placeholder="+63 912 345 6789"
              />
            </div>

            {/* Order */}
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-amber-900 mb-1">
                Select Product <span className="text-red-500">*</span>
              </label>
              <select
                id="order"
                name="order"
                value={formData.order}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all bg-white"
              >
                <option value="">Choose a product...</option>
                {availableProducts.map(product => (
                  <option key={product.id} value={product.name}>
                    {product.name} - ₱{product.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-amber-900 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="1"
                max="100"
                className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
              />
            </div>

            {/* Delivery Notice */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-900 leading-relaxed">
                <span className="font-semibold"> Delivery Information:</span><br />
                We deliver via Lalamove (pickup not available). You'll book and pay for delivery separately. Currently serving Metro Manila only.
              </p>
            </div>

            {/* Status Message */}
            {submitStatus.type && (
              <div
                className={`p-4 rounded-xl text-sm ${
                  submitStatus.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {submitStatus.message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 text-amber-900 font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  Place Order
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}