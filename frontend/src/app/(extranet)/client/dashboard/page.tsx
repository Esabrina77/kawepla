'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useInvitations } from '@/hooks/useInvitations';
import { useGuests } from '@/hooks/useGuests';
import { useAuth } from '@/hooks/useAuth';
import { stripeApi } from '@/lib/api/stripe';
import { todosApi } from '@/lib/api/todos';
import {
  CheckCircle, Clock,
  Plus, ChevronDown, ChevronRight,
  UserPlus, Calendar, AlertTriangle
} from 'lucide-react';
import { HeaderMobile } from '@/components/HeaderMobile/HeaderMobile';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { invitations, loading: loadingInvitations } = useInvitations();
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>('');
  const [limits, setLimits] = useState<{ usage: any; limits: any; remaining: any } | null>(null);
  const [todosStats, setTodosStats] = useState({
    total: 0, completed: 0, pending: 0, inProgress: 0, overdue: 0, progress: 0
  });

  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/auth/login');
  }, [router]);

  useEffect(() => {
    if (user) stripeApi.getUserLimitsAndUsage().then(setLimits).catch(() => {});
  }, [user]);

  const selectedInvitation = invitations.find(inv => inv.id === selectedInvitationId) || invitations[0];

  useEffect(() => {
    if (invitations.length > 0 && !selectedInvitationId) {
      const pub = invitations.find(inv => inv.status === 'PUBLISHED');
      setSelectedInvitationId((pub || invitations[0]).id);
    }
  }, [invitations, selectedInvitationId]);

  const { guests, fetchGuests } = useGuests(selectedInvitationId);
  useEffect(() => { if (selectedInvitationId) fetchGuests(); }, [selectedInvitationId, fetchGuests]);

  useEffect(() => {
    if (!selectedInvitationId) {
      setTodosStats({ total: 0, completed: 0, pending: 0, inProgress: 0, overdue: 0, progress: 0 });
      return;
    }
    todosApi.getTodosByInvitation(selectedInvitationId).then(todos => {
      const tasks = todos.todos || [];
      const now = new Date();
      const completed = tasks.filter(t => t.status === 'COMPLETED').length;
      const pending = tasks.filter(t => t.status === 'PENDING').length;
      const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
      const overdue = tasks.filter(t => {
        if (t.status === 'COMPLETED' || !t.dueDate) return false;
        return new Date(t.dueDate).getTime() - now.getTime() < 0;
      }).length;
      setTodosStats({
        total: tasks.length, completed, pending, inProgress, overdue,
        progress: tasks.length > 0 ? (completed / tasks.length) * 100 : 0
      });
    }).catch(() => {});
  }, [selectedInvitationId]);

  const confirmedGuests = guests.filter((g: any) => g.rsvp?.status === 'CONFIRMED');
  const declinedGuests = guests.filter((g: any) => g.rsvp?.status === 'DECLINED');
  const pendingGuests = guests.filter((g: any) => !g.rsvp || g.rsvp?.status === 'PENDING');
  const guestsWithEmails = guests.filter((g: any) => g.invitationType === 'PERSONAL');
  const guestsViaLink = guests.filter((g: any) => g.invitationType === 'SHAREABLE');

  if (loadingInvitations) {
    return (
      <div className={styles.dashboard}>
        <HeaderMobile title="Tableau de bord" showBackButton={false} />
        <div className={styles.loadingState}><div className={styles.spinner} /></div>
      </div>
    );
  }

  const pct = (u: number, m: number) => Math.min(100, (u / (m || 1)) * 100);
  const stat = (u: number, m: number) => {
    const p = pct(u, m);
    return p >= 100 ? 'crit' : p >= 75 ? 'warn' : '';
  };

  const limitItems = limits ? [
    { label: 'Evenements', used: limits.usage?.invitations || 0, max: limits.limits?.invitations || 0 },
    { label: 'Invités', used: limits.usage?.guests || 0, max: limits.limits?.guests || 0 },
    { label: 'Photos', used: limits.usage?.photos || 0, max: limits.limits?.photos || 0 },
    { label: 'Requêtes IA', used: limits.usage?.aiRequests || 0, max: limits.limits?.aiRequests || 0 },
  ] : [];

  const circumference = 2 * Math.PI * 46;
  const dashOffset = circumference - (todosStats.progress / 100) * circumference;
  const remaining = todosStats.pending + todosStats.inProgress;

  return (
    <div className={styles.dashboard}>
      <HeaderMobile title="Tableau de bord" showBackButton={false} />

      <div className={styles.grid}>
        {/* Welcome */}
        <div className={styles.welcome}>
          <div className={styles.welcomeLeft}>
            <h1>Hey {user?.firstName || 'Utilisateur'} 
              <span>
                <img className={styles.chick} src="/gif/poussin.gif" alt="chick" />
              </span>
            </h1>
            <p>{selectedInvitation ? `Tout roule pour ${selectedInvitation.eventTitle}` : 'Bienvenue sur votre espace'}</p>
          </div>
          {invitations.length > 0 && (
            <div className={styles.selectWrap}>
              <select
                value={selectedInvitationId}
                onChange={(e) => setSelectedInvitationId(e.target.value)}
                className={styles.eventSelect}
                aria-label="Sélectionner l'événement"
              >
                {invitations.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.eventTitle}{inv.eventDate && ` — ${new Date(inv.eventDate).toLocaleDateString('fr-FR')}`}
                  </option>
                ))}
              </select>
              <ChevronDown className={styles.selectIcon} size={16} />
            </div>
          )}
        </div>

        {/* Stat cards — first one highlighted */}
        {limits && (
          <>
            {limitItems.map((item, i) => {
              const s = stat(item.used, item.max);
              const remaining = item.max - item.used;
              return (
                <div key={item.label} className={`${styles.card} ${i === 0 ? styles.statHighlight : ''}`}>
                  <div className={styles.statLabel}>{item.label}</div>
                  <div className={styles.statValue}>{item.used}<span> / {item.max}</span></div>
                  <div className={styles.statBar}>
                    <div className={`${styles.statBarFill} ${s ? styles[s] : ''}`} style={{ width: `${pct(item.used, item.max)}%` }} />
                  </div>
                  <div className={`${styles.statSub} ${remaining <= 2 ? styles.statSubRed : styles.statSubGreen}`}>
                    {remaining > 0 ? `${remaining} restant${remaining > 1 ? 's' : ''}` : 'Limite atteinte'}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Progress (2 cols) + Alert/IA (1 col) */}
        {selectedInvitation && todosStats.total > 0 && (
          <>
            <div className={`${styles.card} ${styles.progressCard}`}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Avancement</h2>
                <Link href="/client/tools/planning" className={styles.cardLink}>Planning →</Link>
              </div>
              <div className={styles.progressBody}>
                <div className={styles.ringWrap}>
                  <svg className={styles.ringSvg} viewBox="0 0 110 110">
                    <circle className={styles.ringBg} cx="55" cy="55" r="46" />
                    <circle className={styles.ringFill} cx="55" cy="55" r="46"
                      strokeDasharray={circumference} strokeDashoffset={dashOffset} />
                  </svg>
                  <div className={styles.ringLabel}>
                    <span className={styles.ringPercent}>{Math.round(todosStats.progress)}%</span>
                    <span className={styles.ringSubtext}>complété</span>
                  </div>
                </div>
                <div className={styles.progressMeta}>
                  <div className={styles.progressLine}>
                    <span className={`${styles.progressDot} ${styles.green}`} />
                    <span className={styles.progressLineLabel}>Terminées</span>
                    <span className={styles.progressLineValue}>{todosStats.completed}</span>
                  </div>
                  <div className={styles.progressLine}>
                    <span className={`${styles.progressDot} ${styles.indigo}`} />
                    <span className={styles.progressLineLabel}>Restantes</span>
                    <span className={styles.progressLineValue}>{remaining}</span>
                  </div>
                  {todosStats.overdue > 0 && (
                    <div className={styles.progressLine}>
                      <span className={`${styles.progressDot} ${styles.red}`} />
                      <span className={styles.progressLineLabel}>En retard</span>
                      <span className={styles.progressLineValue}>{todosStats.overdue}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Alert card if overdue */}
            {todosStats.overdue > 0 && (
              <div className={styles.alertCard}>
                <div className={styles.alertIcon}><AlertTriangle size={20} /></div>
                <h3>{todosStats.overdue} en retard</h3>
                <p>Vous avez {todosStats.overdue} tâche{todosStats.overdue > 1 ? 's' : ''} dont la date limite est dépassée.</p>
                <Link href="/client/tools/planning" className={styles.alertLink}>
                  Voir le planning <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </>
        )}



        {/* Guests (2 cols) + Actions (1 col) */}
        {selectedInvitation && selectedInvitationId && (
          <>
            <div className={`${styles.card} ${styles.guestCard}`}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Invités</h2>
              </div>
              <div className={styles.guestGrid}>
                {[
                  { label: 'Total', value: guests.length, color: 'purple' },
                  { label: 'Via email', value: guestsWithEmails.length, color: 'sky' },
                  { label: 'Via lien', value: guestsViaLink.length, color: 'slate' },
                  { label: 'Confirmés', value: confirmedGuests.length, color: 'green' },
                  { label: 'Refusés', value: declinedGuests.length, color: 'red' },
                  { label: 'En attente', value: pendingGuests.length, color: 'amber' },
                ].map((item, i) => (
                  <div key={i} className={styles.guestItem}>
                    <div className={`${styles.guestItemValue} ${styles[item.color]}`}>{item.value}</div>
                    <div className={styles.guestItemLabel}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Actions</h2>
              </div>
              <div className={styles.actionsGrid}>
                {[
                  { title: 'Créer une invitation', desc: 'Nouvel événement', icon: Plus, path: '/client/invitations', c: 'indigo' },
                  { title: 'Ajouter des invités', desc: 'Élargir la liste', icon: UserPlus, path: '/client/guests', c: 'emerald' },
                  { title: 'Planning', desc: 'Gérer les tâches', icon: Calendar, path: '/client/tools/planning', c: 'amber' },
                ].map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <Link key={i} href={a.path} className={styles.actionRow}>
                      <div className={`${styles.actionDot} ${styles[a.c]}`}><Icon size={18} /></div>
                      <div className={styles.actionInfo}><h3>{a.title}</h3><p>{a.desc}</p></div>
                      <ChevronRight size={14} className={styles.actionArrow} />
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}