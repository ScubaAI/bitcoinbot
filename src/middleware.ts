import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './lib/i18n/config';

// Cookie name for storing user preference
const LOCALE_COOKIE = 'bitcoin-agent-locale';

// Get locale from various sources (priority order)
function getLocale(request: NextRequest): string {
  // 1. Check cookie (user explicit preference)
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  // 2. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    // Parse header: "es-ES,es;q=0.9,en;q=0.8" -> ['es', 'en']
    const preferredLocales = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase().slice(0, 2))
      .filter(Boolean);
    
    // Find first match
    const matchedLocale = preferredLocales.find(lang => 
      locales.includes(lang as any)
    );
    if (matchedLocale) return matchedLocale;
  }

  // 3. Default
  return defaultLocale;
}

// Check if pathname has valid locale
function pathnameHasLocale(pathname: string): boolean {
  return locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
}

// Get locale from pathname
function getLocaleFromPathname(pathname: string): string | null {
  const firstSegment = pathname.split('/')[1];
  return locales.includes(firstSegment as any) ? firstSegment : null;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip if already has locale
  if (pathnameHasLocale(pathname)) {
    // Optional: Set/update cookie with current locale
    const currentLocale = getLocaleFromPathname(pathname);
    const response = NextResponse.next();
    
    if (currentLocale) {
      response.cookies.set(LOCALE_COOKIE, currentLocale, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      });
    }
    
    // Add locale header for API routes (if needed)
    if (pathname.startsWith('/api/')) {
      response.headers.set('x-locale', currentLocale || defaultLocale);
    }
    
    return response;
  }

  // Determine best locale
  const locale = getLocale(request);
  
  // Create new URL with locale prefix
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  
  // Copy search params
  newUrl.search = request.nextUrl.search;

  // Redirect with temporary status (307)
  const response = NextResponse.redirect(newUrl, 307);
  
  // Set locale cookie
  response.cookies.set(LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (whitepaper.pdf, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$).*)',
  ],
};