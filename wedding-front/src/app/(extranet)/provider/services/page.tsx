'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProviderServices } from '@/hooks/useProviderServices';
import { Service } from '@/lib/api/providers';
import { HeaderMobile } from '@/components/HeaderMobile/HeaderMobile';
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Euro,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  ChevronDown
} from 'lucide-react';
import styles from './services.module.css';

export default function ProviderServicesPage() {

  const { services, loading, error, deleteService } = useProviderServices();
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  const handleDeleteService = async (serviceId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      try {
        setDeletingServiceId(serviceId);
        await deleteService(serviceId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du service');
      } finally {
        setDeletingServiceId(null);
      }
    }
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
        <p>Chargement des services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <p>Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.servicesPage}>
      <HeaderMobile title="Mes services" />

      <main className={styles.main}>
        {/* Page Title */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Mes services</h1>
          <Link
            href="/provider/services/create"
            className={styles.createButton}
          >
            <Plus size={20} />
            Créer un service
          </Link>
        </div>

        {/* Services Grid */}
        {services.length === 0 ? (
          <div className={styles.emptyState}>
            <Briefcase className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>Aucun service créé</h3>
            <p className={styles.emptyText}>
              Commencez par créer votre premier service pour proposer vos prestations
            </p>
            <Link 
              href="/provider/services/create"
              className={styles.createFirstButton}
            >
              <Plus size={20} />
              Créer mon premier service
            </Link>
          </div>
        ) : (
          <div className={styles.servicesGrid}>
            {services.map((service) => (
              <div key={service.id} className={styles.serviceCard}>
                {/* Status Badge */}
                <div className={`${styles.statusBadge} ${service.isActive ? styles.active : styles.inactive}`}>
                  {service.isActive ? (
                    <>
                      <CheckCircle size={12} />
                      Actif
                    </>
                  ) : (
                    <>
                      <XCircle size={12} />
                      Inactif
                    </>
                  )}
                </div>

                {/* Service Header */}
                <div className={styles.serviceHeader}>
                  <h3 className={styles.serviceName}>{service.name}</h3>
                  <div className={styles.servicePrice}>
                    <Euro size={16} />
                    <span>{formatPrice(service.price, service.priceType)}</span>
                  </div>
                </div>

                {/* Service Description */}
                <p className={styles.serviceDescription}>
                  {service.description}
                </p>

                {/* Service Details */}
                <div className={styles.serviceDetails}>
                  {service.duration && (
                    <div className={styles.detailItem}>
                      <Clock size={14} />
                      <span>{formatDuration(service.duration)}</span>
                    </div>
                  )}
                  
                  {service.capacity && (
                    <div className={styles.detailItem}>
                      <Users size={14} />
                      <span>Jusqu'à {service.capacity} personnes</span>
                    </div>
                  )}
                </div>

                {/* Inclusions */}
                {service.inclusions && service.inclusions.length > 0 && (
                  <div className={styles.inclusions}>
                    <h4>Inclus :</h4>
                    <ul>
                      {service.inclusions.slice(0, 3).map((inclusion, index) => (
                        <li key={index}>{inclusion}</li>
                      ))}
                      {service.inclusions.length > 3 && (
                        <li>+{service.inclusions.length - 3} autres éléments</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Photos */}
                {service.photos && service.photos.length > 0 && (
                  <div className={styles.servicePhotos}>
                    <div className={styles.photosGrid}>
                      {service.photos.slice(0, 3).map((photo, index) => (
                        <img key={index} src={photo} alt={`Service ${index + 1}`} />
                      ))}
                      {service.photos.length > 3 && (
                        <div className={styles.morePhotos}>
                          +{service.photos.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className={styles.serviceActions}>
                  <Link
                    href={`/provider/services/${service.id}`}
                    className={`${styles.actionButton} ${styles.viewButton}`}
                  >
                    <Eye size={16} />
                    Voir
                  </Link>
                  
                  <Link 
                    href={`/provider/services/${service.id}/edit`}
                    className={`${styles.actionButton} ${styles.editButton}`}
                  >
                    <Edit size={16} />
                    Modifier
                  </Link>
                  
                  {/* Désactivé : La suppression d'un service supprime aussi les réservations liées */}
                  {/* 
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    disabled={deletingServiceId === service.id}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                  >
                    <Trash2 size={16} />
                    {deletingServiceId === service.id ? 'Suppression...' : 'Supprimer'}
                  </button>
                  */}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
