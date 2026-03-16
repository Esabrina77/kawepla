import { Metadata } from 'next';


export const metadata: Metadata = {
  title: "Kawepla | Plateforme d'Organisation d'Événements & Annuaire Prestataires",
  description: "Organisez tous vos événements (mariage, anniversaire, corporate) simplement. Trouvez les meilleurs lieux et prestataires en France. Outils de gestion gratuits pour organisateurs.",
  keywords: "organisation événement, wedding planner, événementiel entreprise, location salle, traiteur, photographe, invitation numérique, gestion invités, France, Paris, Lyon, Marseille, Bordeaux, séminaire, baptême, baby shower, gala",
  authors: [{ name: 'Kawepla Team' }],
  creator: 'Kawepla',
  publisher: 'Kawepla',
  applicationName: 'Kawepla',
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
    title: "Kawepla | Plateforme d'Organisation d'Événements",
    description: "Organisez tous vos événements (mariage, anniversaire, corporate) simplement.",
    url: 'https://kawepla.kaporelo.com',
    siteName: 'Kawepla',
    images: [
      {
        url: '/images/logo.png',
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
    title: "Kawepla | Plateforme d'Organisation d'Événements",
    description: "Organisez tous vos événements (mariage, anniversaire, corporate) simplement.",
    images: ['/images/logo.png'],
    creator: '@kawepla',
  },
  manifest: '/manifest.json',
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
  appleWebApp: {
    capable: true,
    title: 'Kawepla',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png' },
    ],
    shortcut: '/icons/favicon.ico',
  },
  verification: {
    google: 'iLofx6S2vdlLlPQzyPedkFKg8QJriArtaPM65SzmL2s',
  },
  category: 'Event Management',
};

export default metadata;
