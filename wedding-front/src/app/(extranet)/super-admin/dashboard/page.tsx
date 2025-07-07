import styles from './dashboard.module.css';
import Image from 'next/image';

export default function SuperAdminDashboard() {
  return (
    <div className={styles.dashboardContainer}>
      <h1>
        <Image
          src="/icons/stats.svg"
          alt=""
          width={32}
          height={32}
        />
        Tableau de bord
      </h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Utilisateurs</h3>
          <div className={styles.statValue}>1,234</div>
          <div className={styles.statChange}>
            <Image
              src="/icons/stats.svg"
              alt=""
              width={16}
              height={16}
            />
            +12% cette semaine
          </div>
        </div>

        <div className={styles.statCard}>
          <h3>Mariages actifs</h3>
          <div className={styles.statValue}>567</div>
          <div className={styles.statChange}>
            <Image
              src="/icons/stats.svg"
              alt=""
              width={16}
              height={16}
            />
            +8% cette semaine
          </div>
        </div>

        <div className={styles.statCard}>
          <h3>Invitations envoyées</h3>
          <div className={styles.statValue}>12,345</div>
          <div className={styles.statChange}>
            <Image
              src="/icons/stats.svg"
              alt=""
              width={16}
              height={16}
            />
            +15% cette semaine
          </div>
        </div>

        <div className={styles.statCard}>
          <h3>Taux de réponse</h3>
          <div className={styles.statValue}>78%</div>
          <div className={styles.statChange}>
            <Image
              src="/icons/stats.svg"
              alt=""
              width={16}
              height={16}
            />
            +2% cette semaine
          </div>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <h2>Activité récente</h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <Image
                src="/icons/guests.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={styles.activityContent}>
              <div className={styles.activityTitle}>Nouveau mariage créé</div>
              <div className={styles.activityMeta}>Il y a 2 heures • Julie et Thomas</div>
            </div>
          </div>

          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <Image
                src="/icons/rsvp.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={styles.activityContent}>
              <div className={styles.activityTitle}>Pic d'envoi d'invitations</div>
              <div className={styles.activityMeta}>Il y a 4 heures • 500 invitations</div>
            </div>
          </div>

          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <Image
                src="/icons/design.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={styles.activityContent}>
              <div className={styles.activityTitle}>Nouveau template ajouté</div>
              <div className={styles.activityMeta}>Il y a 6 heures • Template Romantique</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 