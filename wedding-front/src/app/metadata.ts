import { Metadata } from 'next';

const metadata: Metadata = {
  title: 'KaWePla - Votre plateforme de gestion de mariage',
  description: 'Créez et gérez vos invitations de mariage en toute simplicité',
  manifest: '/manifest.json',
  themeColor: '#D4B895',
  icons: {
    icon: [
      { url: '/icons/logo-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/logo-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/logo-192.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: { url: '/icons/apple-icon.png' }
  }
};

export default metadata; 