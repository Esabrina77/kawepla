import styles from './users.module.css';
import Image from 'next/image';

export default function UsersPage() {
  return (
    <div className={styles.usersContainer}>
      <div className={styles.header}>
        <h1>
          <Image
            src="/icons/guests.svg"
            alt=""
            width={32}
            height={32}
          />
          Gestion des utilisateurs
        </h1>
        <button className="superAdminButton">
          + Ajouter un utilisateur
        </button>
      </div>

      <div className={styles.filters}>
        <input
          type="search"
          placeholder="Rechercher un utilisateur..."
          className="superAdminInput"
        />
        <select className="superAdminInput">
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
          <option value="pending">En attente</option>
        </select>
      </div>

      <div className={styles.usersList}>
        <div className={styles.userCard}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              <Image
                src="/images/testimonials/julie-nicolas.jpg"
                alt=""
                width={48}
                height={48}
              />
            </div>
            <div>
              <h3>Julie & Nicolas</h3>
              <p>julie@example.com</p>
            </div>
          </div>
          <div className={styles.userMeta}>
            <span className={styles.userStatus}>Actif</span>
            <span>Créé le 12/03/2024</span>
          </div>
          <div className={styles.userStats}>
            <div>
              <strong>150</strong>
              <span>Invités</span>
            </div>
            <div>
              <strong>85%</strong>
              <span>RSVP</span>
            </div>
          </div>
          <div className={styles.userActions}>
            <button className="superAdminButton secondary">Éditer</button>
            <button className="superAdminButton secondary">Désactiver</button>
          </div>
        </div>

        {/* Répéter pour d'autres utilisateurs */}
      </div>

      <div className={styles.pagination}>
        <button className="superAdminButton secondary">Précédent</button>
        <div className={styles.pageNumbers}>
          <button className={styles.activePage}>1</button>
          <button>2</button>
          <button>3</button>
          <span>...</span>
          <button>10</button>
        </div>
        <button className="superAdminButton secondary">Suivant</button>
      </div>
    </div>
  );
} 