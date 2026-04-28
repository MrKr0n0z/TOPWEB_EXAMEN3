import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy function to handle authentication redirects
 * - Redirects to /login if accessing /dashboard without token
 * - Redirects to /dashboard if accessing /login with token
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('sii_token')?.value;

  // Redirect to login if trying to access dashboard without token
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if trying to access login with token
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

/**
 * Configure which routes the proxy should run on
 */
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
