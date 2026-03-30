import { clerkMiddleware } from '@clerk/nextjs/server';
import createIntlMiddleware from 'next-intl/middleware';

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'en',
});

// Keep core app routes public to support Guest Mode.
export default clerkMiddleware(async (_auth, req) => {
  return intlMiddleware(req);
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
