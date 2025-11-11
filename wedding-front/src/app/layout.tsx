import '@/styles/globals.css';
import { ServiceWorkerProvider } from '@/components/ServiceWorkerProvider';
// import { FloatingThemeToggle } from '@/components/FloatingThemeToggle/FloatingThemeToggle';
import { WebSocketNotificationsProvider } from '@/components/WebSocketNotificationsProvider';
import siteMetadata from './metadata';

export const metadata = siteMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ServiceWorkerProvider />
        <WebSocketNotificationsProvider />
    
        {children}
      </body>
    </html>
  );
} 