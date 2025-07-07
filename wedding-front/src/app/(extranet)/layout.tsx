import type { Metadata } from "next";
import styles from './extranetLayout.module.css';
import { featherscriptFont, harringtonFont, openDyslexicFont } from '@/fonts/fonts';

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
    <div className={`${styles.layout} ${featherscriptFont.variable} ${harringtonFont.variable} ${openDyslexicFont.variable}`}>
      {children}
    </div>
  );
} 