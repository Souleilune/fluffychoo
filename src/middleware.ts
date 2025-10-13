import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/admin-auth';

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Allow access to login page
    if (pathname === '/admin/login') {
      // If already logged in, redirect to dashboard
      const token = request.cookies.get('admin_token')?.value;
      if (token) {
        try {
          const user = await verifyToken(token);
          if (user) {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
          }
        } catch (error) {
          // Invalid token, continue to login
          console.error('Token verification error:', error);
        }
      }
      return NextResponse.next();
    }

    // Check for authentication token
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Verify token
    try {
      const user = await verifyToken(token);
      if (!user) {
        // Invalid token, clear it and redirect
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('admin_token');
        return response;
      }
    } catch (error) {
      // Token verification failed
      console.error('Token verification error:', error);
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_token');
      return response;
    }

    // Token is valid, allow access
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};