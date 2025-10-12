'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200 backdrop-blur-sm bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent group-hover:from-amber-700 group-hover:to-yellow-700 transition-all">
              fluffy choy
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-8">
            <Link 
              href="/" 
              className="text-amber-900 hover:text-amber-600 font-medium transition-colors relative group"
            >
              home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-600 to-yellow-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/showcase" 
              className="text-amber-900 hover:text-amber-600 font-medium transition-colors relative group"
            >
              showcase
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-600 to-yellow-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/contact" 
              className="text-amber-900 hover:text-amber-600 font-medium transition-colors relative group"
            >
              contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-600 to-yellow-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}