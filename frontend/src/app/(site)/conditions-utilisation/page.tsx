'use client';

import React from 'react';
import { Calendar, Mail, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import styles from '../mentions-legales/legal.module.css';

export default function ConditionsUtilisationPage() {
  return (
    <div className={styles.legalPage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Conditions Générales d'Utilisation</h1>
          <div className={styles.metadata}>
            <span className={styles.date}>
              <Calendar size={12} />
              mercredi 15 octobre 2025 à 10:10
            </span>
            <span className={styles.version}>Dernière mise à jour : 15 octobre 2025</span>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Objet</h2>
            <div className={styles.info}>
              <p>
                Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et 
                l'utilisation de la plateforme Kawepla (ci-après « la Plateforme » ou « le Service »), 
                éditée par <strong>Sabrina ELOUNDOU</strong>, en qualité d'éditrice individuelle non immatriculée.
              </p>
              <p>
                <strong>L'objet principal de la Plateforme est de fournir un service de gestion d'événements 
                accessible gratuitement aux Utilisateurs. L'achat de plans payants est facultatif et vise à 
                débloquer des fonctionnalités additionnelles.</strong>
              </p>
              <p>
                L'utilisation de la Plateforme implique l'acceptation pleine et entière des présentes CGU. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la Plateforme.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Définitions</h2>
            <div className={styles.info}>
              <p><strong>• Plateforme :</strong> L'application web Kawepla accessible à l'adresse kawepla.kaporelo.com</p>
              <p><strong>• Utilisateur :</strong> Toute personne physique ou morale utilisant la Plateforme</p>
              <p><strong>• Organisateur :</strong> Utilisateur créant et gérant un événement sur la Plateforme</p>
              <p><strong>• Invité :</strong> Personne recevant une invitation à un événement via la Plateforme</p>
              <p><strong>• Événement :</strong> Toute manifestation (mariage, anniversaire, etc.) organisée via la Plateforme</p>
              <p><strong>• Compte :</strong> Espace personnel de l'Utilisateur sur la Plateforme</p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Accès à la Plateforme</h2>
            <div className={styles.info}>
              <p>
                <strong>a) Conditions d'accès :</strong> Le service principal de la Plateforme est accessible via le plan 
                « Découverte », <strong>gratuit à vie</strong>. L'utilisation du Service n'est pas subordonnée à l'achat 
                d'un plan payant. Des plans payants avec fonctionnalités avancées sont également disponibles 
                <strong> à titre facultatif</strong>.
              </p>
              <p>
                <strong>b) Inscription :</strong> Pour utiliser les services de la Plateforme, l'Utilisateur doit créer 
                un compte en fournissant des informations exactes et à jour.
              </p>
              <p>
                <strong>c) Âge minimum :</strong> L'utilisation de la Plateforme est réservée aux personnes âgées de 
                18 ans ou plus, ou aux mineurs ayant obtenu l'autorisation de leurs représentants légaux.
              </p>
              <p>
                <strong>d) Disponibilité :</strong> La Plateforme est accessible 24h/24 et 7j/7, sauf interruption 
                programmée ou imprévue pour maintenance.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Création et gestion du compte</h2>
            <div className={styles.info}>
              <p>
                <strong>a) Identifiants :</strong> L'Utilisateur est responsable de la confidentialité de ses identifiants 
                (email et mot de passe). Toute utilisation du compte est réputée avoir été effectuée par l'Utilisateur.
              </p>
              <p>
                <strong>b) Exactitude des informations :</strong> L'Utilisateur s'engage à fournir des informations exactes, 
                complètes et à jour lors de son inscription et à les mettre à jour en cas de changement.
              </p>
              <p>
                <strong>c) Suspension ou suppression :</strong> Nous nous réservons le droit de suspendre ou supprimer tout 
                compte en cas de violation des présentes CGU ou de comportement frauduleux.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Services proposés</h2>
            <div className={styles.info}>
              <p>La Plateforme permet notamment de :</p>
              <p><strong>• Créer et personnaliser des invitations numériques</strong> pour vos événements</p>
              <p><strong>• Gérer la liste des invités</strong> et suivre les réponses (RSVP)</p>
              <p><strong>• Partager des albums photos</strong> collaboratifs</p>
              <p><strong>• Trouver des prestataires</strong> pour vos événements</p>
              <p><strong>• Accéder à des statistiques et analytics</strong> détaillées</p>
              <p style={{ marginTop: 'var(--space-md)' }}>
                <strong>Les fonctionnalités de base du Service sont incluses dans le plan gratuit « Découverte ».</strong> 
                Les fonctionnalités avancées peuvent nécessiter l'achat facultatif d'un plan payant 
                (Essentiel, Élégant, Premium, Luxe).
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Obligations de l'Utilisateur</h2>
            <div className={styles.info}>
              <p>L'Utilisateur s'engage à :</p>
              <p><strong>• Utiliser la Plateforme de manière conforme</strong> à sa destination et aux lois en vigueur</p>
              <p><strong>• Ne pas diffuser de contenu illicite, offensant, diffamatoire, raciste, violent ou pornographique</strong></p>
              <p><strong>• Respecter les droits de propriété intellectuelle</strong> de tiers</p>
              <p><strong>• Ne pas tenter de contourner les mesures de sécurité</strong> de la Plateforme</p>
              <p><strong>• Ne pas utiliser la Plateforme à des fins commerciales</strong> non autorisées</p>
              <p><strong>• Ne pas spammer ou harceler</strong> d'autres utilisateurs</p>
              <p><strong>• Respecter la vie privée</strong> des autres utilisateurs</p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Contenu généré par l'Utilisateur</h2>
            <div className={styles.info}>
              <p>
                <strong>a) Propriété :</strong> L'Utilisateur conserve l'intégralité des droits sur le contenu qu'il publie 
                (textes, photos, etc.).
              </p>
              <p>
                <strong>b) Licence d'utilisation :</strong> En publiant du contenu, l'Utilisateur accorde à Kawepla une 
                licence non exclusive, mondiale et gratuite pour stocker, afficher et distribuer ce contenu dans le cadre 
                du fonctionnement de la Plateforme.
              </p>
              <p>
                <strong>c) Responsabilité :</strong> L'Utilisateur est seul responsable du contenu qu'il publie. Nous nous 
                réservons le droit de supprimer tout contenu contraire aux présentes CGU ou à la loi.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Tarifs et paiement</h2>
            <div className={styles.info}>
              <p>
                <strong>a) Plan gratuit (Plan de base) :</strong> Le plan « Découverte » est <strong>le plan de base du Service</strong>, 
                gratuit à vie, sans carte bancaire requise.
              </p>
              <p>
                <strong>b) Plans payants (Facultatifs) :</strong> Les plans Essentiel, Élégant, Premium et Luxe sont payants. 
                <strong>L'achat de ces plans est purement facultatif et n'est pas une condition d'utilisation du Service.</strong> 
                Les tarifs sont indiqués en euros TTC sur la page de tarification.
              </p>
              <p>
                <strong>c) Paiement unique :</strong> Les plans payants sont facturés en un seul paiement. 
                Il n'y a pas d'abonnement récurrent.
              </p>
              <p>
                <strong>d) Moyens de paiement :</strong> Les paiements sont traités de manière sécurisée par Stripe. 
                Nous acceptons les cartes bancaires (Visa, Mastercard, American Express).
              </p>
              <p>
                <strong>e) Facturation :</strong> Une facture est envoyée par email après chaque paiement.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>9. Droit de rétractation</h2>
            <div className={styles.info}>
              <p>
                Conformément à l'article L221-28 du Code de la consommation, l'Utilisateur dispose d'un délai de 
                14 jours à compter de la souscription d'un plan payant pour exercer son droit de rétractation, 
                sauf s'il a expressément demandé l'exécution immédiate du service.
              </p>
              <p>
                Pour exercer ce droit, contactez-nous à : 
                <a href="mailto:kawepla.kaporelo@gmail.com" style={{ marginLeft: '4px' }}>kawepla.kaporelo@gmail.com</a>
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>10. Propriété intellectuelle</h2>
            <div className={styles.info}>
              <p>
                Tous les éléments de la Plateforme (design, logo, textes, graphismes, logiciels, base de données, etc.) 
                sont la propriété exclusive de Sabrina ELOUNDOU, sauf mention contraire.
              </p>
              <p>
                Toute reproduction, représentation, modification, publication, adaptation, totale ou partielle, 
                est strictement interdite sans autorisation écrite préalable.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>11. Limitation de responsabilité</h2>
            <div className={styles.info}>
              <p>
                <strong>a) Disponibilité :</strong> Nous ne pouvons garantir une disponibilité absolue de la Plateforme. 
                Des interruptions peuvent survenir pour maintenance ou causes indépendantes de notre volonté.
              </p>
              <p>
                <strong>b) Contenu utilisateur :</strong> Nous ne sommes pas responsables du contenu publié par les 
                utilisateurs. Toutefois, nous nous réservons le droit de le modérer.
              </p>
              <p>
                <strong>c) Perte de données :</strong> Bien que nous effectuions des sauvegardes régulières, nous ne 
                pouvons garantir l'absence totale de perte de données. Il est recommandé de conserver vos propres copies.
              </p>
              <p>
                <strong>d) Dommages indirects :</strong> Notre responsabilité est limitée aux dommages directs. 
                Nous ne pouvons être tenus responsables des dommages indirects (perte de données, manque à gagner, etc.).
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>12. Durée et résiliation</h2>
            <div className={styles.info}>
              <p>
                <strong>a) Durée :</strong> Les présentes CGU sont applicables aussi longtemps que vous utilisez la Plateforme.
              </p>
              <p>
                <strong>b) Résiliation par l'Utilisateur :</strong> Vous pouvez supprimer votre compte à tout moment depuis 
                les paramètres de votre compte.
              </p>
              <p>
                <strong>c) Résiliation par Kawepla :</strong> Nous pouvons suspendre ou résilier votre accès en cas de 
                violation des présentes CGU, avec ou sans préavis selon la gravité.
              </p>
              <p>
                <strong>d) Effets de la résiliation :</strong> En cas de résiliation, vos données seront conservées pendant 
                1 an après votre dernier événement, puis supprimées définitivement.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>13. Modifications des CGU</h2>
            <div className={styles.info}>
              <p>
                Nous nous réservons le droit de modifier les présentes CGU à tout moment. Toute modification sera publiée 
                sur cette page avec une nouvelle date de mise à jour. Il est recommandé de consulter régulièrement cette page.
              </p>
              <p>
                En cas de modification substantielle, nous vous informerons par email. La poursuite de l'utilisation de 
                la Plateforme après notification vaut acceptation des nouvelles CGU.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>14. Droit applicable et juridiction</h2>
            <div className={styles.info}>
              <p>
                Les présentes CGU sont régies par le droit français. En cas de litige, une solution amiable sera recherchée 
                en priorité. À défaut d'accord, le litige sera porté devant les tribunaux français compétents.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>15. Contact</h2>
            <div className={styles.info}>
              <p>
                Pour toute question concernant ces conditions d'utilisation, vous pouvez nous contacter à l'adresse suivante :
              </p>
              <div className={styles.contactBox}>
                <Mail size={14} />
                <a href="mailto:kawepla.kaporelo@gmail.com">kawepla.kaporelo@gmail.com</a>
              </div>
            </div>
          </section>
        </div>

        <footer className={styles.footer}>
          <p>© 2025 Kawepla - Tous droits réservés</p>
        </footer>
      </div>
    </div>
  );
}
