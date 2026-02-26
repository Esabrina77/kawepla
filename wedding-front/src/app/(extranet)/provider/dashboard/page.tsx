"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProviderProfile } from "@/hooks/useProviderProfile";
import { useProviderServices } from "@/hooks/useProviderServices";
import { HeaderMobile } from "@/components/HeaderMobile/HeaderMobile";
import {
  Star,
  Calendar,
  Euro,
  Plus,
  Briefcase,
  Clock,
  ChevronRight,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import styles from "./dashboard.module.css";

export default function ProviderDashboard() {
  const { profile, loading: profileLoading } = useProviderProfile();
  const { services, loading: servicesLoading } = useProviderServices();

  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    totalBookings: 0,
    estimatedRevenue: 0,
    averageRating: 0,
  });

  useEffect(() => {
    if (services) {
      setStats({
        totalServices: services.length,
        activeServices: services.filter((s) => s.isActive).length,
        totalBookings: 0,
        estimatedRevenue: services
          .filter((s) => s.isActive)
          .reduce((sum, s) => sum + s.price, 0),
        averageRating: profile?.rating || 0,
      });
    }
  }, [services, profile]);

  if (profileLoading) {
    return (
      <div className={styles.dashboard}>
        <HeaderMobile title="Tableau de bord" showBackButton={false} />
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.dashboard}>
        <HeaderMobile title="Tableau de bord" showBackButton={false} />
        <div className={styles.noProfileContainer}>
          <div className={styles.noProfileContent}>
            <Briefcase className={styles.noProfileIcon} />
            <h2>Bienvenue !</h2>
            <p>
              Créez votre profil professionnel pour commencer à proposer vos
              services sur Kawepla.
            </p>
            <button
              onClick={() => (window.location.href = "/provider/profile")}
              className={styles.createProfileButton}
            >
              <Plus size={20} />
              Créer mon profil
            </button>
          </div>
        </div>
      </div>
    );
  }

  const limitItems = [
    {
      label: "Services actifs",
      used: stats.activeServices,
      max: stats.totalServices || 1,
    },
    { label: "Réservations", used: stats.totalBookings, max: 50 },
    { label: "Avis", used: Math.round(stats.averageRating * 10), max: 50 },
  ];

  const pct = (u: number, m: number) => Math.min(100, (u / (m || 1)) * 100);

  return (
    <div className={styles.dashboard}>
      <HeaderMobile title="Tableau de bord" showBackButton={false} />

      <div className={styles.grid}>
        {/* Welcome row */}
        <div className={styles.welcome}>
          <div className={styles.welcomeLeft}>
            <h1>
              Bonjour, {profile.businessName}
              <span>
                <img
                  className={styles.chick}
                  src="/gif/poussin.gif"
                  alt="chick"
                />
              </span>
            </h1>
            <p>Voici l&apos;activité de votre espace prestataire</p>
          </div>
          <Link href="/provider/services/create" className={styles.ctaButton}>
            <Plus size={16} /> Nouveau service
          </Link>
        </div>

        {/* Stat cards */}
        <div className={`${styles.card} ${styles.statHighlight}`}>
          <div className={styles.statLabel}>CA Estimé</div>
          <div className={styles.statValue}>{stats.estimatedRevenue}€</div>
          <div className={styles.statBar}>
            <div className={styles.statBarFill} style={{ width: "60%" }} />
          </div>
          <div className={styles.statSub}>Services actifs × tarif</div>
        </div>

        <div className={styles.card}>
          <div className={styles.statLabel}>Services</div>
          <div className={styles.statValue}>
            {stats.activeServices}
            <span> / {stats.totalServices}</span>
          </div>
          <div className={styles.statBar}>
            <div
              className={styles.statBarFill}
              style={{
                width: `${pct(stats.activeServices, stats.totalServices)}%`,
              }}
            />
          </div>
          <div className={styles.statSub}>
            {stats.activeServices > 0
              ? `${stats.activeServices} actif${stats.activeServices > 1 ? "s" : ""}`
              : "Aucun actif"}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.statLabel}>Réservations</div>
          <div className={styles.statValue}>{stats.totalBookings}</div>
          <div className={styles.statBar}>
            <div
              className={styles.statBarFill}
              style={{ width: `${pct(stats.totalBookings, 50)}%` }}
            />
          </div>
          <div className={styles.statSub}>Ce mois-ci</div>
        </div>

        <div className={styles.card}>
          <div className={styles.statLabel}>Avis clients</div>
          <div className={styles.statValue}>
            {stats.averageRating.toFixed(1)}
            <span>/5</span>
          </div>
          <div className={styles.statBar}>
            <div
              className={styles.statBarFill}
              style={{ width: `${(stats.averageRating / 5) * 100}%` }}
            />
          </div>
          <div className={styles.statSub}>Note moyenne</div>
        </div>

        {/* Quick Actions */}
        <div className={`${styles.card} ${styles.actionsCard}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Actions rapides</h2>
          </div>
          <div className={styles.actionsGrid}>
            {[
              {
                title: "Ajouter un service",
                desc: "Nouvelle prestation",
                icon: Plus,
                path: "/provider/services/create",
                c: "orange",
              },
              {
                title: "Mes réservations",
                desc: "Demandes clients",
                icon: Calendar,
                path: "/provider/bookings",
                c: "emerald",
              },
              {
                title: "Messages",
                desc: "Conversations",
                icon: MessageCircle,
                path: "/provider/messages",
                c: "sky",
              },
            ].map((a, i) => {
              const Icon = a.icon;
              return (
                <Link key={i} href={a.path} className={styles.actionRow}>
                  <div className={`${styles.actionDot} ${styles[a.c]}`}>
                    <Icon size={18} />
                  </div>
                  <div className={styles.actionInfo}>
                    <h3>{a.title}</h3>
                    <p>{a.desc}</p>
                  </div>
                  <ChevronRight size={14} className={styles.actionArrow} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Services */}
        {services.length > 0 && (
          <div className={`${styles.card} ${styles.servicesCard}`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Mes services récents</h2>
              <Link href="/provider/services" className={styles.cardLink}>
                Voir tout →
              </Link>
            </div>
            <div className={styles.servicesList}>
              {services.slice(0, 3).map((service) => (
                <Link
                  key={service.id}
                  href={`/provider/services/${service.id}`}
                  className={styles.serviceRow}
                >
                  <div className={styles.serviceRowLeft}>
                    <span className={styles.serviceRowName}>
                      {service.name}
                    </span>
                    <span className={styles.serviceRowDesc}>
                      {service.description.substring(0, 55)}
                      {service.description.length > 55 && "…"}
                    </span>
                  </div>
                  <div className={styles.serviceRowRight}>
                    <span
                      className={`${styles.statusBadge} ${service.isActive ? styles.active : styles.inactive}`}
                    >
                      {service.isActive ? "Actif" : "Inactif"}
                    </span>
                    <span className={styles.servicePrice}>
                      <Euro size={12} />
                      {service.price}€
                    </span>
                  </div>
                  <ChevronRight size={14} className={styles.actionArrow} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
