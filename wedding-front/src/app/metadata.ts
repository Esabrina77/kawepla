import { Metadata } from 'next';

const metadata: Metadata = {
  title: 'KaWePla - Plateforme de gestion de mariage moderne',
  description: 'Créez, personnalisez et gérez vos invitations de mariage en ligne. Suivi des invités, designs élégants, gestion RSVP, messagerie et plus.',
  keywords: [
    'mariage', 'invitation mariage', 'gestion mariage', 'RSVP', 'wedding planner', 'liste invités', 'organisation mariage', 'événement', 'invitation digitale', 'design invitation', 'KaWePla'
  ],
  manifest: '/manifest.json',
  themeColor: '#D4B895',
  icons: {
    icon: [
      { url: '/icons/logo-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/logo-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/logo-192.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: { url: '/icons/apple-icon.png' }
  },
  openGraph: {
    title: 'KaWePla - Plateforme de gestion de mariage moderne',
    description: 'Créez, personnalisez et gérez vos invitations de mariage en ligne. Suivi des invités, designs élégants, gestion RSVP, messagerie et plus.',
    url: 'https://kawepla.kaporelo.com',
    siteName: 'KaWePla',
    images: [
      {
        url: '/images/logo.png',
        width: 512,
        height: 512,
        alt: 'KaWePla Logo'
      }
    ],
    locale: 'fr_FR',
    type: 'website'
  }
};

export default metadata; 