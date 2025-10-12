import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import { products } from '@/data/products';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center space-y-8">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="block bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 bg-clip-text text-transparent">
                Shine in Every Detail
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl md:text-2xl text-amber-900 max-w-2xl mx-auto font-light">
              Discover timeless elegance with our curated collection of luxury items
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              <Link 
                href="#products"
                className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-lg font-semibold rounded-full hover:from-amber-600 hover:to-yellow-600 transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl hover:shadow-2xl"
              >
                Shop Now
              </Link>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent mb-4">
            Featured Collection
          </h2>
          <p className="text-lg text-amber-800 max-w-2xl mx-auto">
            Handpicked items that embody luxury and sophistication
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}