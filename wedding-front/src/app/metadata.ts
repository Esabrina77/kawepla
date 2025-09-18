import { Metadata } from 'next';
import { SITE_CONFIG } from '@/config/siteConfig';

const metadata: Metadata = {
  title: SITE_CONFIG.seo.titre,
  description: SITE_CONFIG.seo.description,
  keywords: SITE_CONFIG.seo.keywords,
  authors: [{ name: 'Kawepla Team' }],
  creator: 'Kawepla',
  publisher: 'Kawepla',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://kawepla.kaporelo.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SITE_CONFIG.seo.titre,
    description: SITE_CONFIG.seo.description,
    url: 'https://kawepla.kaporelo.com',
    siteName: 'Kawepla',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Kawepla - Plateforme d\'invitations d\'événements numériques',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.seo.titre,
    description: SITE_CONFIG.seo.description,
    images: ['/images/twitter-image.jpg'],
  },
  manifest: '/manifest.json',
  themeColor: '#D4B895',
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
  icons: {
    icon: [
      { url: '/icons/logo-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/logo-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/logo-192.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: { url: '/icons/apple-icon.png' },
    shortcut: '/favicon.ico',
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default metadata; 