import '@/styles/globals.css';
import { ServiceWorkerProvider } from '@/components/ServiceWorkerProvider';
import { WebSocketNotificationsProvider } from '@/components/WebSocketNotificationsProvider';
import siteMetadata from './metadata';
import { Montserrat, Cinzel } from 'next/font/google';
import { ToastProvider } from '@/components/ui/toast';
import JsonLd from '@/components/Seo/JsonLd';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-cinzel',
  display: 'swap',
});

export const metadata = siteMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${montserrat.variable} ${cinzel.variable}`}>
      <head>
        <JsonLd />
      </head>
      <body suppressHydrationWarning>
        <ServiceWorkerProvider />
        <WebSocketNotificationsProvider />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}