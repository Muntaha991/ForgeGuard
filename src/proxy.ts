import { clerkMiddleware } from '@clerk/nextjs/server';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'en',
});

const handler = clerkMiddleware(async (_auth, req) => {
  if (req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  return intlMiddleware(req);
});

// Keep core app routes public to support Guest Mode.
export function proxy(req: NextRequest) {
  return handler(req);
}

export default handler;

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
