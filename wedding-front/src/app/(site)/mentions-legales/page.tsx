'use client';

import React from 'react';
import { Calendar, Mail, Globe, Server } from 'lucide-react';
import styles from './legal.module.css';

export default function MentionsLegalesPage() {
  return (
    <div className={styles.legalPage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Mentions Légales</h1>
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
            <h2 className={styles.sectionTitle}>1. Éditeur de l'application</h2>
            <div className={styles.info}>
              <p><strong>Statut :</strong> Particulier (Personne physique non immatriculée)</p>
              <p><strong>Nom et Prénom :</strong> Sabrina ELOUNDOU (Éditeur individuel)</p>
              <p className={styles.contact}>
                <Mail size={12} />
                <strong>Contact :</strong> 
                <a href="mailto:kawepla.kaporelo@gmail.com">kawepla.kaporelo@gmail.com</a>
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Directeur de la publication</h2>
            <div className={styles.info}>
              <p><strong>Nom :</strong> Sabrina ELOUNDOU</p>
              <p className={styles.contact}>
                <Mail size={12} />
                <strong>Contact :</strong> 
                <a href="mailto:kawepla.kaporelo@gmail.com">kawepla.kaporelo@gmail.com</a>
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Hébergement</h2>
            <div className={styles.info}>
              <p><strong>Hébergeur :</strong> Hostinger International Ltd.</p>
              <p><strong>Adresse :</strong> 61 Lordou Vironos Street, 6023 Larnaca, Chypre</p>
              <p className={styles.contact}>
                <Globe size={12} />
                <strong>Site web :</strong> 
                <a href="https://www.hostinger.fr" target="_blank" rel="noopener noreferrer">
                  https://www.hostinger.fr
                </a>
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Propriété intellectuelle</h2>
            <div className={styles.info}>
              <p>
                L'ensemble de cette application et son contenu (textes, images, graphismes, logo, icônes, 
                sons, logiciels, base de données, etc.) sont la propriété exclusive de <strong>Sabrina ELOUNDOU</strong>, 
                sauf mention contraire explicite.
              </p>
              <p>
                Toute représentation, reproduction, adaptation ou exploitation partielle ou totale des contenus, 
                marques déposées et services proposés par l'application, par quelque procédé que ce soit, 
                sans l'autorisation préalable, expresse et écrite de l'éditeur, est strictement interdite 
                et serait susceptible de constituer une contrefaçon au sens des articles L. 335-2 et suivants 
                du Code de la propriété intellectuelle.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Limitation de responsabilité</h2>
            <div className={styles.info}>
              <p>
                L'éditeur s'efforce d'assurer au mieux de ses possibilités, l'exactitude et la mise à jour 
                des informations diffusées sur cette application. Toutefois, l'éditeur ne peut garantir 
                l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur l'application.
              </p>
              <p>
                En conséquence, l'éditeur décline toute responsabilité pour toute imprécision, inexactitude 
                ou omission portant sur des informations disponibles sur l'application.
              </p>
              <p>
                L'éditeur ne pourra être tenu responsable des dommages directs et indirects causés au 
                matériel de l'utilisateur, lors de l'accès à l'application, et résultant soit de l'utilisation 
                d'un matériel ne répondant pas aux spécifications techniques requises, soit de l'apparition 
                d'un bug ou d'une incompatibilité.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Liens hypertextes</h2>
            <div className={styles.info}>
              <p>
                L'application peut contenir des liens hypertextes vers d'autres sites présents sur le réseau Internet. 
                Les liens vers ces autres ressources vous font quitter l'application.
              </p>
              <p>
                L'éditeur décline toute responsabilité concernant les liens créés par d'autres sites vers 
                la présente application, ainsi que concernant le contenu des sites vers lesquels des liens 
                sont proposés depuis l'application.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Droit applicable et juridiction compétente</h2>
            <div className={styles.info}>
              <p>
                Les présentes mentions légales sont régies par le droit français. En cas de litige et à défaut 
                d'accord amiable, le différend sera porté devant les tribunaux français conformément aux règles 
                de compétence en vigueur.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Contact</h2>
            <div className={styles.info}>
              <p>
                Pour toute question concernant les présentes mentions légales, vous pouvez nous contacter à l'adresse 
                suivante :
              </p>
              <p className={styles.contactBox}>
                <Mail size={14} />
                <a href="mailto:kawepla.kaporelo@gmail.com">kawepla.kaporelo@gmail.com</a>
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
