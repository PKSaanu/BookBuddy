import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  
  const isAuthPage = 
    request.nextUrl.pathname.startsWith('/login') || 
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/reset-password') ||
    request.nextUrl.pathname.startsWith('/verify-email');
  const isProtectedPage = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/books');

  if (isAuthPage) {
    if (token) {
      try {
        const payload = await verifyToken(token);
        if (payload) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch (e) {
        // invalid token, let them proceed to login/register
      }
    }
  }

  if (isProtectedPage) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      const payload = await verifyToken(token);
      if (!payload) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/books/:path*', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email/:path*'],
};


