'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Sparkles, Wheat, ChefHat, Cookie, Loader2, Package } from 'lucide-react';
import OrderForm from '@/components/OrderForm';

interface Product {
  id: string;
  name: string;
  price: number;
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

  useEffect(() => {
    fetchProducts();
  }, []);

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
                  alt="fluffy choy logo"
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
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Order Now
            </button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 sm:space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-amber-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-500 mr-2" />
              <span className="text-amber-700 text-sm font-medium">Freshly baked with love and fluff</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="block text-amber-900">Comforting Softness</span>
              <span className="block bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                in Every Bite
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-amber-800/80 leading-relaxed">
              A cozy bite of chewy mochi brownie, baked fresh to warm your day.    
              You deserve softness.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                href="#products"
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-base font-semibold rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Explore Flavors
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
              This Week's Collection
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
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                      <button 
                        onClick={() => handleOrderClick(product.name)}
                        className="px-6 py-2 bg-white text-amber-900 font-semibold rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                      >
                        Quick View
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-amber-900 mb-2 group-hover:text-amber-700 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-amber-700/70 text-sm mb-4 line-clamp-2">
                      {product.description || 'Delicious mochi brownie'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      {product.price > 0 ? (
                        <>
                          <span className="text-2xl font-bold text-amber-900">
                            ₱{product.price.toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleOrderClick(product.name)}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            Order Now
                          </button>
                        </>
                      ) : (
                        <span className="text-amber-600 italic text-sm">Coming Soon</span>
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
                At fluffy choy, we believe in the power of comfort food. Each mochi brownie is carefully crafted using premium ingredients and traditional techniques, creating the perfect balance of chewy and fudgy textures that melts in your mouth.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                  <Wheat className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-amber-900">Premium Ingredients</p>
                </div>
                <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                  <ChefHat className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-amber-900">Expert Bakers</p>
                </div>
                <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                  <Cookie className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-amber-900">Fresh Daily</p>
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
              Order now and experience the perfect blend of chewy mochi and rich brownie goodness
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
                    alt="fluffy choy logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-semibold">fluffychoo</span>
              </div>
              <p className="text-amber-200 text-sm">
                Premium mochi brownies, baked fresh daily with love and care.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-amber-200 text-sm">
                <li><Link href="#products" className="hover:text-white transition-colors">Products</Link></li>
                <li><Link href="#about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="admin/login" className="hover:text-white transition-colors">Fluffychoo</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Get in Touch</h3>
              <p className="text-amber-200 text-sm mb-2">
                example@fluffychoo.com
              </p>
              <p className="text-amber-200 text-sm">
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
    </div>
  );
}