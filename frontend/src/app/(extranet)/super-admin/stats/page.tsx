"use client";

import { useState } from "react";
import styles from "./stats.module.css";
import { useAdminStats } from "@/hooks/useAdminStats";
import {
  BarChart3,
  Users,
  Target,
  FileText,
  Mail,
  TrendingUp,
  Calendar,
  RefreshCw,
  Heart,
  Shield,
  User,
  CheckCircle,
  Clock,
  Archive,
  AlertCircle,
  DollarSign,
  Briefcase,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

export default function StatsPage() {
  const [dateFilter, setDateFilter] = useState("30");
  const { stats, loading, error, refetch } = useAdminStats(dateFilter);

  if (loading) {
    return (
      <div className={styles.statsContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Analyse des données en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.statsContainer}>
        <div className={styles.errorContainer}>
          <AlertCircle size={40} color="#EF4444" />
          <h2>Erreur de synchronisation</h2>
          <p>{error}</p>
          <button onClick={refetch} className={styles.retryButton}>
            <RefreshCw size={18} />
            Réessayer la connexion
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Couleurs pour les graphiques
  const COLORS = [
    "#14B8A6",
    "#0D9488",
    "#0F766E",
    "#115E59",
    "#134E4A",
    "#2DD4BF",
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <div className={styles.statsContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.badge}>
          <BarChart3 size={14} />
          Business Intelligence
        </div>

        <h1 className={styles.title}>
          Vue <span className={styles.titleAccent}>analytique</span>
        </h1>

        <p className={styles.subtitle}>
          Suivez la croissance, les revenus et l'engagement des utilisateurs sur
          l'ensemble de l'écosystème Kawepla.
        </p>

        <div className={styles.filtersContainer}>
          <div className={styles.filterContainer}>
            <Calendar className={styles.filterIcon} />
            <select
              className={styles.filterSelect}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">90 derniers jours</option>
              <option value="365">12 derniers mois</option>
            </select>
          </div>

          <button onClick={refetch} className={styles.refreshButton}>
            <RefreshCw size={16} />
            Actualiser les données
          </button>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <DollarSign size={20} />
          </div>
          <div className={styles.statContent}>
            <h3>CA de la période</h3>
            <div className={styles.statValue}>
              {formatCurrency(stats.overview.revenueThisMonth)}
            </div>
            <div className={`${styles.statChange}`}>
              <TrendingUp size={14} />
              {formatCurrency(stats.overview.totalRevenue)} au total
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={20} />
          </div>
          <div className={styles.statContent}>
            <h3>Nouveaux utilisateurs</h3>
            <div className={styles.statValue}>
              {stats.users.recentRegistrations}
            </div>
            <div className={styles.statChange}>
              <CheckCircle size={14} />
              {stats.users.total} inscrits au total
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FileText size={20} />
          </div>
          <div className={styles.statContent}>
            <h3>Invitations créées</h3>
            <div className={styles.statValue}>
              {stats.invitations.thisMonth}
            </div>
            <div className={`${styles.statChange}`}>
              <TrendingUp size={14} />
              {stats.invitations.published} publiées ({stats.invitations.total}{" "}
              total)
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Target size={20} />
          </div>
          <div className={styles.statContent}>
            <h3>Réponses RSVP reçues</h3>
            <div className={styles.statValue}>
              {stats.guests.confirmed + stats.guests.declined}
            </div>
            <div className={styles.statChange}>
              <Users size={14} />
              {stats.guests.totalConfirmed} confirmations totales
            </div>
          </div>
        </div>
      </div>

      {/* Primary Charts */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartContainer}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>
              <TrendingUp size={18} />
              Évolution des revenus (€)
            </h3>
          </div>
          <div className={styles.responsiveContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trends}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(0,0,0,0.05)"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fontWeight: 600,
                    fill: "var(--text-secondary)",
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fontWeight: 600,
                    fill: "var(--text-secondary)",
                  }}
                  tickFormatter={(val) => `${val}€`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    fontWeight: 700,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenus"
                  stroke="#14B8A6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>
              <PieChartIcon size={18} />
              Prestataires par Catégorie
            </h3>
          </div>
          <div className={styles.responsiveContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              justifyContent: "center",
            }}
          >
            {stats.categories.slice(0, 4).map((cat, i) => (
              <div
                key={cat.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: COLORS[i % COLORS.length],
                  }}
                />
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                  }}
                >
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details Bento Section */}
      <div className={styles.infoCardsGrid}>
        <div className={styles.statsDetailsCard}>
          <h3 className={styles.chartTitle}>
            <DollarSign size={18} />
            Détails des Revenus
          </h3>
          <div className={styles.detailsList} style={{ marginTop: "1.5rem" }}>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>
                <Briefcase size={16} /> Commissions Prestataires
              </div>
              <div className={styles.detailValue}>
                {formatCurrency(stats.revenue.commissions)}
              </div>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progress}
                style={{
                  width: `${(stats.revenue.commissions / stats.revenue.total) * 100}%`,
                }}
              />
            </div>

            <div className={styles.detailItem} style={{ marginTop: "0.5rem" }}>
              <div className={styles.detailLabel}>
                <Shield size={16} /> Ventes Service Packs
              </div>
              <div className={styles.detailValue}>
                {formatCurrency(stats.revenue.purchases)}
              </div>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progress}
                style={{
                  width: `${(stats.revenue.purchases / stats.revenue.total) * 100}%`,
                  background: "#0D9488",
                }}
              />
            </div>
          </div>
        </div>

        <div className={styles.statsDetailsCard}>
          <h3 className={styles.chartTitle}>
            <Users size={18} />
            Démographie Utilisateurs
          </h3>
          <div className={styles.detailsList} style={{ marginTop: "1.5rem" }}>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>
                <Heart size={16} /> Organisateurs (Hosts)
              </div>
              <div className={styles.detailValue}>
                {stats.users.byRole.HOST}
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>
                <Briefcase size={16} /> Prestataires
              </div>
              <div className={styles.detailValue}>
                {stats.users.byRole.PROVIDER}
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>
                <User size={16} /> Invités enregistrés
              </div>
              <div className={styles.detailValue}>
                {stats.users.byRole.GUEST}
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>
                <Shield size={16} /> Administrateurs
              </div>
              <div className={styles.detailValue}>
                {stats.users.byRole.ADMIN}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.statsDetailsCard}>
          <h3 className={styles.chartTitle}>
            <Clock size={18} />
            Activité & Performance
          </h3>
          <div className={styles.detailsList} style={{ marginTop: "1.5rem" }}>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>
                Emailing : Invitations envoyées
              </div>
              <div className={styles.detailValue}>
                {stats.guests.emailsSent}
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>
                Engagement : Taux de réponse RSVP
              </div>
              <div className={styles.detailValue}>
                {stats.guests.total > 0
                  ? Math.round(
                      ((stats.guests.confirmed + stats.guests.declined) /
                        stats.guests.total) *
                        100,
                    )
                  : 0}
                %
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>
                Croissance : Inscriptions (30j)
              </div>
              <div className={styles.detailValue}>
                +{stats.users.recentRegistrations}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
