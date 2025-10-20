import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Inline JWT verification to keep middleware small
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

async function verifyTokenInline(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    
    if (payload.type !== 'admin') {
      return null;
    }

    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Allow access to login page
    if (pathname === '/admin/login') {
      // If already logged in, redirect to dashboard
      const token = request.cookies.get('admin_token')?.value;
      if (token) {
        const user = await verifyTokenInline(token);
        if (user) {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
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
    const user = await verifyTokenInline(token);
    if (!user) {
      // Invalid token, clear it and redirect
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