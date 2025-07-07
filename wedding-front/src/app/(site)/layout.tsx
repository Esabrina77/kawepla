import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/accessibility.css";
import { Navigation } from '@/components/Navigation/Navigation';
import { Footer } from '@/components/Footer/Footer';
import styles from '@/styles/layout.module.css';

export const metadata: Metadata = {
  title: "WeddingPlan - Créez votre invitation de mariage unique",
  description: "Créez des invitations de mariage élégantes et gérez vos invités facilement avec WeddingPlan",
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <Navigation />
      <main className={styles.mainContent}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
