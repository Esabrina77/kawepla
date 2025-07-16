import type { Metadata } from "next";
import styles from './extranetLayout.module.css';
import { featherscriptFont, harringtonFont, openDyslexicFont } from '@/fonts/fonts';
import { ToastProvider } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: "KaWePla - Espace personnel",
  description: "Gérez votre mariage en toute simplicité avec KaWePla",
};

export default function ExtranetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className={`${styles.layout} ${featherscriptFont.variable} ${harringtonFont.variable} ${openDyslexicFont.variable}`}>
        {children}
      </div>
    </ToastProvider>
  );
} 