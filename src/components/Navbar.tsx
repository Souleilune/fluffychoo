'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16">
          {/* Desktop Navigation Links - Centered */}
          <div className="hidden md:flex space-x-12">
            <Link 
              href="/" 
              className="text-[#DAA520] hover:text-[#B8860B] font-light text-base uppercase tracking-wide transition-colors"
            >
              HOME
            </Link>
            <Link 
              href="/showcase" 
              className="text-[#DAA520] hover:text-[#B8860B] font-light text-base uppercase tracking-wide transition-colors"
            >
              SHOWCASE
            </Link>
            <Link 
              href="/contact" 
              className="text-[#DAA520] hover:text-[#B8860B] font-light text-base uppercase tracking-wide transition-colors"
            >
              CONTACT
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden z-50 p-2 rounded-md text-[#DAA520] hover:text-[#B8860B] hover:bg-amber-100 transition-colors"
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
              className="block text-[#DAA520] hover:text-[#B8860B] font-light text-lg uppercase tracking-wide transition-colors py-2"
            >
              HOME
            </Link>
            <Link 
              href="/showcase" 
              onClick={() => setIsMenuOpen(false)}
              className="block text-[#DAA520] hover:text-[#B8860B] font-light text-lg uppercase tracking-wide transition-colors py-2"
            >
              SHOWCASE
            </Link>
            <Link 
              href="/contact" 
              onClick={() => setIsMenuOpen(false)}
              className="block text-[#DAA520] hover:text-[#B8860B] font-light text-lg uppercase tracking-wide transition-colors py-2"
            >
              CONTACT
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}