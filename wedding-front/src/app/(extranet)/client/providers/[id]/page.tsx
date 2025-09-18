'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProviderProfile, Service } from '@/lib/api/providers';
import { useProviderDetail } from '@/hooks/useProviderDetail';
import { 
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  Clock,
  Users,
  Euro,
  Camera,
  Briefcase,
  CheckCircle,
  MessageCircle,
  Heart,
  Share2,
  Award,
  Shield,
  Globe,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import styles from './provider-detail.module.css';

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.id as string;
  
  const { provider, services, loading, error } = useProviderDetail(providerId);
  const [activeTab, setActiveTab] = useState<'services' | 'portfolio' | 'reviews'>('services');

  const formatPrice = (price: number, priceType: string) => {
    switch (priceType) {
      case 'FIXED':
        return `${price}€`;
      case 'PER_HOUR':
        return `${price}€/h`;
      case 'PER_PERSON':
        return `${price}€/pers`;
      case 'CUSTOM':
        return 'Sur devis';
      default:
        return `${price}€`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { label: 'Vérifié', color: '#27ae60', icon: CheckCircle };
      case 'PENDING':
        return { label: 'En attente', color: '#f39c12', icon: Clock };
      case 'SUSPENDED':
        return { label: 'Suspendu', color: '#e74c3c', icon: Shield };
      case 'REJECTED':
        return { label: 'Rejeté', color: '#95a5a6', icon: Shield };
      default:
        return { label: 'Inconnu', color: '#6c757d', icon: Shield };
    }
  };

  const handleContact = () => {
    // TODO: Implémenter le système de contact
    alert('Fonctionnalité de contact à implémenter');
  };

  const handleFavorite = () => {
    // TODO: Implémenter les favoris
    alert('Fonctionnalité de favoris à implémenter');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: provider?.businessName,
        text: `Découvrez ${provider?.businessName}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className={styles.errorContainer}>
        <h2>❌ Erreur</h2>
        <p>{error || 'Provider non trouvé'}</p>
        <button onClick={() => router.back()} className={styles.backButton}>
          <ArrowLeft size={16} />
          Retour
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(provider.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className={styles.detailContainer}>
      {/* Header avec navigation */}
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          <ArrowLeft size={16} />
          Retour
        </button>
      </div>

      {/* Hero Section - Nouvelle mise en page */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          {/* Photo et informations principales */}
          <div className={styles.mainInfo}>
            <div className={styles.providerPhoto}>
              {provider.profilePhoto ? (
                <img src={provider.profilePhoto} alt={provider.businessName} />
              ) : (
                <div className={styles.photoPlaceholder}>
                  <Camera size={32} />
                </div>
              )}
            </div>
            
            <div className={styles.providerDetails}>
              <div className={styles.providerTitle}>
                <h1>{provider.businessName}</h1>
                <div className={styles.statusBadge} style={{ color: statusInfo.color }}>
                  <StatusIcon size={14} />
                  {statusInfo.label}
                </div>
              </div>
              
              <div className={styles.categoryTag}>
                {provider.category?.icon} {provider.category?.name}
              </div>
              
              <div className={styles.rating}>
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(provider.rating) ? styles.filled : styles.empty}
                    />
                  ))}
                </div>
                <span className={styles.ratingText}>
                  {provider.rating.toFixed(1)} ({provider.reviewCount} avis)
                </span>
              </div>
            </div>
          </div>

          {/* Informations secondaires et actions */}
          <div className={styles.secondaryInfo}>
            <div className={styles.contactInfo}>
              <div className={styles.infoItem}>
                <MapPin size={16} />
                <span>{provider.displayCity}</span>
              </div>
              <div className={styles.infoItem}>
                <Phone size={16} />
                <span>{provider.phone}</span>
              </div>
              <div className={styles.infoItem}>
                <Calendar size={16} />
                <span>Membre depuis {formatDate(provider.createdAt)}</span>
              </div>
            </div>

            <div className={styles.heroActions}>
              <button onClick={handleContact} className={styles.contactButton}>
                <MessageCircle size={16} />
                Contacter
              </button>
              <button onClick={handleFavorite} className={styles.favoriteButton}>
                <Heart size={16} />
                Favoris
              </button>
              <button onClick={handleShare} className={styles.shareButton}>
                <Share2 size={16} />
                Partager
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {provider.description && (
        <div className={styles.descriptionSection}>
          <h2>À propos</h2>
          <p>{provider.description}</p>
        </div>
      )}

      {/* Tabs Navigation - Horizontal */}
      <div className={styles.tabsNavigation}>
        <button
          className={`${styles.tabButton} ${activeTab === 'services' ? styles.active : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <Briefcase size={16} />
          <span>Services</span>
          <span className={styles.tabCount}>({services.length})</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'portfolio' ? styles.active : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          <Camera size={16} />
          <span>Portfolio</span>
          <span className={styles.tabCount}>({provider.portfolio?.length || 0})</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'reviews' ? styles.active : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <Star size={16} />
          <span>Avis</span>
          <span className={styles.tabCount}>({provider.reviewCount})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'services' && (
          <div className={styles.servicesSection}>
            {services.length > 0 ? (
              <div className={styles.servicesGrid}>
                {services.map((service) => (
                  <div key={service.id} className={styles.serviceCard}>
                    <div className={styles.serviceCardHeader}>
                      <div className={styles.serviceInfo}>
                        <h3>{service.name}</h3>
                        {service.description && (
                          <p className={styles.serviceDescription}>{service.description}</p>
                        )}
                      </div>
                      <div className={styles.servicePrice}>
                        {formatPrice(service.price, service.priceType)}
                      </div>
                    </div>
                    
                    <div className={styles.serviceMeta}>
                      <div className={styles.serviceDetails}>
                        {service.duration && (
                          <div className={styles.serviceDetail}>
                            <Clock size={14} />
                            <span>{service.duration} min</span>
                          </div>
                        )}
                        
                        {service.capacity && (
                          <div className={styles.serviceDetail}>
                            <Users size={14} />
                            <span>Jusqu'à {service.capacity} personnes</span>
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.serviceStatus}>
                        {service.isActive ? (
                          <span className={styles.activeStatus}>
                            <CheckCircle size={12} />
                            Disponible
                          </span>
                        ) : (
                          <span className={styles.inactiveStatus}>
                            <Clock size={12} />
                            Indisponible
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.serviceActions}>
                      <button className={styles.requestButton}>
                        <MessageCircle size={14} />
                        Demander un devis
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Briefcase size={48} />
                <h3>Aucun service disponible</h3>
                <p>Ce prestataire n'a pas encore ajouté de services.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className={styles.portfolioSection}>
            <h2>Portfolio</h2>
            {provider.portfolio && provider.portfolio.length > 0 ? (
              <div className={styles.portfolioGrid}>
                {provider.portfolio.map((photo, index) => (
                  <div key={index} className={styles.portfolioItem}>
                    <img src={photo} alt={`Portfolio ${index + 1}`} />
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Camera size={48} />
                <h3>Aucune photo dans le portfolio</h3>
                <p>Ce provider n'a pas encore ajouté de photos à son portfolio.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className={styles.reviewsSection}>
            <h2>Avis clients</h2>
            <div className={styles.reviewsSummary}>
              <div className={styles.ratingSummary}>
                <div className={styles.ratingNumber}>{provider.rating.toFixed(1)}</div>
                <div className={styles.ratingStars}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(provider.rating) ? styles.filled : styles.empty}
                    />
                  ))}
                </div>
                <div className={styles.ratingCount}>{provider.reviewCount} avis</div>
              </div>
            </div>
            
            <div className={styles.emptyState}>
              <Star size={48} />
              <h3>Aucun avis pour le moment</h3>
              <p>Soyez le premier à laisser un avis pour ce provider.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
