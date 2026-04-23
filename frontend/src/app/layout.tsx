import '@/styles/globals.css';
import { ServiceWorkerProvider } from '@/components/ServiceWorkerProvider';
import { WebSocketNotificationsProvider } from '@/components/WebSocketNotificationsProvider';
import siteMetadata from './metadata';
import { Montserrat, Cinzel } from 'next/font/google';
import { ToastProvider } from '@/components/ui/toast';
import { ModalProvider } from '@/components/ui/modal-provider';
import JsonLd from '@/components/Seo/JsonLd';
import Script from 'next/script';

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
          <ModalProvider>
            {children}
          </ModalProvider>
        </ToastProvider>

        {/* TikTok Pixel */}
        <Script id="tiktok-pixel" strategy="afterInteractive">{`
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
            var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
            ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
            ttq.load('D6ON4U3C77UET383S8PG');
            ttq.page();
          }(window, document, 'ttq');
        `}</Script>
      </body>
    </html>
  );
}