import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'deion-hub-super-secret-jwt-key-2026-production'
);

const IDLE_TIMEOUT_MS = (parseInt(process.env.SESSION_IDLE_TIMEOUT_MINUTES || '30', 10)) * 60 * 1000;
const PUBLIC_ROUTES = ['/login', '/signup', '/api/auth/login', '/api/auth/signup', '/api/auth/activity', '/_next', '/favicon.ico', '/manifest.json'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static files, images, and public routes
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith('/_next') || pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/signup') || pathname.startsWith('/images/'))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('dh_session')?.value;

  let isValid = false;
  let isIdleExpired = false;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const lastActivityAt = typeof payload.lastActivityAt === 'number'
        ? payload.lastActivityAt
        : Date.now();

      const now = Date.now();
      if (now - lastActivityAt > IDLE_TIMEOUT_MS) {
        isValid = false;
        isIdleExpired = true;
      } else {
        isValid = true;
      }
    } catch {
      isValid = false;
    }
  }

  // Handle idle expiration or unauthenticated users trying to access protected routes
  if (!isValid && pathname !== '/login' && !pathname.startsWith('/login') && !pathname.startsWith('/signup')) {
    const loginUrl = new URL('/login', req.url);
    if (isIdleExpired) {
      loginUrl.searchParams.set('expired', 'true');
    }
    if (pathname && pathname !== '/') {
      loginUrl.searchParams.set('returnUrl', pathname);
    }
    
    const response = NextResponse.redirect(loginUrl);
    if (isIdleExpired) {
      response.cookies.set('dh_session', '', { path: '/', expires: new Date(0) });
    }
    return response;
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
