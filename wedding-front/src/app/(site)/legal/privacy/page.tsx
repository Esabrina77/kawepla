import styles from '@/styles/site/legal.module.css';

export default function PrivacyPage() {
  return (
    <div className={styles.legalContainer}>
      <h1>Politique de confidentialité</h1>
      <section className={styles.legalSection}>
        <h2>1. Collecte des données</h2>
        <p>Nous collectons uniquement les données nécessaires à la création et à la gestion de votre mariage :</p>
        <ul>
          <li>Informations personnelles (nom, prénom, email)</li>
          <li>Informations relatives au mariage</li>
          <li>Liste des invités</li>
        </ul>
      </section>

      <section className={styles.legalSection}>
        <h2>2. Utilisation des données</h2>
        <p>Vos données sont utilisées exclusivement pour :</p>
        <ul>
          <li>La création de votre espace personnel</li>
          <li>L'envoi des invitations</li>
          <li>La gestion des RSVP</li>
        </ul>
      </section>

      <section className={styles.legalSection}>
        <h2>3. Protection des données</h2>
        <p>Nous mettons en œuvre toutes les mesures nécessaires pour protéger vos données personnelles.</p>
      </section>
    </div>
  );
} 