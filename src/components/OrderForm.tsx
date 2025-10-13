'use client';

import { useState } from 'react';
import { X, ShoppingBag, Loader2, Upload, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { products } from '@/data/products';
import Image from 'next/image';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct?: string;
}

type Step = 1 | 2 | 3 | 4;

export default function OrderForm({ isOpen, onClose, selectedProduct }: OrderFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    email: '',
    contactNumber: '',
    order: selectedProduct || '',
    quantity: 1,
  });
  
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [orderReference, setOrderReference] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const availableProducts = products.filter(p => p.price > 0);

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      email: '',
      contactNumber: '',
      order: '',
      quantity: 1,
    });
    setPaymentProof(null);
    setPaymentProofPreview('');
    setTermsAccepted(false);
    setOrderReference('');
    setCurrentStep(1);
    setSubmitStatus({ type: null, message: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value,
    }));
  };

  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    setPaymentProof(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadPaymentProof = async (): Promise<string | null> => {
    if (!paymentProof) return null;

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', paymentProof);

      const response = await fetch('/api/upload-payment', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload payment proof');
      }

      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload payment proof');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.location && formData.contactNumber);
      case 2:
        return !!(formData.order && formData.quantity > 0);
      case 3:
        return !!paymentProof;
      case 4:
        return termsAccepted;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      alert('Please fill in all required fields');
      return;
    }
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      alert('Please accept the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Upload payment proof first
      let paymentProofUrl = null;
      if (paymentProof) {
        paymentProofUrl = await uploadPaymentProof();
        if (!paymentProofUrl) {
          throw new Error('Failed to upload payment proof');
        }
      }

      // Submit order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          paymentProofUrl,
          termsAccepted,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit order');
      }

      // Save order reference from response
      setOrderReference(data.data.order_reference);

      setSubmitStatus({
        type: 'success',
        message: 'Order submitted successfully! We\'ll contact you soon.',
      });

      // Don't auto-close - let user close manually after copying reference
      // Reset happens when they close the modal
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProductData = availableProducts.find(p => p.name === formData.order);
  const totalPrice = selectedProductData ? selectedProductData.price * formData.quantity : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all">
          {/* Header with Step Indicator */}
          <div className="rounded-t-3xl p-6" style={{ background: 'linear-gradient(to right, #fffcdb, #fef3c7)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-amber-900" />
                <h2 className="text-2xl font-bold text-amber-900">Place Your Order</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-amber-900/10 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-amber-900" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-between max-w-md mx-auto">
              {[1, 2, 3, 4].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        currentStep >= step
                          ? 'bg-amber-900 text-white'
                          : 'bg-white text-amber-900 border-2 border-amber-900/30'
                      }`}
                    >
                      {currentStep > step ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        step
                      )}
                    </div>
                    <span className="text-xs mt-1 text-amber-900 font-medium">
                      {step === 1 && 'Info'}
                      {step === 2 && 'Review'}
                      {step === 3 && 'Payment'}
                      {step === 4 && 'Terms'}
                    </span>
                  </div>
                  {index < 3 && (
                    <div
                      className={`h-0.5 w-12 mx-2 transition-all ${
                        currentStep > step ? 'bg-amber-900' : 'bg-amber-900/30'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {/* Step 1: Customer Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-900 mb-4">Customer Information</h3>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-amber-900 mb-1">
                    Full Name <span className="text-red-500">*</span>
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

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-amber-900 mb-1">
                    Delivery Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                    placeholder="123 Street, Barangay, City"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-amber-900 mb-1">
                    Email Address (Optional)
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
              </div>
            )}

            {/* Step 2: Order Review */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-900 mb-4">Review Your Order</h3>
                
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

                {/* Order Summary */}
                {selectedProductData && (
                  <div className="mt-6 p-6 bg-amber-50 border-2 border-amber-200 rounded-xl">
                    <h4 className="font-semibold text-amber-900 mb-4">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-amber-800">Product:</span>
                        <span className="font-medium text-amber-900">{selectedProductData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-800">Price per unit:</span>
                        <span className="font-medium text-amber-900">₱{selectedProductData.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-800">Quantity:</span>
                        <span className="font-medium text-amber-900">{formData.quantity}</span>
                      </div>
                      <div className="border-t border-amber-300 pt-2 mt-2 flex justify-between">
                        <span className="font-semibold text-amber-900">Total:</span>
                        <span className="font-bold text-amber-900 text-lg">₱{totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-900 leading-relaxed">
                    <span className="font-semibold">📦 Delivery Information:</span><br />
                    We deliver via Lalamove (pickup not available). You'll book and pay for delivery separately. Currently serving Metro Manila only.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-900 mb-4">Payment</h3>
                
                {/* QR Code Display */}
                <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl text-center">
                  <h4 className="font-semibold text-amber-900 mb-3">Scan to Pay</h4>
                  <div className="inline-block bg-white p-4 rounded-lg shadow-md">
                    <div className="relative w-64 h-64 mx-auto">
                      <Image
                        src="/qr-payment.png"
                        alt="Payment QR Code"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-amber-800">
                    <span className="font-semibold">Total Amount: ₱{totalPrice.toFixed(2)}</span>
                  </p>
                  <p className="mt-2 text-xs text-amber-600">
                    Please scan the QR code above to complete your payment
                  </p>
                </div>

                {/* Upload Proof of Payment */}
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Upload Proof of Payment <span className="text-red-500">*</span>
                  </label>
                  
                  {!paymentProofPreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-amber-300 rounded-xl cursor-pointer bg-amber-50 hover:bg-amber-100 transition-colors">
                      <Upload className="w-10 h-10 text-amber-600 mb-2" />
                      <span className="text-sm text-amber-700 font-medium">Click to upload</span>
                      <span className="text-xs text-amber-600 mt-1">PNG, JPG, WEBP (max 5MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePaymentProofChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      <div className="relative w-full h-60 border-2 border-amber-200 rounded-xl overflow-hidden">
                        <Image
                          src={paymentProofPreview}
                          alt="Payment proof preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentProof(null);
                          setPaymentProofPreview('');
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Terms and Conditions */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-900 mb-4">Terms and Conditions</h3>
                
                <div className="max-h-80 overflow-y-auto p-6 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 space-y-3">
                  <h4 className="font-semibold text-gray-900">1. Order Processing</h4>
                  <p>Orders are processed upon confirmation of payment. We aim to fulfill all orders within 1-3 business days.</p>
                  
                  <h4 className="font-semibold text-gray-900">2. Delivery</h4>
                  <p>Delivery is handled via third-party services (Lalamove). Customers are responsible for booking and paying delivery fees separately. We currently serve Metro Manila only.</p>
                  
                  <h4 className="font-semibold text-gray-900">3. Product Quality</h4>
                  <p>Our mochi brownies are baked fresh. We guarantee quality at the time of handover. Proper storage is the customer's responsibility.</p>
                  
                  <h4 className="font-semibold text-gray-900">4. Cancellation Policy</h4>
                  <p>Orders can be cancelled within 2 hours of placement for a full refund. After production has started, no refunds are available.</p>
                  
                  <h4 className="font-semibold text-gray-900">5. Payment</h4>
                  <p>Payment must be completed before order processing. Accepted payment methods are shown via QR code. Screenshots of payment confirmation must be uploaded.</p>
                  
                  <h4 className="font-semibold text-gray-900">6. Privacy</h4>
                  <p>We collect personal information only for order fulfillment and will not share it with third parties.</p>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-5 h-5 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="terms" className="text-sm text-amber-900 cursor-pointer">
                    <span className="font-semibold">I agree to the terms and conditions</span>
                    <span className="text-red-500">*</span>
                    <p className="text-amber-700 mt-1">
                      By checking this box, you confirm that you have read and agree to our terms and conditions.
                    </p>
                  </label>
                </div>
              </div>
            )}

            {/* Status Message */}
            {submitStatus.type && (
              <div
                className={`mt-4 p-4 rounded-xl text-sm ${
                  submitStatus.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {submitStatus.type === 'success' && orderReference ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold">{submitStatus.message}</span>
                    </div>
                    <div className="p-3 bg-white border border-green-300 rounded-lg">
                      <p className="text-xs text-green-700 font-medium mb-1">Your Order Reference:</p>
                      <p className="text-lg font-bold text-green-900 font-mono tracking-wider">
                        {orderReference}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Please save this reference number for your records
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  submitStatus.message
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            {!orderReference && (
              <div className="flex gap-3 mt-6">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3 px-4 border-2 border-amber-900 text-amber-900 font-semibold rounded-xl hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>
                )}
                
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-3 px-4 text-amber-900 font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || isUploading}
                    className="flex-1 py-3 px-4 text-amber-900 font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
                  >
                    {isSubmitting || isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isUploading ? 'Uploading...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        Place Order
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}