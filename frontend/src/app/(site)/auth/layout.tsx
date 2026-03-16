import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from '@/styles/site/auth.module.css';

export default function AuthRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative' }}>
      <Link href="/" className={styles.backToHome}>
        <ArrowLeft size={18} />
        <span>Accueil</span>
      </Link>
      {children}
    </div>
  );
}
