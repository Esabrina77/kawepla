import type { Metadata } from "next";
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';

export const metadata: Metadata = {
  title: "KaWePla - Créez votre invitation d'événement unique",
  description: "Créez des invitations d'événements élégantes et gérez vos invités facilement avec KaWePla",
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      <Header />
      <main style={{flex: 1}}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
