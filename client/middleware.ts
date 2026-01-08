import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

// Routes that require specific roles
const roleBasedRoutes: Record<string, string[]> = {
  '/teachers': ['ADMIN'],
  '/students': ['ADMIN', 'TEACHER'],
  '/settings': ['ADMIN', 'TEACHER', 'STUDENT'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Get token from cookies (fallback check - main auth is in client)
  const accessToken = request.cookies.get('accessToken')?.value;
  
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // If accessing login page while authenticated, redirect to dashboard
  if (pathname === '/login' && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // For protected routes, we'll handle auth check on client side
  // This middleware mainly handles the initial redirect logic
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
