"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAuth } from "@/hooks/useAuth";
import { HeaderMobile } from "@/components/HeaderMobile/HeaderMobile";
import {
  Users,
  TrendingUp,
  Activity,
  Crown,
  FileText,
  UserCheck,
  Calendar,
  Target,
  Users2,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

export default function SuperAdminDashboard() {
  const { stats, loading: statsLoading, error: statsError } = useAdminStats();
  const { users, loading: usersLoading } = useAdminUsers();
  const { user } = useAuth();

  const recentUsers = useMemo(() => {
    if (!users) return [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return users.filter((u) => new Date(u.createdAt) > sevenDaysAgo);
  }, [users]);

  if (statsLoading || usersLoading) {
    return (
      <div className={styles.dashboard}>
        <HeaderMobile title="Tableau de bord" showBackButton={false} />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className={styles.dashboard}>
        <HeaderMobile title="Tableau de bord" showBackButton={false} />
        <div className={styles.errorContainer}>
          <p>Erreur: {statsError}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Ring progress properties
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const conversionRate =
    stats.guests.total > 0
      ? Math.round(
          ((stats.guests.confirmed + stats.guests.declined) /
            stats.guests.total) *
            100,
        )
      : 0;
  const dashOffset = circumference - (conversionRate / 100) * circumference;

  return (
    <div className={styles.dashboard}>
      {/* Header positioned outside pageContent for full-width sticky feel */}
      <HeaderMobile title="Tableau de bord" showBackButton={false} />

      <div className={styles.pageContent}>
        <div className={styles.grid}>
          {/* Welcome Row */}
          <div className={styles.welcome}>
            <div className={styles.welcomeLeft}>
              <h1>
                Hey {user?.firstName || "Admin"}
                <span>
                  <img
                    className={styles.chick}
                    src="/gif/poussin.gif"
                    alt="chick"
                  />
                </span>
              </h1>
              <p>Vue d&apos;ensemble de la plateforme Kawepla</p>
            </div>
          </div>

          {/* Top Stat Cards (Bento) */}
          <div className={`${styles.card} ${styles.statHighlight}`}>
            <div className={styles.statIcon}>
              <Users size={20} />
            </div>
            <div className={styles.statLabel}>Utilisateurs</div>
            <div className={styles.statValue}>{stats.users.total}</div>
            <div className={`${styles.statSub} ${styles.trending}`}>
              <TrendingUp size={14} /> +{recentUsers.length} cette semaine
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.statIcon}>
              <FileText size={20} />
            </div>
            <div className={styles.statLabel}>Invitations publiées</div>
            <div className={styles.statValue}>
              {stats.invitations.published}
            </div>
            <div className={styles.statSub}>
              <Activity size={14} /> Sur {stats.invitations.total} créées
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.statIcon}>
              <UserCheck size={20} />
            </div>
            <div className={styles.statLabel}>Réponses RSVP</div>
            <div className={styles.statValue}>
              {stats.guests.confirmed + stats.guests.declined}
            </div>
            <div className={`${styles.statSub} ${styles.trending}`}>
              <ArrowUpRight size={14} /> Total cumulé
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.statIcon}>
              <Users2 size={20} />
            </div>
            <div className={styles.statLabel}>Ce mois-ci</div>
            <div className={styles.statValue}>
              {stats.invitations.thisMonth}
            </div>
            <div className={styles.statSub}>Nouvelles invitations</div>
          </div>

          {/* Middle Section: Progress Ring & Roles */}
          <div className={`${styles.card} ${styles.progressCard}`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Target size={18} /> Conversion
              </h2>
            </div>
            <div className={styles.progressBody}>
              <div className={styles.ringWrap}>
                <svg className={styles.ringSvg} viewBox="0 0 90 90">
                  <circle
                    className={styles.ringBg}
                    cx="45"
                    cy="45"
                    r={radius}
                  />
                  <circle
                    className={styles.ringFill}
                    cx="45"
                    cy="45"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                  />
                </svg>
                <div className={styles.ringLabel}>
                  <span className={styles.ringPercent}>{conversionRate}%</span>
                </div>
              </div>
              <div className={styles.progressMeta}>
                <p className={styles.welcomeLeft}>
                  <strong>Taux de réponse moyen</strong>
                </p>
                <p style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                  Basé sur le nombre de RSVP reçus par rapport aux invités créés
                  sur la plateforme.
                </p>
              </div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.listStatsCard}`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Crown size={18} /> Répartition des rôles
              </h2>
              <Link href="/super-admin/users" className={styles.cardLink}>
                Voir tout →
              </Link>
            </div>
            <div className={styles.statsList}>
              <div className={styles.statItem}>
                <div className={styles.statLabelContent}>
                  <div
                    className={`${styles.statIndicator} ${styles.roleOrganisateur}`}
                  ></div>
                  <span>Organisateurs</span>
                </div>
                <span className={styles.statCount}>
                  {stats.users.byRole.HOST}
                </span>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLabelContent}>
                  <div
                    className={`${styles.statIndicator} ${styles.roleAdmin}`}
                  ></div>
                  <span>Administrateurs</span>
                </div>
                <span className={styles.statCount}>
                  {stats.users.byRole.ADMIN}
                </span>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLabelContent}>
                  <div
                    className={`${styles.statIndicator} ${styles.roleProvider}`}
                  ></div>
                  <span>Prestataires</span>
                </div>
                <span className={styles.statCount}>
                  {stats.users.byRole.PROVIDER}
                </span>
              </div>
            </div>
          </div>

          {/* Activity & invitation states */}
          <div className={`${styles.card} ${styles.activityCard}`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Activity size={18} /> Activité système
              </h2>
            </div>
            <div className={styles.activityGrid}>
              <div className={styles.activityItem}>
                <div className={styles.activityLabel}>Utilisateurs actifs</div>
                <div className={styles.activityValue}>
                  {stats.users.active} / {stats.users.total}
                </div>
                <div className={styles.activityMeta}>Connexion récente</div>
              </div>
              <div className={styles.activityItem}>
                <div className={styles.activityLabel}>RSVPs confirmés</div>
                <div className={styles.activityValue}>
                  {stats.guests.confirmed}
                </div>
                <div className={styles.activityMeta}>Réponses positives</div>
              </div>
              <div className={styles.activityItem}>
                <div className={styles.activityLabel}>RSVPs déclinés</div>
                <div className={styles.activityValue}>
                  {stats.guests.declined}
                </div>
                <div className={styles.activityMeta}>Réponses négatives</div>
              </div>
              <div className={styles.activityItem}>
                <div className={styles.activityLabel}>RSVPs en attente</div>
                <div className={styles.activityValue}>
                  {stats.guests.pending}
                </div>
                <div className={styles.activityMeta}>Pas encore répondu</div>
              </div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.listStatsCard}`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Calendar size={18} /> État des invitations
              </h2>
              <Link href="/super-admin/invitations" className={styles.cardLink}>
                Détails →
              </Link>
            </div>
            <div className={styles.statsList}>
              <div className={styles.statItem}>
                <div className={styles.statLabelContent}>
                  <div
                    className={`${styles.statIndicator} ${styles.statusDraft}`}
                  ></div>
                  <span>Brouillons</span>
                </div>
                <span className={styles.statCount}>
                  {stats.invitations.draft}
                </span>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLabelContent}>
                  <div
                    className={`${styles.statIndicator} ${styles.statusPublished}`}
                  ></div>
                  <span>Publiées</span>
                </div>
                <span className={styles.statCount}>
                  {stats.invitations.published}
                </span>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLabelContent}>
                  <div
                    className={`${styles.statIndicator} ${styles.statusArchived}`}
                  ></div>
                  <span>Archivées</span>
                </div>
                <span className={styles.statCount}>
                  {stats.invitations.archived}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
