import styles from './settings.module.css';
import Image from 'next/image';

export default function SettingsPage() {
  return (
    <div className={styles.settingsContainer}>
      <div className={styles.header}>
        <h1>
          <Image
            src="/icons/planning.svg"
            alt=""
            width={32}
            height={32}
          />
          Paramètres généraux
        </h1>
      </div>

      <div className={styles.settingsGrid}>
        <section className={styles.settingsSection}>
          <h2>Configuration de l'application</h2>
          <div className={styles.settingsCard}>
            <div className={styles.settingItem}>
              <label>Nom de l'application</label>
              <input type="text" className="superAdminInput" defaultValue="KaWePla" />
            </div>
            <div className={styles.settingItem}>
              <label>URL du site</label>
              <input type="url" className="superAdminInput" defaultValue="https://kawepla.com" />
            </div>
            <div className={styles.settingItem}>
              <label>Email de support</label>
              <input type="email" className="superAdminInput" defaultValue="support@kawepla.com" />
            </div>
            <div className={styles.settingItem}>
              <label>Maintenance mode</label>
              <div className={styles.toggle}>
                <input type="checkbox" id="maintenance" />
                <label htmlFor="maintenance">Activer le mode maintenance</label>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.settingsSection}>
          <h2>Sécurité</h2>
          <div className={styles.settingsCard}>
            <div className={styles.settingItem}>
              <label>Durée de session (minutes)</label>
              <input type="number" className="superAdminInput" defaultValue="60" />
            </div>
            <div className={styles.settingItem}>
              <label>Tentatives de connexion max</label>
              <input type="number" className="superAdminInput" defaultValue="5" />
            </div>
            <div className={styles.settingItem}>
              <label>2FA</label>
              <div className={styles.toggle}>
                <input type="checkbox" id="2fa" defaultChecked />
                <label htmlFor="2fa">Activer l'authentification à deux facteurs</label>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.settingsSection}>
          <h2>Stockage</h2>
          <div className={styles.settingsCard}>
            <div className={styles.settingItem}>
              <label>Taille max des fichiers (MB)</label>
              <input type="number" className="superAdminInput" defaultValue="10" />
            </div>
            <div className={styles.settingItem}>
              <label>Types de fichiers autorisés</label>
              <input type="text" className="superAdminInput" defaultValue=".jpg,.png,.pdf,.doc,.docx" />
            </div>
            <div className={styles.settingItem}>
              <label>Stockage par utilisateur (GB)</label>
              <input type="number" className="superAdminInput" defaultValue="5" />
            </div>
          </div>
        </section>

        <section className={styles.settingsSection}>
          <h2>Notifications</h2>
          <div className={styles.settingsCard}>
            <div className={styles.settingItem}>
              <label>Notifications par email</label>
              <div className={styles.toggle}>
                <input type="checkbox" id="emailNotif" defaultChecked />
                <label htmlFor="emailNotif">Activer les notifications par email</label>
              </div>
            </div>
            <div className={styles.settingItem}>
              <label>Notifications push</label>
              <div className={styles.toggle}>
                <input type="checkbox" id="pushNotif" defaultChecked />
                <label htmlFor="pushNotif">Activer les notifications push</label>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.actions}>
        <button className="superAdminButton secondary">Annuler</button>
        <button className="superAdminButton">Enregistrer les modifications</button>
      </div>
    </div>
  );
} 