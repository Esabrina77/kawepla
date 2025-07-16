'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Statistics, Guest } from '@/types';
import { Card } from '@/components/Card/Card';
import { SubscriptionLimits } from '@/components/SubscriptionLimits/SubscriptionLimits';
import { TutorialDemo } from '@/components/Tutorial/TutorialDemo';
import { useInvitations } from '@/hooks/useInvitations';
import { useGuests } from '@/hooks/useGuests';
import {
  Users, CheckCircle, Clock, TrendingUp, Mail, Palette,
  ClipboardList, UserCheck, UserX, Timer, SendHorizontal,
  Utensils, UserPlus, ChartBar, FileText
} from 'lucide-react';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const [statistics, setStatistics] = useState<Statistics>({
    totalGuests: 0,
    confirmed: 0,
    declined: 0,
    pending: 0,
    responseRate: 0,
    dietaryRestrictionsCount: 0
  });
  
  const { invitations, loading: loadingInvitations } = useInvitations();
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);
  
  // Sélectionner automatiquement la première invitation publiée, sinon la première
  useEffect(() => {
    if (invitations.length > 0 && !selectedInvitationId) {
      const publishedInvitation = invitations.find(inv => inv.status === 'PUBLISHED');
      const defaultInvitation = publishedInvitation || invitations[0];
      setSelectedInvitationId(defaultInvitation.id);
    }
  }, [invitations, selectedInvitationId]);

  const selectedInvitation = invitations.find(inv => inv.id === selectedInvitationId);
  const { guests, loading: loadingGuests } = useGuests(selectedInvitation?.id || '');

  // Calculer les statistiques réelles
  useEffect(() => {
    if (guests.length > 0) {
      const emailGuests = guests.filter((g) => (g as any).invitationType !== 'SHAREABLE');
      const shareableGuests = guests.filter((g) => (g as any).invitationType === 'SHAREABLE');
      const confirmed = guests.filter((g) => g.rsvp?.status === 'CONFIRMED').length;
      const declined = guests.filter((g) => g.rsvp?.status === 'DECLINED').length;
      const pending = guests.filter((g) => !g.rsvp || g.rsvp.status === 'PENDING').length;
      const responseRate = guests.length > 0 ? Math.round(((confirmed + declined) / guests.length) * 100) : 0;
      const dietaryRestrictionsCount = guests.filter((g) => g.dietaryRestrictions && g.dietaryRestrictions.trim()).length;
      
      setStatistics({
        totalGuests: guests.length,
        confirmed,
        declined,
        pending,
        responseRate,
        dietaryRestrictionsCount
      });
    }
  }, [guests]);

  const quickActions = [
    {
      title: 'Créer une invitation',
      description: 'Commencez par créer votre première invitation',
      icon: <Mail className={styles.actionIcon} />,
      path: '/client/invitations',
      color: 'primary'
    },
    // Afficher l'action "Ajouter des invités" seulement si une invitation est publiée
    ...(invitations.some(inv => inv.status === 'PUBLISHED') ? [{
      title: 'Ajouter des invités',
      description: 'Importez ou ajoutez vos invités',
      icon: <Users className={styles.actionIcon} />,
      path: '/client/guests',
      color: 'secondary'
    }] : []),
    {
      title: 'Choisir un design',
      description: 'Personnalisez le design de votre invitation',
      icon: <Palette className={styles.actionIcon} />,
      path: '/client/design',
      color: 'tertiary'
    }
  ];

  return (
    <div className={styles.dashboard}>
      <h1>Tableau de bord</h1>
      
      {/* Affichage des limites d'abonnement */}
      <SubscriptionLimits />

      {/* Statistiques */}
      <section className={styles.statsSection} data-tutorial="stats-cards">
        <h2>Aperçu rapide</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Users />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{statistics.totalGuests}</div>
              <div className={styles.statLabel}>Invités total</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <CheckCircle />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{statistics.confirmed}</div>
              <div className={styles.statLabel}>Confirmés</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Clock />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{statistics.pending}</div>
              <div className={styles.statLabel}>En attente</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <TrendingUp />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{statistics.responseRate}%</div>
              <div className={styles.statLabel}>Taux de réponse</div>
            </div>
          </div>
        </div>
      </section>



      {/* Composant de démonstration du tutoriel */}
      {/* <div className={styles.tutorialSection}>
        <TutorialDemo />
      </div> */}

      {/* Actions rapides */}
      <section className={styles.quickActions} data-tutorial="quick-actions">
        <h2>Actions rapides</h2>
        <div className={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.path}
              className={`${styles.actionCard} ${styles[action.color]}`}
            >
              <div className={styles.actionIcon}>
                {action.icon}
              </div>
              <div className={styles.actionContent}>
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
              <div className={styles.actionArrow}>
                →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Sélecteur d'invitation si plusieurs */}
      {invitations.length > 1 && (
        <div className={styles.invitationSelector}>
          <label htmlFor="invitation-select" className={styles.selectorLabel}>
            <ClipboardList className={styles.titleIcon} /> Sélectionner l'invitation à afficher
          </label>
          <div className={styles.selectWrapper}>
            <select 
              id="invitation-select"
              value={selectedInvitationId || ''} 
              onChange={(e) => setSelectedInvitationId(e.target.value)}
              className={styles.invitationSelect}
            >
              {invitations.map(invitation => (
                <option key={invitation.id} value={invitation.id}>
                  {invitation.coupleName || invitation.title} 
                  {invitation.weddingDate && ` - ${new Date(invitation.weddingDate).toLocaleDateString('fr-FR')}`}
                  {invitation.status === 'PUBLISHED' ? ' (Publiée)' : ' (Brouillon)'}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Statistiques détaillées */}
      {selectedInvitation && !loadingGuests && guests.length > 0 && (
        <section className={styles.detailedStatsSection}>
          <div className={styles.sectionHeader}>
            <h2><ChartBar className={styles.titleIcon} /> Statistiques détaillées des invités</h2>
            <p>Statistiques pour {selectedInvitation.coupleName}</p>
          </div>
          <DetailedGuestStatistics guests={guests} />
        </section>
      )}
    </div>
  );
}



function DetailedGuestStatistics({ guests }: { guests: Guest[] }) {
  const emailGuests = guests.filter((g) => (g as any).invitationType !== 'SHAREABLE');
  const shareableGuests = guests.filter((g) => (g as any).invitationType === 'SHAREABLE');

  return (
    <div className={styles.detailedStats}>
      <div className={styles.detailedStatsGrid}>
        <div className={styles.detailedStatCard}>
          <div className={styles.detailedStatIcon}>
            <Users />
          </div>
          <div className={styles.detailedStatContent}>
            <div className={styles.detailedStatValue}>{guests.length}</div>
            <div className={styles.detailedStatLabel}>Total invités</div>
          </div>
        </div>
        <div className={styles.detailedStatCard}>
          <div className={styles.detailedStatIcon}>
            <Mail />
          </div>
          <div className={styles.detailedStatContent}>
            <div className={styles.detailedStatValue}>{emailGuests.length}</div>
            <div className={styles.detailedStatLabel}>Via email</div>
          </div>
        </div>
        <div className={styles.detailedStatCard}>
          <div className={styles.detailedStatIcon}>
            <FileText />
          </div>
          <div className={styles.detailedStatContent}>
            <div className={styles.detailedStatValue}>{shareableGuests.length}</div>
            <div className={styles.detailedStatLabel}>Via lien partageable</div>
          </div>
        </div>
        <div className={styles.detailedStatCard}>
          <div className={styles.detailedStatIcon}>
            <UserCheck />
          </div>
          <div className={styles.detailedStatContent}>
            <div className={styles.detailedStatValue}>{guests.filter((g) => g.rsvp?.status === 'CONFIRMED').length}</div>
            <div className={styles.detailedStatLabel}>Confirmés</div>
          </div>
        </div>
        <div className={styles.detailedStatCard}>
          <div className={styles.detailedStatIcon}>
            <UserX />
          </div>
          <div className={styles.detailedStatContent}>
            <div className={styles.detailedStatValue}>{guests.filter((g) => g.rsvp?.status === 'DECLINED').length}</div>
            <div className={styles.detailedStatLabel}>Refusés</div>
          </div>
        </div>
        <div className={styles.detailedStatCard}>
          <div className={styles.detailedStatIcon}>
            <Timer />
          </div>
          <div className={styles.detailedStatContent}>
            <div className={styles.detailedStatValue}>{guests.filter((g) => !g.rsvp || g.rsvp.status === 'PENDING').length}</div>
            <div className={styles.detailedStatLabel}>En attente</div>
          </div>
        </div>
        <div className={styles.detailedStatCard}>
          <div className={styles.detailedStatIcon}>
            <SendHorizontal />
          </div>
          <div className={styles.detailedStatContent}>
            <div className={styles.detailedStatValue}>{emailGuests.filter((g) => g.invitationSentAt).length}</div>
            <div className={styles.detailedStatLabel}>Emails envoyés</div>
          </div>
        </div>
        <div className={styles.detailedStatCard}>
          <div className={styles.detailedStatIcon}>
            <Utensils />
          </div>
          <div className={styles.detailedStatContent}>
            <div className={styles.detailedStatValue}>{guests.filter((g) => g.dietaryRestrictions && g.dietaryRestrictions.trim()).length}</div>
            <div className={styles.detailedStatLabel}>Avec restrictions</div>
          </div>
        </div>
        <div className={styles.detailedStatCard}>
          <div className={styles.detailedStatIcon}>
            <UserPlus />
          </div>
          <div className={styles.detailedStatContent}>
            <div className={styles.detailedStatValue}>{guests.filter((g) => g.plusOne).length}</div>
            <div className={styles.detailedStatLabel}>Avec accompagnant</div>
          </div>
        </div>
      </div>
    </div>
  );
} 