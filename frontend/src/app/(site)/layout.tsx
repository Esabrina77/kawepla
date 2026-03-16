import styles from './siteLayout.module.css';

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className={styles.siteWrapper}>
            {children}
        </div>
    );
}
