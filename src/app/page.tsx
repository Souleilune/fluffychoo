'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Sparkles, Wheat, Cookie, Loader2, Package, Clock, Mail, Facebook, Instagram, Leaf, ChevronDown, MessageSquare, Send, X, ShoppingBag } from 'lucide-react';
import OrderForm from '@/components/OrderForm';
import ProductImageCarousel from '@/components/ProductImageCarousel';
import ProductDetailCarousel from '@/components/ProductDetailCarousel';

interface Product {
  id: string;
  name: string;
  price: number | null;
  discount_price?: number | null;  // ADD THIS LINE
  description: string | null;
  image: string | null;
  stock: number;
  is_active: boolean;
}

const faqData = [
  {
    question: "What is Fluffychoo?",
    answer: "Fluffychoo is a tiny weekend dessert shop that makes soft treats like mochi brownies, banana pudding, and other dreamy sweets. Everything's made fresh in small batches."
  },
  {
    question: "When do you accept orders?",
    answer: "Pre-orders are open from Monday to Friday, 6AM to 9PM, or until we reach our weekly limit, whichever comes first."
  },
  {
    question: "Where are you located?",
    answer: "We're a home-based micro dessert shop in Paco, Manila."
  },
  {
    question: "Do you deliver?",
    answer: "Yes! Customers can book delivery through Lalamove or any courier of their choice. We'll make sure all orders are packed safely."
  },
  {
    question: "Why do you only operate on weekends / Why do you only do small batches?",
    answer: "Fluffychoo is a microbakery. Operating only on weekends helps keep things cost-efficient, manageable for a one-person setup, and minimizes waste. But who knows, maybe one day we'll grow a little bigger and share our soft treats with even more of you."
  },
  {
    question: "How can I order?",
    answer: "Simply click the Order Now button at the top of this page or on the dessert you'd like to get, then fill in your details."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We currently accept GCash (and/or bank transfer - optional)."
  },
  {
    question: "How long do your desserts last?",
    answer: "Fluffychoo desserts are made with fresh ingredients and no preservatives. Mochi Brownies: up to 2 days room temp, 5 to 7 days chilled. Banana pudding: best within 2-3 days refrigerated. Always keep them sealed and chilled for maximum softness."
  },
  {
    question: "Can I freeze them?",
    answer: "Yes, you can freeze mochi brownies for up to 2 weeks. For banana pudding, we recommend chilling only as freezing may alter texture."
  },
  {
    question: "Do you accept bulk or custom orders?",
    answer: "Not at the moment."
  },
  {
    question: "Why \"Fluffychoo\"?",
    answer: "Because our desserts are soft, gentle, and made with love. We like to think of Fluff as a small weekend ritual, a sweet little pause after a long week that lets you slow down, treat yourself, and enjoy a moment of comfort."
  }
];

export default function Home() {
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isOrderFormEnabled, setIsOrderFormEnabled] = useState(true);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    title: '',
    suggestion: '',
  });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  useEffect(() => {
    fetchProducts();
    checkOrderFormAvailability();
  }, []);

  const checkOrderFormAvailability = async () => {
    setIsCheckingAvailability(true);
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success) {
        setIsOrderFormEnabled(data.data.order_form_enabled);
      }
    } catch (error) {
      console.error('Failed to check order form availability:', error);
      setIsOrderFormEnabled(true);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleOrderClick = (productName: string) => {
    setSelectedProduct(productName);
    setIsOrderFormOpen(true);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProductDetail(product);
    setIsDetailModalOpen(true);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    setFeedbackError('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackForm),
      });

      const data = await response.json();

      if (data.success) {
        setFeedbackSuccess(true);
        setFeedbackForm({ name: '', email: '', title: '', suggestion: '' });
        setTimeout(() => {
          setFeedbackSuccess(false);
        }, 3000);
      } else {
        setFeedbackError(data.error || 'Failed to submit feedback');
      }
    } catch (err) {
      setFeedbackError('An error occurred. Please try again.');
      console.error('Feedback submission error:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.svg"
                  alt="fluffychoo logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-semibold text-amber-900">Fluffychoo</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link href="#products" className="text-amber-900 hover:text-amber-600 font-medium transition-colors">
                Menu
              </Link>
              <Link href="#about" className="text-amber-900 hover:text-amber-600 font-medium transition-colors">
                About
              </Link>
              <Link href="#faq" className="text-amber-900 hover:text-amber-600 font-medium transition-colors">
                FAQs
              </Link>
              <Link href="#feedback" className="text-amber-900 hover:text-amber-600 font-medium transition-colors">
                Feedback
              </Link>
              <Link href="#contact" className="text-amber-900 hover:text-amber-600 font-medium transition-colors">
                Contact
              </Link>
            </div>

            <button
              onClick={() => !isCheckingAvailability && isOrderFormEnabled && setIsOrderFormOpen(true)}
              disabled={!isOrderFormEnabled || isCheckingAvailability}
              className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 flex items-center space-x-2 ${
                isOrderFormEnabled && !isCheckingAvailability
                  ? 'hover:shadow-lg transform hover:scale-105'
                  : 'cursor-not-allowed opacity-60'
              }`}
              style={isOrderFormEnabled && !isCheckingAvailability ? { background: 'linear-gradient(to right, #fef9c3, #fde68a)' } : { background: '#f3f4f6' }}
            >
              {isCheckingAvailability ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Checking...</span>
                </>
              ) : isOrderFormEnabled ? (
                <span className="text-amber-900">Order Now</span>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span className="text-amber-500">Unavailable</span>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 sm:space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-amber-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-500 mr-2" />
              <span className="text-amber-700 text-sm font-medium">Welcome to Fluffychoo!</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
              <span 
                className="block text-amber-900" 
                style={{ fontFamily: "'Adigiana Extreme', sans-serif" }}
              >
                Serving Soft Treats
              </span>
              <span 
                className="block bg-gradient-to-r from-amber-200 via-amber-600 to-amber-300 bg-clip-text text-transparent"
                style={{ fontFamily: "'Adigiana Extreme', sans-serif" }}
              >
                on Weekends
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-amber-800/80 leading-relaxed">
              All products are homemade in small batches    
              (because good things take time).
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 ">
              <Link 
                href="#products"
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-amber-900 text-base font-semibold rounded-full border-2 border-amber-500 hover:shadow-xl transform hover:scale-105 transition-all duration-300 "
                style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
              >
                Browse Desserts
              </Link>
              <Link 
                href="#about"
                className="px-6 py-3 bg-white/80 backdrop-blur-sm text-amber-900 text-base font-semibold rounded-full border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all duration-300"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute top-20 left-10 w-32 h-32 bg-amber-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-300/20 rounded-full blur-3xl"></div>
      </section>

      <section id="products" className="py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-900 mb-4">
              Our Desserts
            </h2>
            <p className="text-lg text-amber-700/80 max-w-2xl mx-auto">
              Each piece crafted with premium ingredients and baked to perfection.
            </p>
          </div>

          {isLoadingProducts ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-amber-600 animate-spin mb-4" />
              <p className="text-amber-700 text-lg">Loading our delicious products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-amber-900 mb-2">No Products Available</h3>
              <p className="text-amber-700">Check back soon for our delicious treats!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.filter(p => p.is_active).map((product) => (
                <div 
                  key={product.id} 
                  onClick={() => handleProductClick(product)}
                  className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                >
                 <ProductImageCarousel
  productId={product.id}
  fallbackImage={product.image}
  productName={product.name}
  isSoldOut={product.stock === 0}
/>
                 <div className="p-6">
  <h3 className="text-2xl font-bold text-amber-900 mb-2">{product.name}</h3>
  {product.description && (
    <p className="text-amber-700/80 mb-4 line-clamp-2">{product.description}</p>
  )}
  <div className="flex items-center justify-between">
    {product.discount_price !== null && product.discount_price !== undefined ? (
      <>
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 line-through">
            ₱{product.price !== null ? product.price.toFixed(2) : '0.00'}
          </span>
          <span className="text-3xl font-bold text-amber-900">
            ₱{product.discount_price.toFixed(2)}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOrderClick(product.name);
          }}
          disabled={!isOrderFormEnabled || isCheckingAvailability || product.stock === 0}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-amber-900 font-semibold rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
        >
          {isCheckingAvailability ? (
            <Clock className="w-4 h-4" />
          ) : (
            'Order Now'
          )}
        </button>
      </>
    ) : product.price !== null ? (
      <>
        <span className="text-2xl font-bold text-amber-900">
          ₱{product.price.toFixed(2)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOrderClick(product.name);
          }}
          disabled={!isOrderFormEnabled || isCheckingAvailability || product.stock === 0}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-amber-900 font-semibold rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
        >
          {isCheckingAvailability ? (
            <Clock className="w-4 h-4" />
          ) : (
            'Order Now'
          )}
        </button>
      </>
    ) : (
      <>
        <span className="text-2xl font-bold text-amber-900">
          Price TBD
        </span>
        <span className="px-4 py-2 bg-gray-100 text-gray-500 font-semibold rounded-xl cursor-not-allowed">
          Coming Soon
        </span>
      </>
    )}
  </div>
</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </section>
      

      <section id="about" className="py-12 sm:py-16 lg:py-24 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-900">
                Handcrafted with Love
              </h2>
              <p className="text-lg text-amber-800/80 leading-relaxed">
                We&apos;re a tiny weekend bakeshop making desserts that feel like a hug - gentle, cozy, and just sweet enough.
                Because honestly?
                The world is a bit tough so your desserts shouldn&apos;t be.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                  <Wheat className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-amber-900">Premium Ingredients</p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                  <Cookie className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-amber-900">Freshly Baked</p>
                </div>
                <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                  <Leaf className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-amber-900">No Preservatives</p>
                </div>
              </div>
            </div>
            <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/products/classicchoos.png"
                alt="Baking process"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-12 sm:py-16 lg:py-24 bg-white/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-amber-700/80">
              Everything you need to know about Fluffychoo.
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-amber-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-amber-50/50 transition-colors"
                >
                  <span className="text-lg font-semibold text-amber-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-amber-600 flex-shrink-0 transition-transform duration-300 ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaqIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-5 text-amber-800/80 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="feedback" className="py-12 sm:py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-900 mb-4">
              We&apos;d Love to Hear From You
            </h2>
            <p className="text-lg text-amber-700/80">
              Share your thoughts, suggestions, or let us know how we can make your Fluffychoo experience even better.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-amber-50 rounded-lg">
                <MessageSquare className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-amber-900">Share your feedback</h3>
                <p className="text-sm text-amber-700">We&apos;d love to hear from you.</p>
              </div>
            </div>

            {feedbackSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-amber-900 mb-2">Thank You!</h3>
                <p className="text-amber-700">Your feedback has been submitted successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-semibold text-amber-900 mb-3">
                      Name <span className="text-amber-500">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={feedbackForm.name}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                      className="w-full px-5 py-3 text-base border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-amber-900 mb-3">
                      Email <span className="text-amber-500">(optional)</span>
                    </label>
                    <input
                      type="email"
                      value={feedbackForm.email}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                      className="w-full px-5 py-3 text-base border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-semibold text-amber-900 mb-3">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={feedbackForm.title}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, title: e.target.value })}
                    className="w-full px-5 py-3 text-base border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900"
                    placeholder="What's your feedback about?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-amber-900 mb-3">
                    Your Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={feedbackForm.suggestion}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, suggestion: e.target.value })}
                    className="w-full px-5 py-3 text-base border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-48 text-amber-900"
                    placeholder="Share your thoughts, suggestions, or concerns..."
                    required
                  />
                </div>

                {feedbackError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-base">
                    {feedbackError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="w-full px-6 py-4 text-lg text-amber-900 font-semibold rounded-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
                >
                  <Send className="w-5 h-5" />
                  <span>{isSubmittingFeedback ? 'Sending...' : 'Submit Feedback'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-amber-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative w-10 h-10">
                  <Image
                    src="/logo.svg"
                    alt="fluffychoo logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-semibold">Fluffychoo</span>
              </div>
              <p className="text-amber-200 text-sm">
                You deserve softness.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-amber-200 text-sm">
                <li><Link href="#products" className="hover:text-white transition-colors">Products</Link></li>
                <li><Link href="#about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#faq" className="hover:text-white transition-colors">FAQs</Link></li>
                <li><Link href="#feedback" className="hover:text-white transition-colors">Share Feedback</Link></li>
                <li><Link href="admin/login" className="hover:text-white transition-colors">Fluffychoo</Link></li>
                <li><Link href="track-order" className="hover:text-white transition-colors">Track Order</Link></li>
              </ul>
            </div>

           <div>
            <h3 className="font-semibold mb-4">Get in Touch</h3>
            
            <a 
              href="mailto:fluffyfluffychoo@gmail.com"
              className="flex items-center gap-2 text-amber-200 text-sm mb-2 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
              fluffyfluffychoo@gmail.com
            </a>
            
            <a 
              href="https://facebook.com/fluffychoo.co"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-amber-200 text-sm mb-2 hover:text-white transition-colors"
            >
              <Facebook className="w-4 h-4" />
              Fluffychoo.co
            </a>
            
            <a 
              href="https://instagram.com/fluffychoo.co"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-amber-200 text-sm mb-2 hover:text-white transition-colors"
            >
              <Instagram className="w-4 h-4" />
              Fluffychoo.co
            </a>
            
            <a 
              href="https://tiktok.com/@fluffychoo.co"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-amber-200 text-sm mb-2 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              Fluffychoo.co
            </a>
            
            <p className="text-amber-200 text-sm mt-4">
              Follow us for daily updates
            </p>
          </div>
          </div>

          <div className="border-t border-amber-800 mt-8 pt-8 text-center text-amber-300 text-sm">
            <p>&copy; 2025 Fluffychoo.co Crafted with care.</p>
          </div>
        </div>
      </footer>

      <OrderForm
        isOpen={isOrderFormOpen}
        onClose={() => {
          setIsOrderFormOpen(false);
          setSelectedProduct('');
        }}
        selectedProduct={selectedProduct}
      />
      {/* Product Detail Modal */}
       {isDetailModalOpen && selectedProductDetail && (
  <div 
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
    onClick={() => setIsDetailModalOpen(false)}
  >
    <div 
      className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide" 
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header */}
      <div className="p-6 border-b border-amber-100 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-amber-900">{selectedProductDetail.name}</h2>
        <button
          onClick={() => setIsDetailModalOpen(false)}
          className="text-amber-600 hover:text-amber-800 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      {/* Modal Body */}
      <div className="p-6 space-y-6">
        {/* ⬇️ REPLACE THIS ENTIRE SECTION ⬇️ */}
        <ProductDetailCarousel
          productId={selectedProductDetail.id}
          fallbackImage={selectedProductDetail.image}
          productName={selectedProductDetail.name}
        />
        {/* ⬆️ END OF REPLACEMENT ⬆️ */}
        
        {/* Product Details */}
        <div className="space-y-4">
          {/* Price and Stock */}
          <div className="flex items-center justify-between">
            {selectedProductDetail.discount_price !== null && selectedProductDetail.discount_price !== undefined ? (
              <div className="flex flex-col">
                <span className="text-lg text-gray-500 line-through">
                  ₱{selectedProductDetail.price !== null ? selectedProductDetail.price.toFixed(2) : '0.00'}
                </span>
                <span className="text-3xl font-bold text-amber-900">
                  ₱{selectedProductDetail.discount_price.toFixed(2)}
                </span>
              </div>
            ) : selectedProductDetail.price !== null ? (
              <span className="text-3xl font-bold text-amber-900">
                ₱{selectedProductDetail.price.toFixed(2)}
              </span>
            ) : (
              <span className="text-2xl font-semibold text-amber-600">Price TBD</span>
            )}
            <ShoppingBag className="w-6 h-6 text-amber-600 group-hover:text-amber-700" />
          </div>
          
          {selectedProductDetail.stock === 0 && (
            <div className="mt-3 text-sm text-red-600 font-medium">
              Out of Stock
            </div>
          )}
          
          {/* Full Description */}
          {selectedProductDetail.description && (
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Description</h3>
              <p className="text-amber-700/80 leading-relaxed whitespace-pre-wrap">
                {selectedProductDetail.description}
              </p>
            </div>
          )}
        </div>
        
        {/* Order Button */}
        <div className="pt-4 border-t border-amber-100">
          <button
            onClick={() => {
              setIsDetailModalOpen(false);
              handleOrderClick(selectedProductDetail.name);
            }}
            disabled={!isOrderFormEnabled || isCheckingAvailability || selectedProductDetail.stock === 0}
            className={`w-full px-6 py-3 text-amber-900 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
              isOrderFormEnabled && !isCheckingAvailability && selectedProductDetail.stock > 0
                ? 'hover:shadow-lg transform hover:scale-105'
                : 'cursor-not-allowed opacity-60'
            }`}
            style={isOrderFormEnabled && !isCheckingAvailability && selectedProductDetail.stock > 0
              ? { background: 'linear-gradient(to right, #fef9c3, #fde68a)' } 
              : { background: '#f3f4f6' }
            }
          >
            {isCheckingAvailability ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking...</span>
              </>
            ) : isOrderFormEnabled ? (
              <span>Order Now</span>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                <span>Unavailable</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
    
  );
}