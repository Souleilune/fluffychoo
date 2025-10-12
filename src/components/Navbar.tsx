'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="pt-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24 sm:h-28 md:h-32">
          {/* Logo - Much Bigger */}
          <Link href="/" className="flex items-center group z-50">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 flex-shrink-0">
              <Image 
                src="/logo.svg" 
                alt="Fluffy Choy Logo"
                fill
                className="object-contain group-hover:scale-110 transition-transform duration-300"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-12">
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden z-50 p-2 rounded-md text-amber-600 hover:text-amber-700 hover:bg-amber-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-6 space-y-4">
            <Link 
              href="/" 
              onClick={() => setIsMenuOpen(false)}
              className="block text-amber-600 hover:text-amber-700 font-medium text-lg transition-colors py-2"
            >
              home
            </Link>
            <Link 
              href="/showcase" 
              onClick={() => setIsMenuOpen(false)}
              className="block text-amber-600 hover:text-amber-700 font-medium text-lg transition-colors py-2"
            >
              showcase
            </Link>
            <Link 
              href="/contact" 
              onClick={() => setIsMenuOpen(false)}
              className="block text-amber-600 hover:text-amber-700 font-medium text-lg transition-colors py-2"
            >
              contact
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}