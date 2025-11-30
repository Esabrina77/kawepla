'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProviderServices } from '@/hooks/useProviderServices';
import { Service } from '@/lib/api/providers';
import { HeaderMobile } from '@/components/HeaderMobile/HeaderMobile';
import { 
  Edit,
  Euro,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import styles from './service-detail.module.css';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;
  const { services, loading } = useProviderServices();
  
  const [service, setService] = useState<Service | null>(null);

  useEffect(() => {
    if (services.length > 0 && serviceId) {
      const foundService = services.find(s => s.id === serviceId);
      if (foundService) {
        setService(foundService);
      }
    }
  }, [services, serviceId]);

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

  const formatDuration = (duration?: number) => {
    if (!duration) return 'Non spécifié';
    if (duration < 60) return `${duration}min`;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return minutes > 0 ? `${hours}h${minutes}min` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Chargement du service...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className={styles.errorContainer}>
        <p>Service non trouvé</p>
        <Link href="/provider/services" className={styles.backButton}>
          <ArrowLeft size={16} />
          Retour aux services
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.serviceDetailPage}>
      <HeaderMobile title={service.name} />

      <main className={styles.main}>
        {/* Page Header with Edit Button */}
        <div className={styles.pageHeader}>
          <Link 
            href={`/provider/services/${service.id}/edit`}
            className={styles.editButton}
          >
            <Edit size={18} />
            Modifier
          </Link>
        </div>

        {/* Service Card */}
        <div className={styles.serviceCard}>
          {/* Status Badge */}
          <div className={styles.statusBadge}>
            {service.isActive ? (
              <>
                <CheckCircle size={14} />
                <span>Actif</span>
              </>
            ) : (
              <>
                <XCircle size={14} />
                <span>Inactif</span>
              </>
            )}
          </div>

          {/* Description */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Description</h2>
            <p className={styles.description}>{service.description}</p>
          </div>

          {/* Details Grid */}
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <Euro size={20} />
              <div>
                <span className={styles.detailLabel}>Prix</span>
                <span className={styles.detailValue}>
                  {formatPrice(service.price, service.priceType)}
                </span>
              </div>
            </div>

            {service.duration && (
              <div className={styles.detailItem}>
                <Clock size={20} />
                <div>
                  <span className={styles.detailLabel}>Durée</span>
                  <span className={styles.detailValue}>
                    {formatDuration(service.duration)}
                  </span>
                </div>
              </div>
            )}

            {service.capacity && (
              <div className={styles.detailItem}>
                <Users size={20} />
                <div>
                  <span className={styles.detailLabel}>Capacité</span>
                  <span className={styles.detailValue}>
                    Jusqu'à {service.capacity} personnes
                  </span>
                </div>
              </div>
            )}

            <div className={styles.detailItem}>
              <Calendar size={20} />
              <div>
                <span className={styles.detailLabel}>Créé le</span>
                <span className={styles.detailValue}>
                  {new Date(service.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Inclusions */}
          {service.inclusions && service.inclusions.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Inclusions</h2>
              <ul className={styles.list}>
                {service.inclusions.map((inclusion, index) => (
                  <li key={index}>{inclusion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {service.requirements && service.requirements.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Prérequis</h2>
              <ul className={styles.list}>
                {service.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Photos */}
          {service.photos && service.photos.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Photos ({service.photos.length})</h2>
              <div className={styles.photosGrid}>
                {service.photos.map((photo, index) => (
                  <div key={index} className={styles.photoItem}>
                    <img src={photo} alt={`${service.name} - Photo ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

