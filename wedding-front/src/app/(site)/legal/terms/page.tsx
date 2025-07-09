import styles from '@/styles/site/legal.module.css';

export default function TermsPage() {
  return (
    <div className={styles.legalContainer}>
      <h1>Conditions générales d'utilisation</h1>
      
      <section className={styles.legalSection}>
        <h2>1. Objet</h2>
        <p>Les présentes conditions générales régissent l'utilisation de la plateforme Kawepla, destinée à la création et la gestion d'invitations de mariage.</p>
      </section>

      <section className={styles.legalSection}>
        <h2>2. Services proposés</h2>
        <p>Kawepla propose les services suivants :</p>
        <ul>
          <li>Création d'invitations personnalisées</li>
          <li>Gestion des invités</li>
          <li>Suivi des RSVP</li>
          <li>Outils de planification</li>
        </ul>
      </section>

      <section className={styles.legalSection}>
        <h2>3. Responsabilités</h2>
        <p>L'utilisateur s'engage à :</p>
        <ul>
          <li>Fournir des informations exactes</li>
          <li>Respecter les droits des tiers</li>
          <li>Ne pas utiliser le service à des fins illégales</li>
        </ul>
      </section>
    </div>
  );
} 