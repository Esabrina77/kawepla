'use client';

import { ArrowLeft, FileCheck, AlertTriangle, Users, CreditCard, Shield, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './conditions-utilisation.module.css';

export default function ConditionsUtilisationPage() {
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
            <FileCheck className={styles.icon} />
          </div>
          <h1 className={styles.title}>Conditions d'utilisation</h1>
          <p className={styles.subtitle}>
            Termes et conditions d'utilisation de la plateforme Kawepla
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Acceptation des conditions</h2>
          <p className={styles.text}>
            En accédant et en utilisant la plateforme Kawepla, vous acceptez d'être lié par ces conditions d'utilisation. 
            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
          </p>
          <p className={styles.text}>
            Ces conditions s'appliquent à tous les utilisateurs de la plateforme, y compris les organisateurs d'événements 
            et les invités.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Description du service</h2>
          <p className={styles.text}>
            Kawepla est une plateforme numérique qui permet de créer, personnaliser et gérer des invitations d'événements 
            en ligne. Nos services incluent :
          </p>
          <ul className={styles.serviceList}>
            <li>Création d'invitations numériques personnalisées</li>
            <li>Gestion des listes d'invités</li>
            <li>Système de RSVP en ligne</li>
            <li>Partage d'albums photos</li>
            <li>Outils de communication avec les invités</li>
            <li>Analytics et statistiques d'événements</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Inscription et compte utilisateur</h2>
          
          <div className={styles.accountCard}>
            <Users className={styles.accountIcon} />
            <div className={styles.accountContent}>
              <h3>Création de compte</h3>
              <ul className={styles.accountList}>
                <li>Vous devez fournir des informations exactes et à jour</li>
                <li>Vous êtes responsable de la confidentialité de votre compte</li>
                <li>Vous devez notifier immédiatement toute utilisation non autorisée</li>
                <li>Un seul compte par personne physique ou morale</li>
              </ul>
            </div>
          </div>

          <div className={styles.warningCard}>
            <AlertTriangle className={styles.warningIcon} />
            <div className={styles.warningContent}>
              <h3>Responsabilités de l'utilisateur</h3>
              <p>
                Vous êtes entièrement responsable de toutes les activités qui se produisent sous votre compte. 
                Kawepla ne peut être tenu responsable des dommages résultant d'une utilisation non autorisée de votre compte.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Utilisation acceptable</h2>
          <p className={styles.text}>
            Vous vous engagez à utiliser notre service de manière légale et éthique. Il est interdit de :
          </p>
          <ul className={styles.prohibitedList}>
            <li>Utiliser le service à des fins illégales ou non autorisées</li>
            <li>Transmettre du contenu offensant, diffamatoire ou inapproprié</li>
            <li>Violer les droits de propriété intellectuelle d'autrui</li>
            <li>Transmettre des virus, malwares ou codes malveillants</li>
            <li>Tenter de contourner les mesures de sécurité</li>
            <li>Utiliser des robots ou scripts automatisés sans autorisation</li>
            <li>Collecter des informations sur d'autres utilisateurs</li>
            <li>Impersonner une autre personne ou entité</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Contenu utilisateur</h2>
          <p className={styles.text}>
            Vous conservez tous les droits sur le contenu que vous créez et partagez via notre plateforme. 
            En utilisant nos services, vous nous accordez une licence limitée pour :
          </p>
          <ul className={styles.licenseList}>
            <li>Héberger, stocker et afficher votre contenu</li>
            <li>Transmettre votre contenu aux invités de vos événements</li>
            <li>Effectuer des sauvegardes et des copies de sécurité</li>
            <li>Améliorer nos services et développer de nouvelles fonctionnalités</li>
          </ul>
          <p className={styles.text}>
            Vous garantissez que vous avez tous les droits nécessaires sur le contenu que vous partagez 
            et que ce contenu ne viole aucune loi ou droit d'autrui.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Paiements et packs de services</h2>
          
          <div className={styles.paymentCard}>
            <CreditCard className={styles.paymentIcon} />
            <div className={styles.paymentContent}>
              <h3>Modalités de paiement</h3>
              <ul className={styles.paymentList}>
                <li>Les paiements sont traités de manière sécurisée via Stripe</li>
                <li>Les prix sont affichés en euros TTC</li>
                <li>Les services sont proposés sous forme de packs cumulables</li>
                <li>Chaque pack acheté s'ajoute à votre compte de manière permanente</li>
                <li>Les packs ne sont pas des abonnements récurrents</li>
              </ul>
            </div>
          </div>

          <div className={styles.refundCard}>
            <h3>Politique de remboursement</h3>
            <ul className={styles.refundList}>
              <li>Les achats de packs sont définitifs et non remboursables</li>
              <li>Veuillez vérifier attentivement votre commande avant validation</li>
              <li>En cas de problème technique, contactez notre support</li>
              <li>Les packs achetés restent disponibles sur votre compte</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Propriété intellectuelle</h2>
          <p className={styles.text}>
            Kawepla et son contenu original, ses fonctionnalités et sa technologie sont et restent la propriété 
            exclusive de Kawepla et de ses concédants de licence. Le service est protégé par le droit d'auteur, 
            les marques de commerce et autres lois.
          </p>
          <p className={styles.text}>
            Notre nom, logo et marques ne peuvent être utilisés sans notre autorisation écrite préalable.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Limitation de responsabilité</h2>
          <div className={styles.liabilityCard}>
            <Shield className={styles.liabilityIcon} />
            <div className={styles.liabilityContent}>
              <h3>Exclusions de responsabilité</h3>
              <p>
                Dans la mesure permise par la loi, Kawepla ne peut être tenu responsable de :
              </p>
              <ul className={styles.liabilityList}>
                <li>Dommages indirects, consécutifs ou punitifs</li>
                <li>Perte de profits, de données ou d'opportunités</li>
                <li>Interruptions de service dues à la maintenance</li>
                <li>Actions des utilisateurs ou invités</li>
                <li>Problèmes techniques indépendants de notre volonté</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. Suspension et résiliation</h2>
          <p className={styles.text}>
            Nous nous réservons le droit de suspendre ou de résilier votre compte en cas de :
          </p>
          <ul className={styles.terminationList}>
            <li>Violation de ces conditions d'utilisation</li>
            <li>Utilisation frauduleuse ou abusive du service</li>
            <li>Demande légale des autorités compétentes</li>
            <li>Comportement inapproprié ou nuisible à la communauté</li>
          </ul>
          <p className={styles.text}>
            En cas de résiliation, vous perdrez l'accès à votre compte et à vos données. 
            Les packs achetés ne sont pas remboursables même en cas de résiliation.
            Nous vous donnerons un préavis raisonnable lorsque cela est possible.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>10. Modifications des conditions</h2>
          <p className={styles.text}>
            Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment. 
            Les modifications importantes vous seront notifiées par email ou via une notification 
            sur notre plateforme.
          </p>
          <p className={styles.text}>
            Votre utilisation continue du service après les modifications constitue votre acceptation 
            des nouvelles conditions.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>11. Droit applicable et juridiction</h2>
          <p className={styles.text}>
            Ces conditions d'utilisation sont régies par le droit français. Tout litige relatif à 
            l'utilisation de notre service sera soumis à la juridiction exclusive des tribunaux de Paris.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>12. Contact</h2>
          <div className={styles.contactCard}>
            <div className={styles.contactItem}>
              <Mail className={styles.contactIcon} />
              <span>kawepla.kaporelo@gmail.com</span>
            </div>
            <p className={styles.contactText}>
              Pour toute question concernant ces conditions d'utilisation, vous pouvez nous contacter 
              à l'adresse email ci-dessus.
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
