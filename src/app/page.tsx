import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductCarousel from '@/components/ProductCarousel';
import Footer from '@/components/Footer';
import { products } from '@/data/products';

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Yellow Background */}
      <div className="fixed top-0 left-0 w-screen h-screen bg-yellow-50 -z-20" />
      
      {/* Background Pattern Layer */}
      <div 
        className="fixed top-0 left-0 w-screen h-screen pointer-events-none -z-10"
        style={{
          backgroundImage: 'url(/logo.svg)',
          backgroundSize: '120px 120px',
          backgroundRepeat: 'repeat',
          opacity: 0.07,
          transform: 'rotate(-20deg) scale(1.5)',
          transformOrigin: 'center center'
        }}
      />
      
      {/* Content Layer */}
      <div className="relative z-10">
        <Navbar />
        
        {/* Featured Products Section */}
        <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent mb-3 sm:mb-4">
              Featured Mochi Brownies this week!
            </h2>
          </div>

          {/* Product Carousel */}
          <ProductCarousel products={products} />

          {/* Order Now Button */}
          <div className="text-center pt-12">
            <Link 
              href="#products"
              className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-base sm:text-lg font-semibold rounded-full hover:from-amber-600 hover:to-yellow-600 transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl hover:shadow-2xl"
            >
              Order Now
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}