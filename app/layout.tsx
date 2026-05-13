import type { Metadata } from 'next';
import { Inter, Space_Grotesk, Anybody } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import ThemeProvider from '@/components/ThemeProvider';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';
import { AuthModalProvider } from '@/components/auth/AuthModalProvider';
import WidgetConfig from '@/components/WidgetConfig';
import SearchProvider from '@/components/SearchOverlay';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const anybody = Anybody({ subsets: ['latin'], variable: '--font-anybody' });

export const metadata: Metadata = {
  metadataBase: new URL('https://activesports.live'),
  title: {
    default: 'ActiveSports — Live Scores, Fixtures & Stats',
    template: '%s | ActiveSports',
  },
  description:
    'Real-time football scores, live fixtures, standings, player stats and odds. Your ultimate sports hub for Premier League, Champions League, La Liga, and FIFA World Cup 2026.',
  keywords: ['football scores', 'live scores', 'Premier League', 'Champions League', 'World Cup 2026', 'fixtures', 'standings'],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'ActiveSports',
    title: 'ActiveSports — Live Scores & Stats',
    description: 'Real-time football scores, fixtures, standings and player stats.',
    url: 'https://activesports.live',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ActiveSports — Next-Gen Football Intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ActiveSports — Live Scores & Stats',
    description: 'Real-time football scores, fixtures, standings and player stats.',
    images: ['/og-image.png'],
    creator: '@activesports',
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  verification: {
    google: 'google-site-verification-code', // Replace with your actual code
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'ActiveSports',
    statusBarStyle: 'black-translucent',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${anybody.variable} dark`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SessionProvider session={session}>
            <ThemeProvider>
              <AuthModalProvider>
                <SearchProvider>
                  <Navbar />
                  <KeyboardShortcuts />
                  <ErrorBoundary>
                    <main className="min-h-screen pt-20 sm:pt-24">
                      {children}
                    </main>
                  </ErrorBoundary>
                  <Footer />
                </SearchProvider>
              </AuthModalProvider>
            </ThemeProvider>
        </SessionProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'ActiveSports',
              url: 'https://activesports.live',
              description: 'Real-time football scores, live fixtures, standings, player stats and odds.',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://activesports.live/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <WidgetConfig {...(process.env.FOOTBALL_API_KEY ? { apiKey: process.env.FOOTBALL_API_KEY } : {})} />
        <script type="module" src="https://widgets.api-sports.io/3.1.0/widgets.js" async></script>
      </body>
    </html>
  );
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'api-sports-widget': any;
    }
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'api-sports-widget': any;
      }
    }
  }
}