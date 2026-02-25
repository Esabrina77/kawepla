'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProviderProfile } from '@/hooks/useProviderProfile';
import { useProviderServices } from '@/hooks/useProviderServices';
import { HeaderMobile } from '@/components/HeaderMobile/HeaderMobile';
import {
  Star,
  Calendar,
  Euro,
  Plus,
  Briefcase,
  Clock,
  ChevronRight
} from 'lucide-react';
import styles from './dashboard.module.css';

export default function ProviderDashboard() {
  const { profile, loading: profileLoading } = useProviderProfile();
  const { services, loading: servicesLoading } = useProviderServices();

  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    averageRating: 0
  });

  useEffect(() => {
    if (services) {
      setStats({
        totalServices: services.length,
        activeServices: services.filter(s => s.isActive).length,
        totalBookings: 0, 
        monthlyRevenue: services.reduce((sum, s) => sum + s.price, 0),
        averageRating: profile?.rating || 0
      });
    }
  }, [services, profile]);

  if (profileLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Chargement du dashboard...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.noProfileContainer}>
        <div className={styles.noProfileContent}>
          <Briefcase className={styles.noProfileIcon} />
          <h2>Bienvenue !</h2>
          <p>Créez votre profil professionnel pour commencer à proposer vos services sur Kawepla.</p>
          <button
            onClick={() => window.location.href = '/provider/profile'}
            className={styles.createProfileButton}
          >
            <Plus size={20} />
            Créer mon profil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <HeaderMobile title={`Dashboard`} showBackButton={false} />

      <div className={styles.pageContent}>
        {/* Hero */}
        <div className={styles.heroCard}>
          <div className={styles.heroLeft}>
            <h1>Bonjour, {profile.businessName} 👋</h1>
            <p>Voici l'activité de votre entreprise aujourd'hui</p>
          </div>
          <div className={styles.heroAction}>
            <Link href="/provider/services/create" className={styles.createButton}>
              <Plus size={18} /> Nouveau Service
            </Link>
          </div>
        </div>

        {/* Stats Bento */}
        <div className={styles.bentoGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIconBg}>
              <Briefcase size={18} />
            </div>
            <div className={styles.statValue}>{stats.totalServices}</div>
            <div className={styles.statLabel}>Services</div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIconBg} ${styles.success}`}>
              <Star size={18} />
            </div>
            <div className={styles.statValue}>{stats.activeServices}</div>
            <div className={styles.statLabel}>Actifs</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconBg}>
              <Calendar size={18} />
            </div>
            <div className={styles.statValue}>{stats.totalBookings}</div>
            <div className={styles.statLabel}>Résas</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconBg}>
              <Euro size={18} />
            </div>
            <div className={styles.statValue}>{stats.monthlyRevenue}€</div>
            <div className={styles.statLabel}>C.A. estimé</div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIconBg} ${styles.success}`}>
              <Star size={18} />
            </div>
            <div className={styles.statValue}>{stats.averageRating.toFixed(1)}</div>
            <div className={styles.statLabel}>Avis</div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className={styles.quickActions}>
          <div className={styles.actionsGrid}>
            <Link href="/provider/services/create" className={styles.actionCard}>
              <div className={styles.actionIcon}><Plus size={22} /></div>
              <div className={styles.actionInfo}>
                <h3>Ajouter un service</h3>
                <p>Proposez une nouvelle prestation</p>
              </div>
            </Link>

            <Link href="/provider/services" className={styles.actionCard}>
              <div className={styles.actionIcon}><Briefcase size={22} /></div>
              <div className={styles.actionInfo}>
                <h3>Gérer mes services</h3>
                <p>Modifiez vos tarifs et options</p>
              </div>
            </Link>

            <Link href="/provider/bookings" className={styles.actionCard}>
              <div className={styles.actionIcon}><Calendar size={22} /></div>
              <div className={styles.actionInfo}>
                <h3>Mes réservations</h3>
                <p>Accédez à vos demandes clients</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Recent Services */}
        {services.length > 0 && (
          <section className={styles.recentSection}>
            <div className={styles.sectionHeader}>
              <h2>Mes Services récents</h2>
              <Link href="/provider/services" className={styles.viewAll}>Voir tout</Link>
            </div>

            <div className={styles.servicesGrid}>
              {services.slice(0, 3).map((service) => (
                <Link key={service.id} href={`/provider/services/${service.id}`} className={styles.serviceCard}>
                  <div className={styles.serviceTop}>
                    <h4 className={styles.serviceName}>{service.name}</h4>
                    <span className={`${styles.statusBadge} ${service.isActive ? styles.active : styles.inactive}`}>
                      {service.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  <p className={styles.serviceDesc}>
                    {service.description.substring(0, 80)}{service.description.length > 80 && '...'}
                  </p>

                  <div className={styles.serviceMeta}>
                    <div className={styles.metaItem}>
                      <Euro size={14} />
                      <span>{service.price}€</span>
                    </div>

                    {service.duration && (
                      <div className={styles.metaItem}>
                        <Clock size={14} />
                        <span>{service.duration} min</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
