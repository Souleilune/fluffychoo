'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Products', href: '/admin/products', icon: Package },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-amber-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-amber-100">
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <div className="relative w-10 h-10">
                <Image
                  src="/choologo.png"
                  alt="fluffy choy logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-amber-900">Admin</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-amber-600 hover:text-amber-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isActive
                      ? 'text-amber-900 shadow-lg transform scale-[1.02]'
                      : 'text-amber-700 hover:bg-amber-50'
                  }`}
                  style={isActive ? { background: 'linear-gradient(to right, #fef9c3, #fde68a)' } : {}}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-amber-100">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center justify-center space-x-3 px-4 py-3 w-full text-amber-900 font-semibold rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
            >
              <LogOut className="w-5 h-5" />
              <span>
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-amber-100">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-amber-600 hover:text-amber-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4 ml-auto">
              <span className="text-sm text-amber-700">
                Welcome, Admin
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}