'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image 
                src="/logo.svg" 
                alt="Fluffy Choy Logo"
                fill
                className="object-contain group-hover:scale-110 transition-transform duration-300"
                priority
              />
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-12">
            <Link 
              href="/" 
              className="text-amber-600 hover:text-amber-700 font-medium text-base transition-colors"
            >
              home
            </Link>
            <Link 
              href="/showcase" 
              className="text-amber-600 hover:text-amber-700 font-medium text-base transition-colors"
            >
              showcase
            </Link>
            <Link 
              href="/contact" 
              className="text-amber-600 hover:text-amber-700 font-medium text-base transition-colors"
            >
              contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}