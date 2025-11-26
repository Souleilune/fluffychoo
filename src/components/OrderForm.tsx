'use client';

import { useState, useEffect } from 'react';
import { X, ShoppingBag, Loader2, Upload, CheckCircle, ChevronRight, ChevronLeft, AlertCircle, Clock, Trash2, Plus } from 'lucide-react';
import Image from 'next/image';

// Extend Window interface for grecaptcha
declare global {
  interface Window {
    grecaptcha?: {
      render: (container: string, params: { sitekey: string; callback: string }) => void;
      reset: () => void;
    };
    onCaptchaSuccess?: (token: string) => void;
  }
}

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  discount_price?: number | null;
  description: string | null;
  image: string | null;
  stock: number;
  is_active: boolean;
}

interface ProductSize {
  id: string;
  size_name: string;
  price: number;
  discount_price?: number | null;
  display_order: number;
}

interface OrderItem {
  productId: string;
  productName: string;
  sizeId: string;
  sizeName: string;
  price: number;
  discount_price?: number | null;
  quantity: number;
}



type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function OrderForm({ isOpen, onClose, selectedProduct }: OrderFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [isOrderFormEnabled, setIsOrderFormEnabled] = useState(true);
  const [unavailabilityMessage, setUnavailabilityMessage] = useState<string>('');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    location: '',
    email: '',
    contactNumber: '',
  });
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  
  const [deliveryPolicyAccepted, setDeliveryPolicyAccepted] = useState(false);
  const [courierCheckbox, setCourierCheckbox] = useState(false);
  const [sundayOnlyCheckbox, setSundayOnlyCheckbox] = useState(false);
  const [courierBookingCheckbox, setCourierBookingCheckbox] = useState(false);
  const [deliveryDetailsCheckbox, setDeliveryDetailsCheckbox] = useState(false);
  const [noCancellationCheckbox, setNoCancellationCheckbox] = useState(false);
  const [productSizes, setProductSizes] = useState<ProductSize[]>([]);
  const [selectedSizeId, setSelectedSizeId] = useState('');
  const [isLoadingSizes, setIsLoadingSizes] = useState(false);
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [orderReference, setOrderReference] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  useEffect(() => {
    if (isOpen) {
      checkOrderFormAvailability();
      fetchProducts();
      
      // Load reCAPTCHA script
      if (!document.querySelector('script[src*="recaptcha"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedProduct && products.length > 0) {
      const product = products.find(p => p.name === selectedProduct);
      if (product) {
        setSelectedProductId(product.id);
      }
    }
  }, [selectedProduct, products]);

  // Add after the existing useEffect for selectedProduct
useEffect(() => {
  if (selectedProductId) {
    fetchProductSizes(selectedProductId);
  } else {
    setProductSizes([]);
    setSelectedSizeId('');
  }
}, [selectedProductId]);

  const checkOrderFormAvailability = async () => {
  setIsCheckingAvailability(true);
  try {
    const response = await fetch('/api/settings/check-availability');
    
    // Check if response is OK and is JSON
    if (!response.ok) {
      console.error('API returned error:', response.status);
      setIsOrderFormEnabled(true);
      setUnavailabilityMessage('');
      return;
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Response is not JSON');
      setIsOrderFormEnabled(true);
      setUnavailabilityMessage('');
      return;
    }
    
    const data = await response.json();
    if (data.success && data.data) {
      const { is_available, message } = data.data;
      setIsOrderFormEnabled(is_available);
      setUnavailabilityMessage(message || '');
    }
  } catch (error) {
    console.error('Failed to check order form availability:', error);
    setIsOrderFormEnabled(true);
    setUnavailabilityMessage('');
  } finally {
    setIsCheckingAvailability(false);
  }
};

const fetchProductSizes = async (productId: string) => {
  if (!productId) {
    setProductSizes([]);
    return;
  }

  setIsLoadingSizes(true);
  try {
    const response = await fetch(`/api/products/sizes?product_id=${productId}`);
    const data = await response.json();
    
    if (data.success && Array.isArray(data.data)) {
      setProductSizes(data.data);
      // Auto-select first size if available
      if (data.data.length > 0) {
        setSelectedSizeId(data.data[0].id);
      }
    } else {
      setProductSizes([]);
    }
  } catch (error) {
    console.error('Failed to fetch product sizes:', error);
    setProductSizes([]);
  } finally {
    setIsLoadingSizes(false);
  }
};

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

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      location: '',
      email: '',
      contactNumber: '',
    });
    setOrderItems([]);
    setSelectedProductId('');
    setSelectedQuantity(1);
    setProductSizes([]);
    setSelectedSizeId(''); 
    setDeliveryPolicyAccepted(false);
    setCourierCheckbox(false);
    setSundayOnlyCheckbox(false);
    setCourierBookingCheckbox(false);
    setDeliveryDetailsCheckbox(false);
    setNoCancellationCheckbox(false);
    setPaymentProof(null);
    setPaymentProofPreview('');
    setCaptchaToken(null);
    setOrderReference('');
    setCurrentStep(1);
    setSubmitStatus({ type: null, message: '' });
    
    // Reset reCAPTCHA
    if (typeof window !== 'undefined' && 
      window.grecaptcha && 
      typeof window.grecaptcha.reset === 'function') {
    const captchaContainer = document.getElementById('recaptcha-container');
    // Only reset if the container exists and has children (meaning reCAPTCHA was rendered)
    if (captchaContainer && captchaContainer.childNodes.length > 0) {
      try {
        window.grecaptcha.reset();
      } catch (error) {
        // Silently fail - reCAPTCHA might not be initialized yet
        console.log('reCAPTCHA reset skipped:', error);
      }
    }
  }
};

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddProduct = () => {
  const product = products.find(p => p.id === selectedProductId);
  const size = productSizes.find(s => s.id === selectedSizeId);
  
  if (!product || !size) return;

  // Create unique key combining product and size
  const itemKey = `${product.id}-${size.id}`;
  const existingItemIndex = orderItems.findIndex(
    item => item.productId === product.id && item.sizeId === size.id
  );
  
  if (existingItemIndex !== -1) {
    // Product + Size combo exists, update quantity
    const updatedItems = [...orderItems];
    updatedItems[existingItemIndex].quantity += selectedQuantity;
    setOrderItems(updatedItems);
  } else {
    // New product + size combo, add new item
    setOrderItems([...orderItems, {
      productId: product.id,
      productName: product.name,
      sizeId: size.id,
      sizeName: size.size_name,
      price: size.price,
      discount_price: size.discount_price,
      quantity: selectedQuantity,
    }]);
  }

  setSelectedProductId('');
  setSelectedQuantity(1);
  setProductSizes([]);
  setSelectedSizeId('');
};

  const handleRemoveProduct = (productId: string, sizeId: string) => {
  setOrderItems(orderItems.filter(
    item => !(item.productId === productId && item.sizeId === sizeId)
  ));
};

 const handleUpdateQuantity = (productId: string, sizeId: string, newQuantity: number) => {
  if (newQuantity < 1) return;

  setOrderItems(orderItems.map(item => 
    (item.productId === productId && item.sizeId === sizeId)
      ? { ...item, quantity: newQuantity }
      : item
  ));
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
        return !!(formData.firstName && formData.lastName && formData.location && formData.contactNumber);
      case 2:
        return orderItems.length > 0;
      case 3:
        return deliveryPolicyAccepted;
      case 4:
        return !!paymentProof;
      case 5:
        return !!captchaToken;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      alert('Please fill in all required fields');
      return;
    }
    if (currentStep < 6) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  // CAPTCHA callback function
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.onCaptchaSuccess = (token: string) => {
        setCaptchaToken(token);
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.onCaptchaSuccess;
      }
    };
  }, []);

  // Render CAPTCHA when Step 5 is reached
  useEffect(() => {
    if (currentStep === 5 && typeof window !== 'undefined' && window.grecaptcha) {
      // Wait a bit for DOM to be ready, then render CAPTCHA
      const timer = setTimeout(() => {
        const captchaContainer = document.getElementById('recaptcha-container');
        if (captchaContainer && captchaContainer.childNodes.length === 0 && window.grecaptcha) {
          try {
            window.grecaptcha.render('recaptcha-container', {
              sitekey: '6LdIZe8rAAAAALGwMeXqt-Pk4t4NY3Aydx0I6qQK',
              callback: 'onCaptchaSuccess',
            });
          } catch (error) {
            console.error('CAPTCHA render error:', error);
          }
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      alert('Please complete all required checkboxes and verify the CAPTCHA');
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

      const orderString = orderItems.map(item => 
        `${item.productName} (${item.sizeName}) × ${item.quantity}`
      ).join(', ');

      const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);

      const fullName = `${formData.firstName} ${formData.lastName}`;

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          location: formData.location,
          email: formData.email,
          contactNumber: formData.contactNumber,
          order: orderString,
          quantity: totalQuantity,
          orderItems: orderItems,
          paymentProofUrl,
          termsAccepted: true,
          captchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit order');
      }

      setOrderReference(data.data.order_reference);

      setSubmitStatus({
        type: 'success',
        message: 'Order submitted successfully!',
      });
      
      setCurrentStep(6);
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong',
      });
      
      // Reset reCAPTCHA on error
      if (typeof window !== 'undefined' && 
      window.grecaptcha && 
      typeof window.grecaptcha.reset === 'function') {
    const captchaContainer = document.getElementById('recaptcha-container');
    // Only reset if the container exists and has children (meaning reCAPTCHA was rendered)
    if (captchaContainer && captchaContainer.childNodes.length > 0) {
      try {
        window.grecaptcha.reset();
        setCaptchaToken(null);
      } catch (error) {
        // Silently fail - reCAPTCHA might not be initialized
        console.log('reCAPTCHA reset skipped:', error);
      }
    }
  }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = orderItems.reduce((sum, item) => {
  const effectivePrice = item.discount_price !== null && item.discount_price !== undefined 
    ? item.discount_price 
    : item.price;
  return sum + (effectivePrice * item.quantity);
}, 0);

  if (!isOpen) return null;

  if (isCheckingAvailability) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
            <p className="text-center text-amber-900 mt-4">Checking availability...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isOrderFormEnabled) {
    return (
       <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
            <div className="rounded-t-3xl p-6" style={{ background: 'linear-gradient(to right, #fffcdb, #fef3c7)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-amber-900" />
                  <h2 className="text-xl font-bold text-amber-900">Oops!</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-amber-900/10 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-amber-900" />
                </button>
              </div>
            </div>

            <div className="p-6 text-center">
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-amber-900 mb-2">
                  Order Form Currently Disabled
                </h3>
                <p className="text-amber-700 text-sm">
                  {unavailabilityMessage || "We're temporarily not accepting new orders. Please check back later or contact us directly for assistance."}
                </p>
              </div>
              
              <button
                onClick={handleClose}
                className="w-full px-6 py-3 text-amber-900 font-semibold rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={handleClose}
    />

      <div className="flex min-h-full items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
          <div className="rounded-t-3xl p-4 sm:p-6" style={{ background: 'linear-gradient(to right, #fffcdb, #fef3c7)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-amber-900" />
                <h2 className="text-xl sm:text-2xl font-bold text-amber-900">Place Your Order</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-amber-900/10 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-amber-900" />
              </button>
            </div>

            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[1, 2, 3, 4, 5, 6].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all ${
                        currentStep >= step
                          ? 'bg-amber-900 text-white'
                          : 'bg-white text-amber-900 border-2 border-amber-900/30'
                      }`}
                    >
                      {currentStep > step ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : step}
                    </div>
                    <span className="text-[9px] sm:text-[10px] mt-1 text-amber-900 font-medium text-center">
                      {step === 1 ? 'Info' : step === 2 ? 'Order' : step === 3 ? 'Policy' : step === 4 ? 'Payment' : step === 5 ? 'Review' : 'Done'}
                    </span>
                  </div>
                  {index < 5 && (
                    <div className={`w-6 sm:w-10 h-0.5 mb-4 sm:mb-5 transition-colors ${
                      currentStep > step ? 'bg-amber-900' : 'bg-amber-900/30'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-amber-900 mb-4">Your Information</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-amber-900 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                      placeholder="Juan"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-amber-900 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                      placeholder="Dela Cruz"
                    />
                  </div>
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
                    placeholder="Barangay, City, Province"
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
                <div className="text-sm text-amber-700 italic mt-2">
                  In compliance with the Data Privacy Act of 2012, all personal information you provide will be kept confidential and used solely for order processing.
                </div>
              </div>
              
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-amber-900 mb-4">Place Your Order</h3>
                
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
                    <div className="space-y-3">
                      <div>
                        <>
  {/* Product Dropdown */}
  {/* Product Dropdown */}
<div>
  <label htmlFor="product" className="block text-sm font-medium text-amber-900 mb-1">
    Select Product
  </label>
  <div className="relative">
    <div
      onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
      className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all bg-white cursor-pointer flex items-center justify-between"
    >
      <span className="text-amber-900">
        {selectedProductId 
          ? products.find(p => p.id === selectedProductId)?.name || 'Choose a product...'
          : 'Choose a product...'}
      </span>
      <ChevronRight className={`w-5 h-5 text-amber-600 transition-transform ${isProductDropdownOpen ? 'rotate-90' : ''}`} />
    </div>
    
    {isProductDropdownOpen && (
      <div className="absolute z-10 w-full mt-2 bg-white border border-amber-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
        {products
          .filter(product => product.price !== null && product.price > 0)
          .map(product => {
            const isSoldOut = product.stock === 0;
            return (
              <div
                key={product.id}
                onClick={() => {
                  if (!isSoldOut) {
                    setSelectedProductId(product.id);
                    setIsProductDropdownOpen(false);
                  }
                }}
                className={`px-4 py-3 border-b border-amber-100 last:border-b-0 transition-colors ${
                  isSoldOut 
                    ? 'bg-gray-50 cursor-not-allowed opacity-60' 
                    : 'hover:bg-amber-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-amber-900">{product.name}</div>
                    {isSoldOut && (
                      <div className="text-xs text-red-600 font-medium mt-1">Sold Out</div>
                    )}
                  </div>
                  {isSoldOut && (
                    <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full font-medium">
                      SOLD OUT
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    )}
  </div>
</div>

  {/* Size Dropdown - Only show when product is selected */}
  {selectedProductId && (
    <div>
      <label htmlFor="size" className="block text-sm font-medium text-amber-900 mb-1">
        Select Size
      </label>
      {isLoadingSizes ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
        </div>
      ) : productSizes.length === 0 ? (
        <div className="text-sm text-amber-600 py-2">No sizes available for this product</div>
      ) : (
        <div className="relative">
          <div
            onClick={() => setIsSizeDropdownOpen(!isSizeDropdownOpen)}
            className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all bg-white cursor-pointer flex items-center justify-between"
          >
            <span className="text-amber-900">
              {selectedSizeId 
                ? productSizes.find(s => s.id === selectedSizeId)?.size_name || 'Choose a size...'
                : 'Choose a size...'}
            </span>
            <ChevronRight className={`w-5 h-5 text-amber-600 transition-transform ${isSizeDropdownOpen ? 'rotate-90' : ''}`} />
          </div>
          
          {isSizeDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-amber-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {productSizes.map(size => (
                <div
                  key={size.id}
                  onClick={() => {
                    setSelectedSizeId(size.id);
                    setIsSizeDropdownOpen(false);
                  }}
                  className="px-4 py-3 hover:bg-amber-50 cursor-pointer transition-colors border-b border-amber-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-900">{size.size_name}</span>
                    <div className="flex items-center gap-2">
                      {size.discount_price !== null && size.discount_price !== undefined ? (
                        <>
                          <span className="text-xs text-gray-500 line-through">
                            ₱{size.price.toFixed(2)}
                          </span>
                          <span className="text-sm font-bold text-amber-900">
                            ₱{size.discount_price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-amber-900">
                          ₱{size.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )}

  {/* Quantity Input */}
  
</>
                      </div>

                      <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-amber-900 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          value={selectedQuantity}
                          onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                          required
                          min="1"
                          className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                        />
                        
                      </div>

                      <button
                        onClick={handleAddProduct}
                        disabled={!selectedProductId}
                        className="w-full px-4 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add to Order</span>
                      </button>
                    </div>

                    {orderItems.length > 0 && (
                      <div className="space-y-3 mt-6">
                        <h4 className="font-semibold text-amber-900">Review Your Order</h4>
                        <div className="space-y-2">
                          {orderItems.map((item) => (
  <div key={`${item.productId}-${item.sizeId}`} className="bg-amber-50 rounded-xl p-4 border border-amber-200">
    <div className="flex items-center justify-between mb-2">
      <div>
        <span className="font-semibold text-amber-900">{item.productName}</span>
        <span className="text-sm text-amber-700 block">Size: {item.sizeName}</span>
      </div>
      <button
        onClick={() => handleRemoveProduct(item.productId, item.sizeId)}
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
    <div className="flex items-center justify-between text-sm text-amber-700">
      <span>Quantity: {item.quantity}</span>
      <div className="flex flex-col items-end">
        {item.discount_price !== null && item.discount_price !== undefined ? (
          <>
            <span className="text-xs text-gray-500 line-through">
              ₱{item.price.toFixed(2)}
            </span>
            <span className="text-sm font-bold text-amber-900">
              ₱{(item.discount_price * item.quantity).toFixed(2)}
            </span>
          </>
        ) : (
          <span className="text-sm font-bold text-amber-900">
            ₱{(item.price * item.quantity).toFixed(2)}
          </span>
        )}
      </div>
    </div>
  </div>
))}
                        </div>
                        
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-amber-900 font-medium">Quantity:</span>
                            <span className="text-amber-900">{orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                          </div>
                          <div className="border-t border-amber-300 pt-2 mt-2">
                           <div className="flex items-center justify-between text-lg font-bold text-amber-900 pt-3 border-t border-amber-200">
                            <span>Total:</span>
                            <span>
                              ₱{orderItems.reduce((sum, item) => {
                                const effectivePrice = item.discount_price !== null && item.discount_price !== undefined 
                                  ? item.discount_price 
                                  : item.price;
                                return sum + (effectivePrice * item.quantity);
                              }, 0).toFixed(2)}
                            </span>
                          </div>
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
                <h3 className="text-lg sm:text-xl font-semibold text-amber-900 mb-4">Delivery Policy</h3>
                
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-4">
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-2">Delivery Policy</h4>
                    <p className="text-sm text-amber-800">
                      We bake and pack <strong>every Sunday only</strong>. Once your order is ready, we will text you so you can book your own courier 
                      <strong> (Grab/Lalamove/Angkas Padala/Moveit etc.)</strong> for pickup.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-amber-900 mb-2">Pickup Location:</h4>
                    <p className="text-sm text-amber-800">
                      Pickup address will be shared via SMS once your order is ready.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-amber-900 mb-2">Important Reminders:</h4>
                    <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                      <li>We <strong>only deliver within Metro Manila</strong></li>
                      <li><strong>Customer books and pays for courier delivery</strong></li>
                      <li>Pickup and delivery are <strong>Sunday only</strong></li>
                      <li>Delivery fee is <strong>not included</strong> in your order total</li>
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-amber-300">
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="deliveryPolicy"
                        checked={deliveryPolicyAccepted}
                        onChange={(e) => setDeliveryPolicyAccepted(e.target.checked)}
                        className="mt-1 w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                      />
                      <label htmlFor="deliveryPolicy" className="text-sm text-amber-900 font-medium">
                        I understand that I will arrange and pay for my own courier for delivery.
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-amber-900 mb-4">Payment</h3>
                
                <div className="p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl text-center">
                  <h4 className="font-semibold text-amber-900 mb-3">Scan to Pay</h4>
                  <div className="inline-block bg-white p-3 sm:p-4 rounded-lg shadow-md max-w-full">
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto">
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
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-amber-300 rounded-xl cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 text-amber-400 mb-3" />
                        <p className="mb-2 text-sm text-amber-700">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-amber-600">PNG, JPG, or JPEG (MAX. 5MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePaymentProofChange}
                      />
                    </label>
                  ) : (
                    <div className="relative border-2 border-amber-300 rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={paymentProofPreview}
                        alt="Payment proof preview"
                        className="w-full h-64 object-contain bg-amber-50"
                      />
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

            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-amber-900 mb-4">Confirm Your Order</h3>
                
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-3">
                  <div>
                    <span className="text-sm font-medium text-amber-900">Full Name:</span>
                    <p className="text-amber-700">{formData.firstName} {formData.lastName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-amber-900">Location:</span>
                    <p className="text-amber-700">{formData.location}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-amber-900">Contact Number:</span>
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
                    <div className="mt-1 space-y-1">
                      {orderItems.map((item) => (
                        <p key={`${item.productId}-${item.sizeId}`} className="text-amber-700">
                          {item.productName} ({item.sizeName}) × {item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-amber-300 pt-2">
                    <span className="text-sm font-medium text-amber-900">Total Amount:</span>
                    <p className="text-xl font-bold text-amber-900">₱{totalPrice.toFixed(2)}</p>
                  </div>
                </div>

                

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <h4 className="font-semibold text-amber-900 mb-3">Security Verification</h4>
                  <div className="flex justify-center">
                    <div id="recaptcha-container"></div>
                  </div>
                  {!captchaToken && (
                    <p className="text-xs text-amber-600 text-center mt-2">
                      Please complete the CAPTCHA verification above
                    </p>
                  )}
                  {captchaToken && (
                    <p className="text-xs text-green-600 text-center mt-2 flex items-center justify-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      CAPTCHA verified successfully
                    </p>
                  )}
                </div>

                {submitStatus.type === 'error' && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{submitStatus.message}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6 text-center py-8">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-amber-900 mb-3">Thank you for your order!</h3>
                  <p className="text-amber-800 mb-6">We&apos;re excited to bake for you!</p>
                  
                  <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 text-left space-y-3">
                    {orderReference && (
                      <div>
                        <p className="text-sm font-medium text-amber-900 mb-1">Order Reference:</p>
                        <p className="text-2xl font-mono font-bold text-amber-900">{orderReference}</p>
                        <p className="text-xs text-amber-700 mt-1">
                          Please save this reference number for tracking your order.
                        </p>
                      </div>
                    )}
                    
                    <div className="border-t border-amber-300 pt-3">
                      <p className="text-sm text-amber-800 leading-relaxed">
                        You&apos;ll receive a confirmation text soon. On Sunday, we&apos;ll send another message once your order is ready for pickup so you can book your courier and provide their reference number.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="px-8 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-all"
                >
                  Close
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 sm:mt-8 pt-6 border-t border-amber-200">
              {currentStep > 1 && currentStep < 6 && (
                <button
                  onClick={handleBack}
                  className="flex items-center justify-center space-x-2 px-6 py-2.5 text-amber-900 font-semibold rounded-xl border-2 border-amber-200 hover:bg-amber-50 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
              )}

              {currentStep < 5 && !isLoadingProducts && !productsError ? (
                <button
                  onClick={handleNext}
                  disabled={!validateStep(currentStep)}
                  className="ml-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 disabled:bg-amber-300 disabled:cursor-not-allowed transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : currentStep === 5 ? (
                <button
                  onClick={handleSubmit}
                  disabled={!validateStep(5) || isSubmitting || isUploading}
                  className="ml-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
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
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}