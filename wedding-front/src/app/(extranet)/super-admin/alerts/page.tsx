import styles from './messages.module.css';

export default function SuperAdminMessages() {
  return (
    <div className={styles.messagesContainer}>
      <h1>Messages système</h1>

      <div className={styles.filters}>
        <select className={styles.filterSelect}>
          <option value="all">Tous les types</option>
          <option value="error">Erreurs</option>
          <option value="warning">Avertissements</option>
          <option value="info">Informations</option>
        </select>

        <input 
          type="date" 
          className={styles.dateFilter}
          defaultValue={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className={styles.messagesList}>
        <div className={styles.messageCard}>
          <div className={styles.messageHeader}>
            <span className={`${styles.messageType} ${styles.error}`}>Erreur</span>
            <span className={styles.messageDate}>12/03/2024 14:30</span>
          </div>
          <div className={styles.messageContent}>
            Échec de l'envoi des invitations en masse
          </div>
          <div className={styles.messageDetails}>
            Service: Invitations
            <br />
            ID utilisateur: USER123
          </div>
        </div>

        <div className={styles.messageCard}>
          <div className={styles.messageHeader}>
            <span className={`${styles.messageType} ${styles.warning}`}>Avertissement</span>
            <span className={styles.messageDate}>12/03/2024 14:15</span>
          </div>
          <div className={styles.messageContent}>
            Utilisation CPU élevée sur le serveur principal
          </div>
          <div className={styles.messageDetails}>
            Service: Système
            <br />
            Serveur: PROD-01
          </div>
        </div>

        <div className={styles.messageCard}>
          <div className={styles.messageHeader}>
            <span className={`${styles.messageType} ${styles.info}`}>Info</span>
            <span className={styles.messageDate}>12/03/2024 14:00</span>
          </div>
          <div className={styles.messageContent}>
            Sauvegarde quotidienne terminée avec succès
          </div>
          <div className={styles.messageDetails}>
            Service: Backup
            <br />
            Taille: 2.3GB
          </div>
        </div>
      </div>
    </div>
  );
} 