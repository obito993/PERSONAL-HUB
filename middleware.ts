import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'deion-hub-super-secret-jwt-key-2026-production'
);

const PUBLIC_ROUTES = ['/login', '/signup', '/api/auth/login', '/api/auth/signup', '/_next', '/favicon.ico', '/manifest.json'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static files and public routes
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith('/_next') || pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/signup'))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('dh_session')?.value;

  let isValid = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isValid = true;
    } catch {
      isValid = false;
    }
  }

  // Redirect unauthenticated users to /login
  if (!isValid && pathname !== '/login' && !pathname.startsWith('/login') && !pathname.startsWith('/signup')) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from /login or /signup to /
  if (isValid && (pathname === '/login' || pathname === '/signup')) {
    const homeUrl = new URL('/', req.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
