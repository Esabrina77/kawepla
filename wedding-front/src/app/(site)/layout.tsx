import type { Metadata } from "next";
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';

// Les métadonnées sont gérées par le layout racine
// Pas besoin de les redéfinir ici pour éviter les conflits

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
