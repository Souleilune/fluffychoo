'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-[#fcf5e3] to-[#fbde8b] border-t border-[#fed16a] mt-12 sm:mt-16 md:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col items-center space-y-4 sm:space-y-5">
          {/* Social Links */}
          <div className="flex space-x-6 sm:space-x-8">
            <Link 
              href="https://facebook.com" 
              target="_blank"
              className="text-[#683310] hover:text-[#fe8cbb] transition-colors transform hover:scale-110 active:scale-95"
              aria-label="Facebook"
            >
              <Facebook className="w-6 h-6 sm:w-7 sm:h-7" />
            </Link>
            <Link 
              href="https://instagram.com" 
              target="_blank"
              className="text-[#683310] hover:text-[#fe8cbb] transition-colors transform hover:scale-110 active:scale-95"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6 sm:w-7 sm:h-7" />
            </Link>
            <Link 
              href="https://twitter.com" 
              target="_blank"
              className="text-[#683310] hover:text-[#fe8cbb] transition-colors transform hover:scale-110 active:scale-95"
              aria-label="Twitter"
            >
              <Twitter className="w-6 h-6 sm:w-7 sm:h-7" />
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center text-xs sm:text-sm text-[#683310] px-4">
            <p>&copy; {currentYear} fluffy choy. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}