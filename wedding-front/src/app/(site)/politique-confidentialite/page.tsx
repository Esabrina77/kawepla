'use client';

import { ArrowLeft, Shield, Eye, Lock, Database, Users, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './politique-confidentialite.module.css';

export default function PolitiqueConfidentialitePage() {
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
            <Shield className={styles.icon} />
          </div>
          <h1 className={styles.title}>Politique de confidentialité</h1>
          <p className={styles.subtitle}>
            Comment nous protégeons et utilisons vos données personnelles
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Introduction</h2>
          <p className={styles.text}>
            Kawepla s'engage à protéger votre vie privée et vos données personnelles. Cette politique de confidentialité 
            explique comment nous collectons, utilisons, stockons et protégeons vos informations personnelles lorsque vous 
            utilisez notre service d'invitations numériques.
          </p>
          <p className={styles.text}>
            En utilisant notre service, vous acceptez les pratiques décrites dans cette politique de confidentialité.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Données collectées</h2>
          
          <div className={styles.dataCard}>
            <div className={styles.dataHeader}>
              <Database className={styles.dataIcon} />
              <h3>Données des organisateurs</h3>
            </div>
            <ul className={styles.dataList}>
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Informations de facturation</li>
              <li>Préférences de compte</li>
            </ul>
          </div>

          <div className={styles.dataCard}>
            <div className={styles.dataHeader}>
              <Users className={styles.dataIcon} />
              <h3>Données des invités</h3>
            </div>
            <ul className={styles.dataList}>
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone (optionnel)</li>
              <li>Réponses </li>
              <li>Photos partagées (optionnel)</li>
            </ul>
          </div>

          <div className={styles.dataCard}>
            <div className={styles.dataHeader}>
              <Eye className={styles.dataIcon} />
              <h3>Données techniques</h3>
            </div>
            <ul className={styles.dataList}>
              {/* <li>Adresse IP</li>
              <li>Type de navigateur</li>
              <li>Pages visitées</li> */}
              <li>Durée de session</li>
              <li>Cookies et technologies similaires</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Utilisation des données</h2>
          <p className={styles.text}>
            Nous utilisons vos données personnelles pour les finalités suivantes :
          </p>
          <ul className={styles.usageList}>
            <li><strong>Fourniture du service :</strong> Création et gestion de vos invitations d'événements</li>
            <li><strong>Communication :</strong> Envoi d'invitations, rappels et notifications</li>
            <li><strong>Gestion des RSVP :</strong> Collecte et traitement des réponses des invités</li>
            <li><strong>Support client :</strong> Assistance et résolution de problèmes</li>
            <li><strong>Facturation :</strong> Traitement des paiements et gestion des abonnements</li>
            <li><strong>Amélioration :</strong> Analyse et amélioration de nos services</li>
            <li><strong>Sécurité :</strong> Protection contre la fraude et les abus</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Base légale du traitement</h2>
          <p className={styles.text}>
            Nous traitons vos données personnelles sur la base de :
          </p>
          <ul className={styles.legalList}>
            <li><strong>Exécution du contrat :</strong> Pour fournir nos services d'invitations</li>
            <li><strong>Intérêt légitime :</strong> Pour améliorer nos services et assurer la sécurité</li>
            <li><strong>Consentement :</strong> Pour l'envoi de communications marketing (optionnel)</li>
            <li><strong>Obligation légale :</strong> Pour respecter nos obligations comptables et fiscales</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Partage des données</h2>
          <p className={styles.text}>
            Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations uniquement dans les cas suivants :
          </p>
          <ul className={styles.sharingList}>
            <li><strong>Prestataires de services :</strong> Pour l'hébergement, l'email, les paiements</li>
            <li><strong>Obligation légale :</strong> Si requis par la loi ou les autorités compétentes</li>
            <li><strong>Protection des droits :</strong> Pour protéger nos droits, propriété ou sécurité</li>
            <li><strong>Avec votre consentement :</strong> Dans d'autres cas avec votre autorisation explicite</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Sécurité des données</h2>
          <div className={styles.securityCard}>
            <Lock className={styles.securityIcon} />
            <div className={styles.securityContent}>
              <h3>Mesures de protection</h3>
              <ul className={styles.securityList}>
                <li>Chiffrement SSL/TLS pour toutes les transmissions</li>
                <li>Stockage sécurisé avec chiffrement au repos</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Surveillance continue de la sécurité</li>
                <li>Sauvegardes régulières et sécurisées</li>
                <li>Formation du personnel sur la protection des données</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Conservation des données</h2>
          <p className={styles.text}>
            Nous conservons vos données personnelles uniquement le temps nécessaire aux finalités pour lesquelles 
            elles ont été collectées :
          </p>
          <ul className={styles.retentionList}>
            <li><strong>Comptes actifs :</strong> Pendant la durée de votre abonnement</li>
            <li><strong>Données d'événements :</strong> 1 an après la fin de l'événement</li>
            <li><strong>Données de facturation :</strong> 10 ans (obligation légale)</li>
            <li><strong>Données de support :</strong> 1 an après la dernière interaction</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Vos droits (RGPD)</h2>
          <p className={styles.text}>
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
          </p>
          <div className={styles.rightsGrid}>
            <div className={styles.rightCard}>
              <h4>Droit d'accès</h4>
              <p>Obtenir une copie de vos données personnelles</p>
            </div>
            <div className={styles.rightCard}>
              <h4>Droit de rectification</h4>
              <p>Corriger des données inexactes ou incomplètes</p>
            </div>
            <div className={styles.rightCard}>
              <h4>Droit à l'effacement</h4>
              <p>Demander la suppression de vos données</p>
            </div>
            <div className={styles.rightCard}>
              <h4>Droit à la portabilité</h4>
              <p>Récupérer vos données dans un format structuré</p>
            </div>
            <div className={styles.rightCard}>
              <h4>Droit d'opposition</h4>
              <p>Vous opposer au traitement de vos données</p>
            </div>
            <div className={styles.rightCard}>
              <h4>Droit de limitation</h4>
              <p>Limiter le traitement de vos données</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. Cookies</h2>
          <p className={styles.text}>
            Notre site utilise des cookies pour améliorer votre expérience utilisateur. Les cookies sont de petits 
            fichiers texte stockés sur votre appareil qui nous aident à :
          </p>
          <ul className={styles.cookieList}>
            <li>Mémoriser vos préférences</li>
            <li>Analyser l'utilisation du site</li>
            <li>Personnaliser le contenu</li>
            <li>Assurer la sécurité</li>
          </ul>
          <p className={styles.text}>
            Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>10. Modifications</h2>
          <p className={styles.text}>
            Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications importantes 
            vous seront notifiées par email ou via une notification sur notre site. La date de dernière mise à jour 
            est indiquée en bas de cette page.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>11. Contact</h2>
          <div className={styles.contactCard}>
            <div className={styles.contactItem}>
              <Mail className={styles.contactIcon} />
              <span>kawepla.kaporelo@gmail.com</span>
            </div>
            <p className={styles.contactText}>
              Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
              vous pouvez nous contacter à l'adresse email ci-dessus.
            </p>
            <p className={styles.contactText}>
              <strong>Délégué à la Protection des Données :</strong> dpo@kawepla.com
            </p>
          </div>
        </section>

        <div className={styles.lastUpdated}>
          <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </div>
  );
}
