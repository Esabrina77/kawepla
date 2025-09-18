import type { Metadata } from "next";
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';

export const metadata: Metadata = {
  title: "Kawepla - Plateforme complète pour organiser vos événements",
  description: "Organisez tous vos événements avec Kawepla : invitations numériques, gestion des invités, albums photos, messagerie et prestataires",
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
