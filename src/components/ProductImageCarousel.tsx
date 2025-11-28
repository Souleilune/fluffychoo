'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import Image from 'next/image';

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface ProductImageCarouselProps {
  productId: string;
  fallbackImage?: string | null;
  productName: string;
  isSoldOut?: boolean;
}

export default function ProductImageCarousel({
  productId,
  fallbackImage,
  productName,
  isSoldOut = false,
}: ProductImageCarouselProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, [productId]);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}/images`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setImages(data.data);
      } else if (fallbackImage) {
        // Use fallback image if no images in product_images table
        setImages([{
          id: 'fallback',
          image_url: fallbackImage,
          display_order: 0,
        }]);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
      // Use fallback on error
      if (fallbackImage) {
        setImages([{
          id: 'fallback',
          image_url: fallbackImage,
          display_order: 0,
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
      <div className="relative h-64 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
        <div className="animate-pulse">
          <Package className="w-24 h-24 text-amber-400" />
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className={`relative h-64 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center ${
        isSoldOut ? 'opacity-50 grayscale' : ''
      }`}>
        <Package className="w-24 h-24 text-amber-400" />
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg transform rotate-[-5deg]">
              SOLD OUT
            </div>
          </div>
        )}
      </div>
    );
  }

  const showControls = images.length > 1;

  return (
    <div className="relative h-64 overflow-hidden group">
      {/* Images */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={image.image_url}
              alt={`${productName} - Image ${index + 1}`}
              fill
              className={`object-cover transition-transform duration-300 group-hover:scale-110 ${
                isSoldOut ? 'opacity-50 grayscale' : ''
              }`}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Only show if multiple images */}
      {showControls && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-amber-900" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-amber-900" />
          </button>
        </>
      )}

      {/* Dot Indicators - Only show if multiple images */}
      {showControls && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => goToSlide(index, e)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Sold Out Overlay */}
      {isSoldOut && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
          <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg transform rotate-[-5deg]">
            SOLD OUT
          </div>
        </div>
      )}
    </div>
  );
}