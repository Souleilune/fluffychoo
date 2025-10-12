'use client';

import Image from 'next/image';
import { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const handleAddToCart = () => {
    // Future: Add to cart functionality
    console.log('Added to cart:', product.name);
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-amber-100">
      {/* Product Image */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Product Details */}
      <div className="p-6 space-y-3">
        <h3 className="text-xl font-semibold text-amber-900 group-hover:text-amber-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {product.description}
        </p>
        
        {/* Price and Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
            ${product.price.toFixed(2)}
          </span>
          <button 
            onClick={handleAddToCart}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full font-medium hover:from-amber-600 hover:to-yellow-600 transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-xl"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}