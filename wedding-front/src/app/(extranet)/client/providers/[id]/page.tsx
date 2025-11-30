'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProviderProfile, Service } from '@/lib/api/providers';
import { useProviderDetail } from '@/hooks/useProviderDetail';
import { HeaderMobile } from '@/components/HeaderMobile';
import {
  MapPin,
  Phone,
  Calendar,
  Star,
  Clock,
  Users,
  Camera,
  Briefcase,
  CheckCircle,
  MessageCircle,
  Heart,
  Share2,
  Music,
  UtensilsCrossed,
  Flower2,
  Palette,
  Building2
} from 'lucide-react';
import { WebsiteIcon, InstagramIcon, TikTokIcon, FacebookIcon } from '@/components/icons/SocialIcons';
import { useToast } from '@/components/ui/toast';
import styles from './provider-detail.module.css';

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.id as string;
  const { addToast } = useToast();

  const { provider, services, loading, error } = useProviderDetail(providerId);
  const [activeTab, setActiveTab] = useState<'services' | 'portfolio' | 'reviews'>('services');
  const [isFavorite, setIsFavorite] = useState(false);

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

  const getCategoryIcon = (categoryName?: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Traiteur': <UtensilsCrossed size={14} />,
      'Photographe': <Camera size={14} />,
      'DJ': <Music size={14} />,
      'Fleuriste': <Flower2 size={14} />,
      'Décoration': <Palette size={14} />,
    };
    return icons[categoryName || ''] || <Building2 size={14} />;
  };

  const handleContact = () => {
    router.push(`/client/providers/${providerId}/messages`);
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implémenter l'API pour les favoris
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
      addToast({
        type: 'success',
        title: 'Lien copié',
        message: 'Le lien a été copié dans le presse-papiers'
      });
    }
  };

  if (loading) {
    return (
      <div className={styles.providerDetailPage}>
        <HeaderMobile title="Détails du prestataire" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingSpinner}></div>
            <p>Chargement du profil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className={styles.providerDetailPage}>
        <HeaderMobile title="Détails du prestataire" />
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <h2>❌ Erreur</h2>
            <p>{error || 'Prestataire non trouvé'}</p>
            <button onClick={() => router.back()} className={styles.backButton}>
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.providerDetailPage}>
      <HeaderMobile title={provider.businessName} />

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          {/* Provider Image */}
          <div
            className={styles.providerImage}
            style={{
              backgroundImage: provider.profilePhoto
                ? `url(${provider.profilePhoto})`
                : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />

          {/* Provider Info */}
          <div className={styles.providerInfo}>
            <div className={styles.providerHeader}>
              <div className={styles.providerHeaderLeft}>
                <div className={styles.providerNameRow}>
                  <h1 className={styles.providerName}>{provider.businessName}</h1>
                  {provider.category?.name && (
                    <div className={styles.categoryBadge}>
                      {getCategoryIcon(provider.category.name)}
                      <span>{provider.category.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions - Desktop only */}
              <div className={styles.actionsRow}>
                <button
                  className={styles.contactButton}
                  onClick={handleContact}
                >
                  <MessageCircle size={18} />
                  Contacter
                </button>
                <button
                  className={`${styles.actionButton} ${isFavorite ? styles.favoriteActive : ''}`}
                  onClick={handleFavorite}
                >
                  <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  className={styles.actionButton}
                  onClick={handleShare}
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <p className={styles.providerDescription}>
              {provider.description || 'Prestataire professionnel pour vos événements.'}
            </p>

            <div className={styles.providerMeta}>
              <div className={styles.ratingRow}>
                <Star className={styles.starIcon} size={16} fill="currentColor" />
                <span className={styles.ratingValue}>
                  {provider.rating.toFixed(1)}
                </span>
                <span>({provider.reviewCount} avis)</span>
              </div>

              {/* Location */}
              <div className={styles.locationRow}>
                <MapPin size={16} />
                <span>{provider.displayCity}</span>
              </div>

              {/* Réseaux sociaux */}
              {(provider.website || provider.instagram || provider.tiktok || provider.facebook) && (
                <div className={styles.socialLinks}>
                  {provider.website && (
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      title="Site web"
                    >
                      <WebsiteIcon size={18} />
                    </a>
                  )}
                  {provider.instagram && (
                    <a
                      href={provider.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      title="Instagram"
                    >
                      <InstagramIcon size={18} />
                    </a>
                  )}
                  {provider.tiktok && (
                    <a
                      href={provider.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      title="TikTok"
                    >
                      <TikTokIcon size={18} />
                    </a>
                  )}
                  {provider.facebook && (
                    <a
                      href={provider.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      title="Facebook"
                    >
                      <FacebookIcon size={18} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions - Mobile only */}
          <div className={styles.actionsRowMobile}>
            <button
              className={styles.contactButton}
              onClick={handleContact}
            >
              <MessageCircle size={18} />
              Contacter
            </button>
            <button
              className={`${styles.actionButton} ${isFavorite ? styles.favoriteActive : ''}`}
              onClick={handleFavorite}
            >
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              className={styles.actionButton}
              onClick={handleShare}
            >
              <Share2 size={18} />
            </button>
          </div>
        </section>

        {/* Tabs Navigation */}
        <div className={styles.tabsNavigation}>
          <button
            className={`${styles.tabButton} ${activeTab === 'services' ? styles.active : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <Briefcase size={18} />
            <span>Services</span>
            {services.length > 0 && (
              <span className={styles.tabCount}>({services.length})</span>
            )}
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'portfolio' ? styles.active : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            <Camera size={18} />
            <span>Portfolio</span>
            {provider.portfolio && provider.portfolio.length > 0 && (
              <span className={styles.tabCount}>({provider.portfolio.length})</span>
            )}
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'reviews' ? styles.active : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <Star size={18} />
            <span>Avis</span>
            {provider.reviewCount > 0 && (
              <span className={styles.tabCount}>({provider.reviewCount})</span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'services' && (
            <div className={styles.servicesSection}>
              {services.length > 0 ? (
                <div className={styles.servicesList}>
                  {services.map((service) => (
                    <div key={service.id} className={styles.serviceCard}>
                      <div className={styles.serviceHeader}>
                        <h3 className={styles.serviceName}>{service.name}</h3>
                        <div className={styles.servicePrice}>
                          {formatPrice(service.price, service.priceType)}
                        </div>
                      </div>

                      {service.description && (
                        <p className={styles.serviceDescription}>
                          {service.description}
                        </p>
                      )}

                      <div className={styles.serviceMeta}>
                        {service.duration && (
                          <div className={styles.serviceMetaItem}>
                            <Clock size={14} />
                            <span>{service.duration} min</span>
                          </div>
                        )}
                        {service.capacity && (
                          <div className={styles.serviceMetaItem}>
                            <Users size={14} />
                            <span>Jusqu'à {service.capacity} personnes</span>
                          </div>
                        )}
                        {service.isActive ? (
                          <div className={styles.serviceStatus}>
                            <CheckCircle size={14} />
                            <span>Disponible</span>
                          </div>
                        ) : (
                          <div className={`${styles.serviceStatus} ${styles.inactive}`}>
                            <Clock size={14} />
                            <span>Indisponible</span>
                          </div>
                        )}
                      </div>

                      <button
                        className={styles.requestButton}
                        onClick={handleContact}
                      >
                        Demander un devis
                      </button>
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
              {provider.portfolio && provider.portfolio.length > 0 ? (
                <div className={styles.portfolioGrid}>
                  {provider.portfolio.map((photo, index) => (
                    <div
                      key={index}
                      className={styles.portfolioItem}
                      onClick={() => {
                        // TODO: Ouvrir une lightbox pour voir l'image en grand
                        window.open(photo, '_blank');
                      }}
                    >
                      <img src={photo} alt={`Portfolio ${index + 1}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <Camera size={48} />
                  <h3>Aucune photo dans le portfolio</h3>
                  <p>Ce prestataire n'a pas encore ajouté de photos à son portfolio.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className={styles.reviewsSection}>
              <div className={styles.reviewsSummary}>
                <div className={styles.ratingSummary}>
                  <div className={styles.ratingNumber}>
                    {provider.rating.toFixed(1)}
                  </div>
                  <div className={styles.ratingStars}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={i < Math.floor(provider.rating) ? styles.filled : styles.empty}
                        fill={i < Math.floor(provider.rating) ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <div className={styles.ratingCount}>
                    {provider.reviewCount} avis
                  </div>
                </div>
              </div>

              <div className={styles.emptyState}>
                <Star size={48} />
                <h3>Aucun avis pour le moment</h3>
                <p>Soyez le premier à laisser un avis pour ce prestataire.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
