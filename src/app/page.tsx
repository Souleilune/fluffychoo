'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Sparkles, Wheat, Cookie, Loader2, Package, Clock, Mail, Facebook, Instagram, Leaf } from 'lucide-react';
import OrderForm from '@/components/OrderForm';
import FeedbackModal from '@/components/FeedbackModal';

interface Product {
  id: string;
  name: string;
  price: number | null;
  description: string | null;
  image: string | null;
  stock: number;
  is_active: boolean;
}

export default function Home() {
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isOrderFormEnabled, setIsOrderFormEnabled] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(true);


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
      // Default to enabled on error
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

  const handleOrderClick = (productName?: string) => {
    if (!isOrderFormEnabled) {
      return; // Don't open if disabled
    }
    
    if (productName) {
      setSelectedProduct(productName);
    }
    setIsOrderFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative w-10 h-10 sm:w-22 sm:h-22 transform group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/choologo.png"
                  alt="fluffychoo logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#products" className="text-amber-900 hover:text-amber-600 transition-colors font-medium">
                Products
              </Link>
              <Link href="#about" className="text-amber-900 hover:text-amber-600 transition-colors font-medium">
                About
              </Link>
              <Link href="#contact" className="text-amber-900 hover:text-amber-600 transition-colors font-medium">
                Contact
              </Link>
            </div>

            <button 
              onClick={() => handleOrderClick()}
              disabled={!isOrderFormEnabled || isCheckingAvailability}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 font-semibold rounded-full transition-all duration-300 flex items-center space-x-2 ${
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
              <span className="text-amber-700 text-sm font-medium">Welcome to fluffychoo!</span>
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
              Each piece crafted with premium ingredients and baked to perfection
            </p>
          </div>

          {isLoadingProducts ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-amber-600 animate-spin mb-4" />
              <p className="text-amber-700 text-lg">Loading our delicious products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Package className="w-16 h-16 text-amber-400 mb-4" />
              <p className="text-amber-700 text-lg">No products available at the moment</p>
              <p className="text-amber-600 text-sm mt-2">Check back soon for fresh batches!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="relative h-64 sm:h-72 overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-20 h-20 text-amber-300" />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-amber-900 mb-2 group-hover:text-amber-700 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-amber-700/70 text-sm mb-4 line-clamp-2">
                      {product.description || 'Delicious mochi brownie'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      {product.price !== null && product.price > 0 ? (
                        <>
                          <span className="text-2xl font-bold text-amber-900">
                            ₱{product.price.toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleOrderClick(product.name)}
                            disabled={!isOrderFormEnabled || isCheckingAvailability}
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

      <section className="relative py-16 sm:py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(to right, #fef3c7, #fed7aa)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-900">
              Ready to Experience Fluffy Comfort?
            </h2>
            <p className="text-black-50 text-lg mb-8 max-w-2xl mx-auto">
              Order now and experience the perfect blend of soft chewy mochi and rich brownie goodness
            </p>
            <Link 
              href="#products"
              className="inline-block px-8 py-4 bg-white text-amber-900 text-lg font-semibold rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              View Menu
            </Link>
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
                <span className="text-xl font-semibold">fluffychoo</span>
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
                <li><Link href="#contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li>
                  <button 
                    onClick={() => setIsFeedbackOpen(true)}
                    className="hover:text-white transition-colors flex items-center gap-2"
                  >
                    
                    Share Feedback
                  </button>
                </li>
                <li><Link href="admin/login" className="hover:text-white transition-colors">Fluffychoo</Link></li>
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
              fluffychoo.co
            </a>
            
            <a 
              href="https://instagram.com/fluffychoo.co"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-amber-200 text-sm mb-2 hover:text-white transition-colors"
            >
              <Instagram className="w-4 h-4" />
              fluffychoo.co
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
              fluffychoo.co
            </a>
            
            <p className="text-amber-200 text-sm mt-4">
              Follow us for daily updates
            </p>
          </div>
          </div>

          <div className="border-t border-amber-800 mt-8 pt-8 text-center text-amber-300 text-sm">
            <p>&copy; 2025 fluffychoo.co Crafted with care.</p>
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

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}