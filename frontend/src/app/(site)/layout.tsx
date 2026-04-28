import { Header } from "@/components/Kavent/Header";
import { Footer } from "@/components/Kavent/Footer";
import styles from './siteLayout.module.css';

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className={styles.siteWrapper}>
            <Header />
            <main>{children}</main>
            <Footer />
        </div>
    );
}
