import type { Metadata, Viewport } from 'next';
import { Inter, Anton, Funnel_Display } from 'next/font/google';
import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const anton = Anton({ weight: "400", subsets: ['latin'], variable: '--font-anton' });
const funnelDisplay = Funnel_Display({ subsets: ['latin'], variable: '--font-funnel' });

export const metadata: Metadata = {
  title: 'ForgeGuard - Personal Cyber Safety Coach',
  description: 'Your friendly AI helper that protects you from phishing, scams, and risky links.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${anton.variable} ${funnelDisplay.variable}`}>
      <body suppressHydrationWarning className="antialiased h-[100dvh] overflow-hidden bg-[#06080b] text-[#ffffff]">
        <ClerkProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
