'use client';

import { ArrowLeft, FileText, Shield, Users, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './mentions-legales.module.css';

export default function MentionsLegalesPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          onClick={() => router.back()}
          className={styles.backButton}
        >
          <ArrowLeft size={20} />
          Retour
        </button>
        
        <div className={styles.titleSection}>
          <div className={styles.iconContainer}>
            <FileText className={styles.icon} />
          </div>
          <h1 className={styles.title}>Mentions légales</h1>
          <p className={styles.subtitle}>
            Informations légales concernant Kawepla
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Éditeur du site</h2>
          <div className={styles.infoCard}>
            <div className={styles.infoItem}>
              <strong>Raison sociale :</strong> Kawepla
            </div>
            <div className={styles.infoItem}>
              <strong>Forme juridique :</strong> Société par actions simplifiée (SAS)
            </div>
            <div className={styles.infoItem}>
              <strong>Capital social :</strong> 10 000 €
            </div>
            <div className={styles.infoItem}>
              <strong>RCS :</strong> Paris B 123 456 789
            </div>
            <div className={styles.infoItem}>
              <strong>SIRET :</strong> 123 456 789 00012
            </div>
            <div className={styles.infoItem}>
              <strong>Code APE :</strong> 6201Z
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Siège social</h2>
          <div className={styles.infoCard}>
            <div className={styles.infoItem}>
              <strong>Adresse :</strong> 123 Rue de l'Amour, 75001 Paris, France
            </div>
            <div className={styles.infoItem}>
              <strong>Téléphone :</strong> +33 1 23 45 67 89
            </div>
            <div className={styles.infoItem}>
              <strong>Email :</strong> kawepla.kaporelo@gmail.com
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Directeur de publication</h2>
          <div className={styles.infoCard}>
            <div className={styles.infoItem}>
              <strong>Nom :</strong> [Nom du directeur]
            </div>
            <div className={styles.infoItem}>
              <strong>Fonction :</strong> Directeur général
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Hébergement</h2>
          <div className={styles.infoCard}>
            <div className={styles.infoItem}>
              <strong>Hébergeur :</strong> Vercel Inc.
            </div>
            <div className={styles.infoItem}>
              <strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
            </div>
            <div className={styles.infoItem}>
              <strong>Site web :</strong> https://vercel.com
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Propriété intellectuelle</h2>
          <p className={styles.text}>
            L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
            Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
          </p>
          <p className={styles.text}>
            La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Responsabilité</h2>
          <p className={styles.text}>
            Les informations contenues sur ce site sont aussi précises que possible et le site remis à jour à différentes périodes de l'année, 
            mais peut toutefois contenir des inexactitudes ou des omissions.
          </p>
          <p className={styles.text}>
            Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, merci de bien vouloir le signaler par email, 
            à l'adresse kawepla.kaporelo@gmail.com, en décrivant le problème de la manière la plus précise possible.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Liens hypertextes</h2>
          <p className={styles.text}>
            Des liens hypertextes peuvent être présents sur le site. L'utilisateur est informé qu'en cliquant sur ces liens, 
            il sortira du site kawepla.com. Ce dernier n'a pas de contrôle sur les pages web sur lesquelles aboutissent ces liens 
            et ne saurait en aucun cas être responsable de leur contenu.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Cookies</h2>
          <p className={styles.text}>
            Le site kawepla.com peut être amené à vous demander l'acceptation des cookies pour des besoins de statistiques et d'affichage. 
            Un cookie est une information déposée sur votre disque dur par le serveur du site que vous visitez.
          </p>
          <p className={styles.text}>
            Il contient plusieurs données qui sont stockées sur votre ordinateur dans un simple fichier texte auquel un serveur accède pour lire et enregistrer des informations.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. Droit applicable</h2>
          <p className={styles.text}>
            Tout litige en relation avec l'utilisation du site kawepla.com est soumis au droit français. 
            Il est fait attribution exclusive de juridiction aux tribunaux compétents de Paris.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>10. Contact</h2>
          <div className={styles.contactCard}>
            <div className={styles.contactItem}>
              <Mail className={styles.contactIcon} />
              <span>kawepla.kaporelo@gmail.com</span>
            </div>
            <p className={styles.contactText}>
              Pour toute question concernant ces mentions légales, vous pouvez nous contacter à l'adresse email ci-dessus.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
