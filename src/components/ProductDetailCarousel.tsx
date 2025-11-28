'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import Image from 'next/image';

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface ProductDetailCarouselProps {
  productId: string;
  fallbackImage?: string | null;
  productName: string;
}

export default function ProductDetailCarousel({
  productId,
  fallbackImage,
  productName,
}: ProductDetailCarouselProps) {
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
        setImages([{
          id: 'fallback',
          image_url: fallbackImage,
          display_order: 0,
        }]);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
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

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-80 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center rounded-lg">
        <div className="animate-pulse">
          <Package className="w-24 h-24 text-amber-400" />
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="relative w-full h-80 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center rounded-lg">
        <Package className="w-24 h-24 text-amber-400" />
      </div>
    );
  }

  const showControls = images.length > 1;

  return (
    <div className="w-full">
      {/* Main Image Display */}
      <div className="relative w-full h-80 bg-amber-50 rounded-lg overflow-hidden mb-4">
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
              className="object-cover"
            />
          </div>
        ))}

        {/* Navigation Arrows */}
        {showControls && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 text-amber-900" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 text-amber-900" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {showControls && (
          <div className="absolute top-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {showControls && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-amber-500 ring-2 ring-amber-300'
                  : 'border-amber-200 hover:border-amber-400'
              }`}
            >
              <Image
                src={image.image_url}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}