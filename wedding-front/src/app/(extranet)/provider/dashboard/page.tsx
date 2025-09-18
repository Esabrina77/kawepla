'use client';

import { useState, useEffect } from 'react';
import { useProviderProfile } from '@/hooks/useProviderProfile';
import { useProviderServices } from '@/hooks/useProviderServices';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { 
  Star, 
  Users, 
  Calendar, 
  Euro, 
  TrendingUp, 
  Eye,
  Plus,
  MapPin,
  Camera,
  Briefcase,
  Clock
} from 'lucide-react';
import styles from './dashboard.module.css';

export default function ProviderDashboard() {
  const { profile, loading: profileLoading } = useProviderProfile();
  const { services, loading: servicesLoading } = useProviderServices();
  const { categories } = useServiceCategories();
  
  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    responseRate: 0
  });

  useEffect(() => {
    if (services) {
      setStats({
        totalServices: services.length,
        activeServices: services.filter(s => s.isActive).length,
        totalBookings: 0, // TODO: Implémenter avec les bookings
        monthlyRevenue: services.reduce((sum, s) => sum + s.price, 0),
        averageRating: profile?.rating || 0,
        responseRate: 95 // TODO: Calculer avec les vraies données
      });
    }
  }, [services, profile]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Catégorie inconnue';
  };

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
    <div className={styles.dashboardContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.badge}>
          <Star style={{ width: '16px', height: '16px' }} />
          Dashboard Provider
        </div>
        
        <h1 className={styles.title}>
          Bonjour <span className={styles.titleAccent}>{profile.businessName}</span>
        </h1>
        
        <p className={styles.subtitle}>
          Gérez vos services et suivez vos performances
        </p>
      </div>

      {/* Profile Overview */}
      <div className={styles.profileOverview}>
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.profilePhoto}>
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt={profile.businessName} />
              ) : (
                <Camera size={32} />
              )}
            </div>
            <div className={styles.profileInfo}>
              <h3>{profile.businessName}</h3>
              <div className={styles.profileMeta}>
                <MapPin size={14} />
                <span>{profile.displayCity}</span>
                <span className={styles.category}>
                  {getCategoryName(profile.categoryId)}
                </span>
              </div>
              <div className={styles.rating}>
                <Star size={16} className={styles.starIcon} />
                <span>{profile.rating.toFixed(1)}</span>
                <span className={styles.reviewCount}>({profile.reviewCount} avis)</span>
              </div>
            </div>
          </div>
          
          <div className={styles.profileStatus}>
            {profile.status === 'APPROVED' ? (
              <span className={styles.statusApproved}>✓ Profil approuvé</span>
            ) : (
              <span className={styles.statusPending}>⏳ En attente d'approbation</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Briefcase size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalServices}</h3>
            <p>Services créés</p>
            <span className={styles.statSubtext}>
              {stats.activeServices} actifs
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Calendar size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalBookings}</h3>
            <p>Réservations</p>
            <span className={styles.statSubtext}>
              Ce mois
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Euro size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.monthlyRevenue}€</h3>
            <p>Chiffre d'affaires</p>
            <span className={styles.statSubtext}>
              Ce mois
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.responseRate}%</h3>
            <p>Taux de réponse</p>
            <span className={styles.statSubtext}>
              Moyenne
            </span>
          </div>
        </div>
      </div>

      {/* Recent Services */}
      <div className={styles.recentServices}>
        <div className={styles.sectionHeader}>
          <h2>Mes Services</h2>
          <button 
            onClick={() => window.location.href = '/provider/services/create'}
            className={styles.addServiceButton}
          >
            <Plus size={16} />
            Ajouter un service
          </button>
        </div>

        {servicesLoading ? (
          <div className={styles.loadingServices}>
            <div className={styles.loadingSpinner}></div>
            <p>Chargement des services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className={styles.emptyServices}>
            <Briefcase size={48} />
            <h3>Aucun service créé</h3>
            <p>Commencez par créer votre premier service</p>
            <button 
              onClick={() => window.location.href = '/provider/services/create'}
              className={styles.createServiceButton}
            >
              <Plus size={20} />
              Créer mon premier service
            </button>
          </div>
        ) : (
          <div className={styles.servicesGrid}>
            {services.slice(0, 4).map((service) => (
              <div key={service.id} className={styles.serviceCard}>
                <div className={styles.serviceHeader}>
                  <h4>{service.name}</h4>
                  <span className={`${styles.serviceStatus} ${service.isActive ? styles.active : styles.inactive}`}>
                    {service.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                
                <p className={styles.serviceDescription}>
                  {service.description.substring(0, 100)}
                  {service.description.length > 100 && '...'}
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
                
                <button 
                  onClick={() => window.location.href = `/provider/services/${service.id}/edit`}
                  className={styles.viewServiceButton}
                >
                  <Eye size={16} />
                  Voir le service
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
