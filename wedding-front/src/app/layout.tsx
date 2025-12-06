import '@/styles/globals.css';
import { ServiceWorkerProvider } from '@/components/ServiceWorkerProvider';
// import { FloatingThemeToggle } from '@/components/FloatingThemeToggle/FloatingThemeToggle';
import { WebSocketNotificationsProvider } from '@/components/WebSocketNotificationsProvider';
import siteMetadata from './metadata';

export const metadata = siteMetadata;

import { ToastProvider } from '@/components/ui/toast';

import JsonLd from '@/components/Seo/JsonLd';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <JsonLd />
      </head>
      <body suppressHydrationWarning className="font-sans">
        <ServiceWorkerProvider />
        <WebSocketNotificationsProvider />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}