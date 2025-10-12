import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import { products } from '@/data/products';

export default function Home() {
  return (
    <div className="min-h-screen bg-yellow-50">
      <Navbar />
      
      {/* Hero Section */}
      

      {/* Featured Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent mb-3 sm:mb-4">
            Featured Mochi Brownies this week!
          </h2>
          
        </div>


        {/* Product Grid - Responsive columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="pt-4">
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
  );
}