'use client';

import Image from 'next/image';
import { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-64 sm:h-72 md:h-80">
      {/* Product Image - Always Visible */}
      <div className="relative w-full h-full bg-gradient-to-br from-yellow-100 via-amber-50 to-orange-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Hover Overlay with Details */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-900/95 via-amber-800/90 to-amber-700/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 sm:p-6">
        <div className="space-y-2 sm:space-y-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            {product.name}
          </h3>
          <p className="text-sm sm:text-base text-yellow-100 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-3xl font-bold text-yellow-200">
              {product.price.toFixed(2)}
            </span>
            <span className="text-sm text-yellow-300 font-medium">each</span>
          </div>
        </div>
      </div>

      {/* Subtle border that appears on hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-300 rounded-3xl transition-colors duration-300 pointer-events-none"></div>
    </div>
  );
}