import { NextRequest, NextResponse } from 'next/server';
import { verifySessionJwt } from './lib/jwt';

const PUBLIC_PATHS = ['/', '/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Next static assets and API routes for auth/register by default
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images')
  ) {
    return NextResponse.next();
  }

  // Public pages
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('session')?.value;
  const session = token ? await verifySessionJwt(token) : null;

  // Require login for all other pages
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only areas
  const isAdminArea =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/approvals') ||
    pathname.startsWith('/rooms') ||
    pathname.startsWith('/equipment') ||
    pathname.startsWith('/bookings');

  if (isAdminArea && session.role !== 'admin') {
    const redirectUrl = new URL('/user/booking', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

