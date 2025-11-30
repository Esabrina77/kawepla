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
  ChevronDown
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
        totalBookings: 0, // TODO: Implémenter avec les bookings
        monthlyRevenue: services.reduce((sum, s) => sum + s.price, 0),
        averageRating: profile?.rating || 0
      });
    }
  }, [services, profile]);

  const formatPrice = (price: number, priceType: string) => {
    switch (priceType) {
      case 'PER_PERSON':
        return `${price}€/personne`;
      case 'PER_HOUR':
        return `${price}€/heure`;
      case 'CUSTOM':
        return 'Sur devis';
      default:
        return `${price}€`;
    }
  };

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
          <h2>Bienvenue sur votre dashboard provider</h2>
          <p>Créez votre profil pour commencer à proposer vos services</p>
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
      <HeaderMobile title={`Bonjour ${profile.businessName}`} />

      <main className={styles.main}>
        {/* Page Title */}
        <h1 className={styles.pageTitle}>Tableau de bord</h1>

        {/* Section Statistiques */}
        <section className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>Statistiques</h2>
          
          <div className={styles.statsGrid}>
            {/* Services créés */}
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <Briefcase size={20} />
              </div>
              <div className={styles.statValue}>{stats.totalServices}</div>
              <div className={styles.statLabel}>Services créés</div>
            </div>
            
            {/* Services actifs */}
            <div className={styles.statCard}>
              <div className={`${styles.statIconWrapper} ${styles.success}`}>
                <Star size={20} />
              </div>
              <div className={styles.statValue}>{stats.activeServices}</div>
              <div className={styles.statLabel}>Services actifs</div>
            </div>
            
            {/* Réservations */}
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <Calendar size={20} />
              </div>
              <div className={styles.statValue}>{stats.totalBookings}</div>
              <div className={styles.statLabel}>Réservations</div>
            </div>
            
            {/* Chiffre d'affaires */}
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <Euro size={20} />
              </div>
              <div className={styles.statValue}>{stats.monthlyRevenue}€</div>
              <div className={styles.statLabel}>Chiffre d'affaires</div>
            </div>
            
            {/* Note moyenne */}
            <div className={styles.statCard}>
              <div className={`${styles.statIconWrapper} ${styles.success}`}>
                <Star size={20} />
              </div>
              <div className={styles.statValue}>{stats.averageRating.toFixed(1)}</div>
              <div className={styles.statLabel}>Note moyenne</div>
            </div>
          </div>
        </section>

        {/* Actions rapides */}
        <section className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Actions rapides</h2>
          <div className={styles.actionsGrid}>
            <Link
              href="/provider/services/create"
              className={styles.actionCard}
            >
              <div className={styles.actionLeft}>
                <div className={styles.actionIconWrapper}>
                  <Plus size={24} />
                </div>
                <div className={styles.actionContent}>
                  <div className={styles.actionTitle}>Créer un service</div>
                  <div className={styles.actionDescription}>Ajouter une nouvelle prestation</div>
                </div>
              </div>
              <div className={styles.actionArrow}>
                <ChevronDown size={20} style={{ transform: 'rotate(-90deg)' }} />
              </div>
            </Link>

            <Link
              href="/provider/services"
              className={styles.actionCard}
            >
              <div className={styles.actionLeft}>
                <div className={styles.actionIconWrapper}>
                  <Briefcase size={24} />
                </div>
                <div className={styles.actionContent}>
                  <div className={styles.actionTitle}>Gérer mes services</div>
                  <div className={styles.actionDescription}>Voir et modifier vos services</div>
                </div>
              </div>
              <div className={styles.actionArrow}>
                <ChevronDown size={20} style={{ transform: 'rotate(-90deg)' }} />
              </div>
            </Link>

            <Link
              href="/provider/bookings"
              className={styles.actionCard}
            >
              <div className={styles.actionLeft}>
                <div className={styles.actionIconWrapper}>
                  <Calendar size={24} />
                </div>
                <div className={styles.actionContent}>
                  <div className={styles.actionTitle}>Mes réservations</div>
                  <div className={styles.actionDescription}>Consulter vos demandes</div>
                </div>
              </div>
              <div className={styles.actionArrow}>
                <ChevronDown size={20} style={{ transform: 'rotate(-90deg)' }} />
              </div>
            </Link>
          </div>
        </section>

        {/* Services récents */}
        {services.length > 0 && (
          <section className={styles.recentServices}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Mes Services</h2>
              <Link 
                href="/provider/services"
                className={styles.viewAllLink}
              >
                Voir tout
                <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
              </Link>
            </div>

            {servicesLoading ? (
              <div className={styles.loadingServices}>
                <div className={styles.loadingSpinner}></div>
                <p>Chargement des services...</p>
              </div>
            ) : (
              <div className={styles.servicesGrid}>
                {services.slice(0, 3).map((service) => (
                  <Link
                    key={service.id}
                    href={`/provider/services/${service.id}`}
                    className={styles.serviceCard}
                  >
                    <div className={styles.serviceHeader}>
                      <h4 className={styles.serviceName}>{service.name}</h4>
                      <span className={`${styles.serviceStatus} ${service.isActive ? styles.active : styles.inactive}`}>
                        {service.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    
                    <p className={styles.serviceDescription}>
                      {service.description.substring(0, 80)}
                      {service.description.length > 80 && '...'}
                    </p>
                    
                    <div className={styles.serviceDetails}>
                      <div className={styles.servicePrice}>
                        <Euro size={14} />
                        <span>{formatPrice(service.price, service.priceType)}</span>
                      </div>
                      
                      {service.duration && (
                        <div className={styles.serviceDuration}>
                          <Clock size={14} />
                          <span>{service.duration}min</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
