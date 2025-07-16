import '@/styles/globals.css';
import { 
  featherscriptFont, 
  harringtonFont, 
  openDyslexicFont, 
  openSansFont, 
  poppinsFont
} from '@/fonts/fonts';
import { ToastProvider } from '@/components/ui/toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${featherscriptFont.variable} ${harringtonFont.variable} ${openDyslexicFont.variable} ${openSansFont.variable} ${poppinsFont.variable}`} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#D4B895" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/logo-16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/logo-32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/logo-192.png" />
        <link rel="apple-touch-icon" href="/icons/apple-icon.png" />
      </head>
      <body suppressHydrationWarning>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
} 