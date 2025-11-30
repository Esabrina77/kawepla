'use client';

import React from 'react';
import { Calendar, Mail, Shield, Lock, Database, Eye, UserCheck, FileText } from 'lucide-react';
import styles from '../mentions-legales/legal.module.css';

export default function PolitiqueConfidentialitePage() {
  return (
    <div className={styles.legalPage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Politique de Confidentialité</h1>
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
            <h2 className={styles.sectionTitle}>1. Introduction</h2>
            <div className={styles.info}>
              <p>
                Bienvenue sur Kawepla. La protection de vos données personnelles est une priorité pour nous.
                Cette politique de confidentialité décrit comment nous collectons, utilisons, partageons et
                protégeons vos informations personnelles conformément au Règlement Général sur la Protection
                des Données (RGPD) et aux lois françaises applicables.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Responsable du traitement</h2>
            <div className={styles.info}>
              <p><strong>Responsable du traitement :</strong> Sabrina ELOUNDOU</p>
              <p><strong>Statut :</strong> Particulier (Personne physique non immatriculée)</p>
              <p className={styles.contact}>
                <Mail size={12} />
                <strong>Contact :</strong>
                <a href="mailto:kawepla.kaporelo@gmail.com">kawepla.kaporelo@gmail.com</a>
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Données collectées</h2>
            <div className={styles.info}>
              <p>Nous collectons les types de données suivants :</p>
              <p><strong>a) Données d'identification :</strong> Nom, prénom, adresse email, numéro de téléphone (optionnel)</p>
              <p><strong>b) Données de l'événement :</strong> Titre de l'événement, date, lieu, description, liste des invités</p>
              <p><strong>c) Données de connexion :</strong> Adresse IP, type de navigateur, pages consultées, date et heure des visites</p>
              <p><strong>d) Données de communication :</strong> Messages envoyés via la plateforme, photos partagées</p>
              <p><strong>e) Données des Prestataires :</strong> Pour les professionnels référencés : informations de l'entreprise (SIRET, adresse), portfolio, tarifs, et avis clients.</p>
              <p><strong>f) Données de paiement :</strong> Les informations de paiement sont traitées directement par notre prestataire de paiement Stripe et ne sont pas stockées sur nos serveurs</p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Finalités du traitement</h2>
            <div className={styles.info}>
              <p>Vos données personnelles sont collectées et traitées pour les finalités suivantes :</p>
              <p><strong>• Création et gestion de votre compte utilisateur</strong></p>
              <p><strong>• Organisation et gestion de vos événements</strong></p>
              <p><strong>• Envoi d'invitations et gestion des réponses (RSVP)</strong></p>
              <p><strong>• Communication entre organisateurs et invités</strong></p>
              <p><strong>• Partage de photos et albums événementiels</strong></p>
              <p><strong>• Traitement des paiements pour les plans payants</strong></p>
              <p><strong>• Amélioration de nos services et support technique</strong></p>
              <p><strong>• Envoi de communications marketing (avec votre consentement)</strong></p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Base légale du traitement</h2>
            <div className={styles.info}>
              <p>Nous traitons vos données personnelles sur la base des fondements légaux suivants :</p>
              <p><strong>• Exécution d'un contrat :</strong> Pour fournir les services demandés</p>
              <p><strong>• Consentement :</strong> Pour les communications marketing et certaines fonctionnalités optionnelles</p>
              <p><strong>• Intérêt légitime :</strong> Pour améliorer nos services et assurer la sécurité de la plateforme</p>
              <p><strong>• Obligations légales :</strong> Pour respecter les obligations légales et réglementaires</p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Partage et divulgation des données</h2>
            <div className={styles.info}>
              <p>Nous ne vendons jamais vos données personnelles. Vos données peuvent être partagées dans les cas suivants :</p>
              <p><strong>• Invités de vos événements :</strong> Les informations relatives à votre événement sont partagées avec les invités que vous avez désignés</p>
              <p><strong>• Prestataires de services :</strong> Hébergement (Hostinger), paiement (Stripe), envoi d'emails, sous contrat de confidentialité strict</p>
              <p><strong>• Obligations légales :</strong> Si requis par la loi, une décision de justice ou une autorité administrative</p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Durée de conservation</h2>
            <div className={styles.info}>
              <p>Nous conservons vos données personnelles pendant les durées suivantes :</p>
              <p><strong>• Compte actif :</strong> Pendant toute la durée d'utilisation de votre compte</p>
              <p><strong>• Après clôture de compte :</strong> 1 an après votre dernier événement, puis suppression automatique</p>
              <p><strong>• Données de facturation :</strong> 10 ans conformément aux obligations comptables</p>
              <p><strong>• Cookies :</strong> 13 mois maximum</p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Sécurité des données</h2>
            <div className={styles.info}>
              <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :</p>
              <p><strong>• Chiffrement SSL/TLS</strong> pour toutes les communications</p>
              <p><strong>• Hébergement sécurisé</strong> dans l'Union Européenne (Chypre)</p>
              <p><strong>• Accès restreint</strong> aux données personnelles</p>
              <p><strong>• Sauvegardes régulières</strong> et plan de reprise d'activité</p>
              <p><strong>• Authentification forte</strong> pour les comptes utilisateurs</p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>9. Vos droits (RGPD)</h2>
            <div className={styles.info}>
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <p><strong>• Droit d'accès :</strong> Obtenir une copie de vos données personnelles</p>
              <p><strong>• Droit de rectification :</strong> Corriger vos données inexactes ou incomplètes</p>
              <p><strong>• Droit à l'effacement :</strong> Supprimer vos données dans certaines conditions</p>
              <p><strong>• Droit à la limitation :</strong> Limiter le traitement de vos données</p>
              <p><strong>• Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</p>
              <p><strong>• Droit d'opposition :</strong> Vous opposer au traitement de vos données</p>
              <p><strong>• Droit de retirer votre consentement :</strong> À tout moment pour les traitements basés sur le consentement</p>
              <p>
                Pour exercer ces droits, contactez-nous à :
                <a href="mailto:kawepla.kaporelo@gmail.com" style={{ marginLeft: '4px' }}>kawepla.kaporelo@gmail.com</a>
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>10. Cookies et technologies similaires</h2>
            <div className={styles.info}>
              <p>Nous utilisons des cookies pour améliorer votre expérience :</p>
              <p><strong>• Cookies essentiels :</strong> Nécessaires au fonctionnement du site</p>
              <p><strong>• Cookies de performance :</strong> Pour analyser l'utilisation de la plateforme</p>
              <p><strong>• Cookies fonctionnels :</strong> Pour mémoriser vos préférences</p>
              <p>Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur.</p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>11. Contact et Délégué à la Protection des Données</h2>
            <div className={styles.info}>
              <p>
                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits (RGPD),
                vous pouvez nous contacter à l'adresse suivante :
              </p>
              <div className={styles.contactBox}>
                <Mail size={14} />
                <a href="mailto:kawepla.kaporelo@gmail.com">kawepla.kaporelo@gmail.com</a>
              </div>
              <p style={{ marginTop: 'var(--space-md)' }}>
                <strong>Délégué à la Protection des Données (DPO) :</strong> L'éditeur de l'application Kawepla
                (Sabrina ELOUNDOU) est l'unique responsable du traitement des données personnelles et est le point
                de contact pour toutes les questions relatives au RGPD.
              </p>
              <p style={{ marginTop: 'var(--space-md)' }}>
                Vous avez également le droit d'introduire une réclamation auprès de la Commission Nationale
                de l'Informatique et des Libertés (CNIL) si vous estimez que le traitement de vos données
                constitue une violation de la réglementation applicable.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>12. Modifications de la politique</h2>
            <div className={styles.info}>
              <p>
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
                Toute modification sera publiée sur cette page avec une nouvelle date de mise à jour.
                Nous vous encourageons à consulter régulièrement cette page pour rester informé de nos pratiques
                en matière de protection des données.
              </p>
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
