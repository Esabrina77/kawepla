'use client';

import { Sidebar } from '@/components/Sidebar/Sidebar';
import { TutorialGuide } from '@/components/Tutorial';
import { mainTutorialConfig } from '@/components/Tutorial/tutorialConfig';
import styles from './clientLayout.module.css';
import { featherscriptFont, harringtonFont, openDyslexicFont, poppinsFont } from '@/fonts/fonts';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TutorialGuide config={mainTutorialConfig}>
    <div className={`${styles.layout} ${featherscriptFont.variable} ${harringtonFont.variable} ${openDyslexicFont.variable} ${poppinsFont.variable}`}>
      <Sidebar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
    </TutorialGuide>
  );
} 
