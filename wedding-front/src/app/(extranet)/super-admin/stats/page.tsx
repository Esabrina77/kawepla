import styles from './stats.module.css';
import Image from 'next/image';

export default function StatsPage() {
  return (
    <div className={styles.statsContainer}>
      <div className={styles.header}>
        <h1>
          <Image
            src="/icons/stats.svg"
            alt=""
            width={32}
            height={32}
          />
          Statistiques globales
        </h1>
        <div className={styles.dateFilter}>
          <select className="superAdminInput">
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
            <option value="365">12 derniers mois</option>
          </select>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Image
              src="/icons/guests.svg"
              alt=""
              width={24}
              height={24}
            />
          </div>
          <div className={styles.statInfo}>
            <h3>Utilisateurs actifs</h3>
            <div className={styles.statValue}>
              <strong>1,234</strong>
              <span className={`${styles.trend} ${styles.positive}`}>+12%</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Image
              src="/icons/rsvp.svg"
              alt=""
              width={24}
              height={24}
            />
          </div>
          <div className={styles.statInfo}>
            <h3>Taux de réponse RSVP</h3>
            <div className={styles.statValue}>
              <strong>85%</strong>
              <span className={`${styles.trend} ${styles.positive}`}>+5%</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Image
              src="/icons/design.svg"
              alt=""
              width={24}
              height={24}
            />
          </div>
          <div className={styles.statInfo}>
            <h3>Designs créés</h3>
            <div className={styles.statValue}>
              <strong>3,567</strong>
              <span className={`${styles.trend} ${styles.positive}`}>+8%</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Image
              src="/icons/money.svg"
              alt=""
              width={24}
              height={24}
            />
          </div>
          <div className={styles.statInfo}>
            <h3>Revenus mensuels</h3>
            <div className={styles.statValue}>
              <strong>€12,345</strong>
              <span className={`${styles.trend} ${styles.positive}`}>+15%</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3>Croissance des utilisateurs</h3>
          <div className={styles.chartPlaceholder}>
            {/* Intégrer un graphique ici */}
            <div className={styles.mockChart}></div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Distribution des plans</h3>
          <div className={styles.chartPlaceholder}>
            {/* Intégrer un graphique ici */}
            <div className={styles.mockChart}></div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Activité par région</h3>
          <div className={styles.chartPlaceholder}>
            {/* Intégrer un graphique ici */}
            <div className={styles.mockChart}></div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Performance des fonctionnalités</h3>
          <div className={styles.chartPlaceholder}>
            {/* Intégrer un graphique ici */}
            <div className={styles.mockChart}></div>
          </div>
        </div>
      </div>
    </div>
  );
} 