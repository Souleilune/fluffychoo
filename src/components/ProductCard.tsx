'use client';

import Image from 'next/image';
import { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  // Different animation types for variety
  const animations = ['floatBounce', 'slideRotate', 'pulseGlow', 'swayFloat'];
  const hoverAnimations = ['tiltLeft', 'tiltRight', 'liftUp', 'rotate3d'];
  
  const animationType = animations[index % animations.length];
  const hoverType = hoverAnimations[index % hoverAnimations.length];

  return (
    <div 
      className={`group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer hover-${hoverType}`}
      style={{
        animation: `fadeIn 0.6s ease-out ${index * 0.1}s both, ${animationType} 3s ease-in-out ${index * 0.3}s infinite`
      }}
    >
      {/* Main card container */}
      <div className="relative w-full h-full bg-white shadow-xl group-hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden">
        
        {/* Product Image Section */}
        <div className="relative h-[65%] w-full overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transform group-hover:scale-110 group-hover:rotate-2 transition-all duration-700 ease-out"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          
          {/* Animated sparkle effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 animate-spin-slow">
              <div className="absolute top-0 left-1/2 w-1 h-8 bg-gradient-to-b from-amber-300 to-transparent rounded-full" />
              <div className="absolute bottom-0 left-1/2 w-1 h-8 bg-gradient-to-t from-amber-300 to-transparent rounded-full" />
              <div className="absolute left-0 top-1/2 w-8 h-1 bg-gradient-to-r from-amber-300 to-transparent rounded-full" />
              <div className="absolute right-0 top-1/2 w-8 h-1 bg-gradient-to-l from-amber-300 to-transparent rounded-full" />
            </div>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-float-1" />
            <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-float-2" />
            <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-orange-400 rounded-full animate-float-3" />
          </div>

          {/* Gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* Content Section */}
        <div className="relative h-[35%] bg-white p-6 flex flex-col justify-between">
          
          <div>
            <h3 className="text-2xl font-bold text-amber-900 mb-2 transform group-hover:translate-x-2 transition-all duration-300">
              {product.name}
            </h3>
            
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed transform group-hover:translate-x-1 transition-all duration-300 delay-75">
              {product.description}
            </p>
          </div>

          {/* Price with animated decorative elements */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-baseline gap-2 transform group-hover:scale-105 transition-transform duration-300">
              <span className="text-3xl font-black text-amber-600 animate-pulse-subtle">
                ₱{product.price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 font-medium">each</span>
            </div>
            
            {/* Decorative animated dots */}
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400 animate-bounce-1" style={{ animationDelay: '0s' }} />
              <div className="w-3 h-3 rounded-full bg-yellow-400 animate-bounce-1" style={{ animationDelay: '0.2s' }} />
              <div className="w-3 h-3 rounded-full bg-orange-400 animate-bounce-1" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-400/0 to-orange-400/0 group-hover:from-amber-400/20 group-hover:to-orange-400/20 transition-all duration-500 pointer-events-none" />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes floatBounce {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(1deg); }
          50% { transform: translateY(-5px) rotate(-1deg); }
          75% { transform: translateY(-15px) rotate(0.5deg); }
        }

        @keyframes slideRotate {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          33% { transform: translateX(8px) rotate(1deg); }
          66% { transform: translateX(-8px) rotate(-1deg); }
        }

        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        @keyframes swayFloat {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          25% { transform: translateX(-8px) translateY(-8px); }
          50% { transform: translateX(8px) translateY(-4px); }
          75% { transform: translateX(-4px) translateY(-12px); }
        }

        .hover-tiltLeft:hover {
          transform: perspective(1000px) rotateY(-5deg) rotateX(2deg);
        }

        .hover-tiltRight:hover {
          transform: perspective(1000px) rotateY(5deg) rotateX(2deg);
        }

        .hover-liftUp:hover {
          transform: translateY(-12px) scale(1.02);
        }

        .hover-rotate3d:hover {
          transform: perspective(1000px) rotateX(-5deg) translateY(-8px);
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(-20px, -30px); opacity: 1; }
          66% { transform: translate(10px, -50px); opacity: 0.5; }
        }

        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(20px, -40px); opacity: 1; }
          66% { transform: translate(-10px, -60px); opacity: 0.3; }
        }

        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(-15px, -25px); opacity: 1; }
          66% { transform: translate(15px, -45px); opacity: 0.4; }
        }

        .animate-float-1 { animation: float-1 2s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 2.5s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 2.2s ease-in-out infinite; }

        @keyframes bounce-1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .animate-bounce-1 {
          animation: bounce-1 1s ease-in-out infinite;
        }

        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}