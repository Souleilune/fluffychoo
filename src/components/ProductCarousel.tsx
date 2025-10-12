'use client';

import { useState, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/data/products';

interface ProductCarouselProps {
  products: Product[];
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  // Auto-play functionality - pauses when hovering
  useEffect(() => {
    if (!isAutoPlaying || isHovering) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, products.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
    setIsAutoPlaying(false);
  }, [products.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    setIsAutoPlaying(false);
  }, [products.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  }, []);

  return (
    <div 
      className="relative w-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-3xl">
        {/* Slides Wrapper */}
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {products.map((product, index) => (
            <div
              key={product.id}
              className="min-w-full px-4 sm:px-8 md:px-12"
            >
              <div className="max-w-2xl mx-auto">
                <ProductCard product={product} index={index} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-3 mt-8">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? 'w-12 h-3 bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg'
                : 'w-3 h-3 bg-amber-200 hover:bg-amber-300 hover:scale-125'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}