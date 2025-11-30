'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { providersApi, ProviderProfile } from '@/lib/api/providers';
import { HeaderMobile } from '@/components/HeaderMobile';
import { 
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Pause,
  Camera,
  Briefcase,
  Euro,
  Users,
  Clock as ClockIcon
} from 'lucide-react';
import { WebsiteIcon, InstagramIcon, TikTokIcon, FacebookIcon } from '@/components/icons/SocialIcons';
import styles from './provider-detail.module.css';

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.id as string;
  
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (providerId) {
      loadProvider();
    }
  }, [providerId]);

  const loadProvider = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Pour l'instant, on récupère depuis la liste
      // TODO: Créer une route spécifique pour récupérer un provider par ID
      const response = await providersApi.getAllProviders({ limit: 1000 });
      const foundProvider = response.providers.find(p => p.id === providerId);
      
      if (!foundProvider) {
        throw new Error('Provider non trouvé');
      }
      
      setProvider(foundProvider);
    } catch (err) {
      console.error('Erreur chargement provider:', err);
      setError('Erreur lors du chargement du provider');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (action: 'approve' | 'reject' | 'suspend') => {
    if (!provider) return;
    
    try {
      setActionLoading(action);
      
      let response;
      switch (action) {
        case 'approve':
          response = await providersApi.approveProvider(provider.id);
          break;
        case 'reject':
          response = await providersApi.rejectProvider(provider.id);
          break;
        case 'suspend':
          response = await providersApi.suspendProvider(provider.id);
          break;
      }
      
      setProvider(response.provider);
    } catch (err) {
      console.error(`Erreur ${action}:`, err);
      setError(`Erreur lors de l'${action === 'approve' ? 'approbation' : action === 'reject' ? 'rejet' : 'suspension'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { label: 'Approuvé', color: '#27ae60', icon: CheckCircle };
      case 'PENDING':
        return { label: 'En attente', color: '#f39c12', icon: Clock };
      case 'SUSPENDED':
        return { label: 'Suspendu', color: '#e74c3c', icon: Pause };
      case 'REJECTED':
        return { label: 'Rejeté', color: '#95a5a6', icon: XCircle };
      default:
        return { label: 'Inconnu', color: '#6c757d', icon: AlertTriangle };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.providerDetail}>
        <HeaderMobile title="Détail du provider" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement du provider...</p>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className={styles.providerDetail}>
        <HeaderMobile title="Détail du provider" />
        <div className={styles.errorContainer}>
          <h2>❌ Erreur</h2>
          <p>{error || 'Provider non trouvé'}</p>
          <button onClick={() => router.back()} className={styles.backButton}>
            Retour
          </button>
        </div>
      </div>
    );
  }

  // TypeScript assertion: provider is not null at this point
  if (!provider) {
    return null;
  }

  const statusInfo = getStatusInfo(provider.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className={styles.providerDetail}>
      <HeaderMobile 
        title={provider.businessName || 'Détail du provider'} 
        onBack={() => router.push('/super-admin/providers')}
      />
      
      <main className={styles.main}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.statusBadge} style={{ color: statusInfo.color }}>
            <StatusIcon size={14} />
            {statusInfo.label}
          </div>
        </div>

        <div className={styles.content}>
        {/* Informations principales */}
        <div className={styles.mainInfo}>
          <div className={styles.profileSection}>
            <div className={styles.profilePhoto}>
              {provider.profilePhoto ? (
                <img src={provider.profilePhoto} alt={provider.businessName} />
              ) : (
                <div className={styles.photoPlaceholder}>
                  <Camera size={32} />
                </div>
              )}
            </div>
            
            <div className={styles.profileInfo}>
              <h2>{provider.businessName}</h2>
              {provider.category && (
                <p className={styles.category}>
                  {provider.category?.icon} {provider.category?.name}
                </p>
              )}
              <div className={styles.location}>
                <MapPin size={14} />
                {provider.displayCity}
              </div>
              <div className={styles.contact}>
                <Phone size={14} />
                {provider.phone}
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
                      <WebsiteIcon size={16} />
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
                      <InstagramIcon size={16} />
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
                      <TikTokIcon size={16} />
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
                      <FacebookIcon size={16} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={styles.statsSection}>
            <div className={styles.statItem}>
              <Star size={20} />
              <div>
                <h3>{provider.rating.toFixed(1)}</h3>
                <p>{provider.reviewCount} avis</p>
              </div>
            </div>
            
            <div className={styles.statItem}>
              <Calendar size={20} />
              <div>
                <h3>{formatDate(provider.createdAt)}</h3>
                <p>Inscrit le</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {provider.description && (
          <div className={styles.descriptionSection}>
            <h3>Description</h3>
            <p>{provider.description}</p>
          </div>
        )}

        {/* Portfolio */}
        {provider.portfolio && provider.portfolio.length > 0 && (
          <div className={styles.portfolioSection}>
            <h3>Portfolio</h3>
            <div className={styles.portfolioGrid}>
              {provider.portfolio.map((photo, index) => (
                <div key={index} className={styles.portfolioItem}>
                  <img src={photo} alt={`Portfolio ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        {provider.services && provider.services.length > 0 && (
          <div className={styles.servicesSection}>
            <h3>Services ({provider.services.length})</h3>
            <div className={styles.servicesList}>
              {provider.services.map((service) => (
                <div key={service.id} className={styles.serviceItem}>
                  <div className={styles.serviceHeader}>
                    <h4>{service.name}</h4>
                    <span className={styles.servicePrice}>
                      {service.priceType === 'FIXED' ? `${service.price}€` : 
                       service.priceType === 'PER_HOUR' ? `${service.price}€/h` : 
                       service.priceType === 'PER_PERSON' ? `${service.price}€/pers` : 
                       'Sur devis'}
                    </span>
                  </div>
                  
                  {service.description && (
                    <p className={styles.serviceDescription}>{service.description}</p>
                  )}
                  
                  <div className={styles.serviceDetails}>
                    {service.duration && (
                      <div className={styles.serviceDetail}>
                        <ClockIcon size={14} />
                        <span>{service.duration} min</span>
                      </div>
                    )}
                    
                    {service.capacity && (
                      <div className={styles.serviceDetail}>
                        <Users size={14} />
                        <span>Jusqu'à {service.capacity} personnes</span>
                      </div>
                    )}
                    
                    {service.isActive ? (
                      <span className={styles.activeStatus}>✓ Actif</span>
                    ) : (
                      <span className={styles.inactiveStatus}>⏸ Inactif</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={styles.actionsSection}>
          <h3>Actions</h3>
          <div className={styles.actionButtons}>
            {provider.status !== 'APPROVED' && (
              <button
                onClick={() => handleStatusChange('approve')}
                disabled={actionLoading === 'approve'}
                className={styles.approveButton}
              >
                {actionLoading === 'approve' ? (
                  <>
                    <div className={styles.loadingSpinner}></div>
                    Approbation...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Approuver
                  </>
                )}
              </button>
            )}
            
            {provider.status !== 'SUSPENDED' && (
              <button
                onClick={() => handleStatusChange('suspend')}
                disabled={actionLoading === 'suspend'}
                className={styles.suspendButton}
              >
                {actionLoading === 'suspend' ? (
                  <>
                    <div className={styles.loadingSpinner}></div>
                    Suspension...
                  </>
                ) : (
                  <>
                    <Pause size={16} />
                    Suspendre
                  </>
                )}
              </button>
            )}
            
            {provider.status !== 'REJECTED' && (
              <button
                onClick={() => handleStatusChange('reject')}
                disabled={actionLoading === 'reject'}
                className={styles.rejectButton}
              >
                {actionLoading === 'reject' ? (
                  <>
                    <div className={styles.loadingSpinner}></div>
                    Rejet...
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    Rejeter
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
