'use client';

import { useState, useEffect } from 'react';
import { X, ShoppingBag, Loader2, Upload, CheckCircle, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
  stock: number;
  is_active: boolean;
}

type Step = 1 | 2 | 3 | 4;

export default function OrderForm({ isOpen, onClose, selectedProduct }: OrderFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
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

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      setProductsError(null);
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch products');
        }
        
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProductsError(error instanceof Error ? error.message : 'Failed to load products');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        order: selectedProduct,
      }));
    }
  }, [selectedProduct]);

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
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      setPaymentProof(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPaymentProof = async (): Promise<string | null> => {
    if (!paymentProof) return null;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', paymentProof);

      const response = await fetch('/api/upload-payment', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      return data.url;
    } catch (error) {
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
      let paymentProofUrl = null;
      if (paymentProof) {
        paymentProofUrl = await uploadPaymentProof();
        if (!paymentProofUrl) {
          throw new Error('Failed to upload payment proof');
        }
      }

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

      setOrderReference(data.data.order_reference);

      setSubmitStatus({
        type: 'success',
        message: 'Order submitted successfully! We\'ll contact you soon.',
      });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProductData = products.find(p => p.name === formData.order);
  const totalPrice = selectedProductData ? selectedProductData.price * formData.quantity : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all">
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
                      {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                    </div>
                    <span className="text-xs mt-2 text-amber-900 font-medium">
                      {step === 1 ? 'Info' : step === 2 ? 'Order' : step === 3 ? 'Payment' : 'Review'}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={`w-12 h-0.5 mb-6 transition-colors ${
                      currentStep > step ? 'bg-amber-900' : 'bg-amber-900/30'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-8">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-amber-900 mb-4">Your Information</h3>
                
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
                    placeholder="123 Main St, City"
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

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-amber-900 mb-1">
                    Email (Optional)
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
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-amber-900 mb-4">Review Your Order</h3>
                
                {isLoadingProducts ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-2" />
                    <p className="text-amber-700">Loading products...</p>
                  </div>
                ) : productsError ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                    <p className="text-red-600">{productsError}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                    >
                      Retry
                    </button>
                  </div>
                ) : products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
                    <p className="text-amber-700">No products available at the moment</p>
                  </div>
                ) : (
                  <>
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
                        {products.map(product => (
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
                        max={selectedProductData?.stock || 100}
                        className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                      />
                      {selectedProductData && (
                        <p className="text-sm text-amber-600 mt-1">
                          Available stock: {selectedProductData.stock}
                        </p>
                      )}
                    </div>

                    {selectedProductData && (
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-amber-900 font-medium">Product:</span>
                          <span className="text-amber-900">{selectedProductData.name}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-amber-900 font-medium">Price per unit:</span>
                          <span className="text-amber-900">₱{selectedProductData.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-amber-900 font-medium">Quantity:</span>
                          <span className="text-amber-900">{formData.quantity}</span>
                        </div>
                        <div className="border-t border-amber-300 pt-2 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-amber-900 font-bold text-lg">Total:</span>
                            <span className="text-amber-900 font-bold text-lg">₱{totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-amber-900 mb-4">Payment</h3>
                
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

            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-amber-900 mb-4">Review & Confirm</h3>
                
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-3">
                  <div>
                    <span className="text-sm font-medium text-amber-900">Name:</span>
                    <p className="text-amber-700">{formData.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-amber-900">Location:</span>
                    <p className="text-amber-700">{formData.location}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-amber-900">Contact:</span>
                    <p className="text-amber-700">{formData.contactNumber}</p>
                  </div>
                  {formData.email && (
                    <div>
                      <span className="text-sm font-medium text-amber-900">Email:</span>
                      <p className="text-amber-700">{formData.email}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-amber-900">Order:</span>
                    <p className="text-amber-700">{formData.order} × {formData.quantity}</p>
                  </div>
                  <div className="border-t border-amber-300 pt-2">
                    <span className="text-sm font-medium text-amber-900">Total Amount:</span>
                    <p className="text-xl font-bold text-amber-900">₱{totalPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="terms" className="text-sm text-amber-700">
                    I agree to the terms and conditions and confirm that all information provided is accurate.
                  </label>
                </div>

                {submitStatus.type && (
                  <div className={`p-4 rounded-xl ${
                    submitStatus.type === 'success' 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-start space-x-2">
                      {submitStatus.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm ${
                          submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {submitStatus.message}
                        </p>
                        {orderReference && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-green-800">Order Reference:</p>
                            <p className="text-lg font-mono font-bold text-green-900">{orderReference}</p>
                            <p className="text-xs text-green-700 mt-1">
                              Please save this reference number for tracking your order.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-amber-200">
              {currentStep > 1 && !submitStatus.type && (
                <button
                  onClick={handleBack}
                  className="flex items-center space-x-2 px-6 py-2.5 text-amber-900 font-semibold rounded-xl border-2 border-amber-200 hover:bg-amber-50 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
              )}

              {currentStep < 4 && !isLoadingProducts && !productsError ? (
                <button
                  onClick={handleNext}
                  disabled={!validateStep(currentStep)}
                  className="ml-auto flex items-center space-x-2 px-6 py-2.5 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 disabled:bg-amber-300 disabled:cursor-not-allowed transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : currentStep === 4 && !submitStatus.type ? (
                <button
                  onClick={handleSubmit}
                  disabled={!termsAccepted || isSubmitting || isUploading}
                  className="ml-auto flex items-center space-x-2 px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Submit Order</span>
                    </>
                  )}
                </button>
              ) : submitStatus.type === 'success' ? (
                <button
                  onClick={handleClose}
                  className="ml-auto flex items-center space-x-2 px-6 py-2.5 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-all"
                >
                  <span>Close</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}