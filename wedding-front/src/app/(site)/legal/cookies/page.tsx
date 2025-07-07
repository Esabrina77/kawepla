import styles from '@/styles/site/legal.module.css';

export default function CookiesPage() {
  return (
    <div className={styles.legalContainer}>
      <h1>Politique des cookies</h1>

      <section className={styles.legalSection}>
        <h2>1. Qu'est-ce qu'un cookie ?</h2>
        <p>Un cookie est un petit fichier texte stocké sur votre navigateur lors de la visite d'un site web.</p>
      </section>

      <section className={styles.legalSection}>
        <h2>2. Notre utilisation des cookies</h2>
        <p>Nous utilisons les cookies pour :</p>
        <ul>
          <li>Maintenir votre session connectée</li>
          <li>Mémoriser vos préférences d'accessibilité</li>
          <li>Améliorer votre expérience utilisateur</li>
          <li>Analyser l'utilisation du site</li>
        </ul>
      </section>

      <section className={styles.legalSection}>
        <h2>3. Gestion des cookies</h2>
        <p>Vous pouvez à tout moment :</p>
        <ul>
          <li>Consulter les cookies utilisés</li>
          <li>Accepter ou refuser les cookies non essentiels</li>
          <li>Supprimer les cookies existants</li>
        </ul>
      </section>
    </div>
  );
} 