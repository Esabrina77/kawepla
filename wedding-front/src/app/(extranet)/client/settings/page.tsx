'use client';

import styles from './settings.module.css';
import Image from 'next/image';
import { useTutorial } from '@/hooks/useTutorial';
import { mainTutorialConfig } from '@/components/Tutorial/tutorialConfig';

export default function SettingsPage() {
  const tutorial = useTutorial(mainTutorialConfig);

  const handleRestartTutorial = () => {
    tutorial.restartTutorial();
  };
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
          Paramètres
        </h1>
      </div>

      <div className={styles.settingsGrid}>
        <section className={styles.settingsSection}>
          <h2>Profil</h2>
          <div className={styles.settingsCard}>
            <div className={styles.profileHeader}>
              <div className={styles.profileAvatar}>
                <Image
                  src="/images/testimonials/julie-nicolas.jpg"
                  alt=""
                  width={80}
                  height={80}
                />
                <button className="secondaryButton">Modifier</button>
              </div>
              <div className={styles.profileInfo}>
                <h3>Julie & Nicolas</h3>
                <p>julie@example.com</p>
              </div>
            </div>
            <div className={styles.settingItem}>
              <label>Noms</label>
              <input type="text" className="primaryInput" defaultValue="Julie & Nicolas" />
            </div>
            <div className={styles.settingItem}>
              <label>Email</label>
              <input type="email" className="primaryInput" defaultValue="julie@example.com" />
            </div>
            <div className={styles.settingItem}>
              <label>Téléphone</label>
              <input type="tel" className="primaryInput" defaultValue="+33 6 12 34 56 78" />
            </div>
          </div>
        </section>

        <section className={styles.settingsSection}>
          <h2>Mariage</h2>
          <div className={styles.settingsCard}>
            <div className={styles.settingItem}>
              <label>Date du mariage</label>
              <input type="date" className="primaryInput" defaultValue="2024-08-15" />
            </div>
            <div className={styles.settingItem}>
              <label>Lieu</label>
              <input type="text" className="primaryInput" defaultValue="Château de Versailles" />
            </div>
            <div className={styles.settingItem}>
              <label>Nombre d'invités estimé</label>
              <input type="number" className="primaryInput" defaultValue="150" />
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
                <label htmlFor="emailNotif">Recevoir les notifications par email</label>
              </div>
            </div>
            <div className={styles.settingItem}>
              <label>Notifications push</label>
              <div className={styles.toggle}>
                <input type="checkbox" id="pushNotif" defaultChecked />
                <label htmlFor="pushNotif">Recevoir les notifications push</label>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.settingsSection}>
          <h2>Sécurité</h2>
          <div className={styles.settingsCard}>
            <div className={styles.settingItem}>
              <label>Mot de passe</label>
              <button className="secondaryButton">Changer le mot de passe</button>
            </div>
          </div>
        </section>

        {/* <section className={styles.settingsSection}>
          <h2>Aide et formation</h2>
          <div className={styles.settingsCard}>
            <div className={styles.settingItem}>
              <label>Tutoriel interactif</label>
              <div className={styles.settingDescription}>
                <p>Découvrez ou redécouvrez les fonctionnalités de KaWePla grâce à notre guide interactif</p>
                <button 
                  className="primaryButton"
                  onClick={handleRestartTutorial}
                  style={{ marginTop: '8px' }}
                >
                  🎯 Relancer le tutoriel
                </button>
              </div>
            </div>
            <div className={styles.settingItem}>
              <label>Centre d'aide</label>
              <div className={styles.settingDescription}>
                <p>Consultez notre documentation complète et nos FAQ</p>
                <button className="secondaryButton" style={{ marginTop: '8px' }}>
                  📖 Accéder au centre d'aide
                </button>
              </div>
            </div>
          </div>
        </section> */}


      </div>

      <div className={styles.actions}>
        <button className="secondaryButton">Annuler</button>
        <button className="primaryButton">Enregistrer les modifications</button>
      </div>
    </div>
  );
} 