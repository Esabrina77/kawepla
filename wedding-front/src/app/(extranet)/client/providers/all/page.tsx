'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProviderSearch, useServiceCategories } from '@/hooks/useProviders';
import { 
  Search, 
  MapPin, 
  Star, 
  Users, 
  Camera
} from 'lucide-react';
import styles from './providers.module.css';

export default function ProvidersPage() {
  const router = useRouter();
  const { providers, loading, error, searchProviders, searchByLocation, getCurrentLocationAndSearch } = useProviderSearch();
  const { categories } = useServiceCategories();
  
  const [searchParams, setSearchParams] = useState({
    categoryId: '',
    eventType: '',
    minRating: 0,
    maxPrice: '',
    radius: 25,
    searchTerm: ''
  });
  
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending');

  useEffect(() => {
    // Essayer de charger les providers par défaut
    loadDefaultProviders();
  }, []);


  const loadDefaultProviders = async () => {
    try {
      // Charger tous les prestataires par défaut (sans géolocalisation)
      await searchProviders({
        categoryId: searchParams.categoryId || undefined,
        minRating: searchParams.minRating || undefined,
        limit: 50 // Limite élevée pour récupérer tous les prestataires
      });
      
      setLocationPermission('denied'); // Pas de géolocalisation par défaut
    } catch (error) {
      console.error('Erreur lors du chargement des prestataires:', error);
      setLocationPermission('denied');
    }
  };

  const handleSearch = async () => {
    try {
      // Charger tous les prestataires puis filtrer côté client
      await searchProviders({
        categoryId: searchParams.categoryId || undefined,
        minRating: searchParams.minRating || undefined,
        limit: 100 // Augmenter la limite pour avoir plus de résultats à filtrer
      });
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    }
  };

  const formatPrice = (price: number, priceType: string) => {
    switch (priceType) {
      case 'hourly':
        return `${price}€/h`;
      case 'daily':
        return `${price}€/jour`;
      case 'package':
        return `À partir de ${price}€`;
      default:
        return `${price}€`;
    }
  };

  const getDistanceText = (distance?: number) => {
    if (!distance) return '';
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance}km`;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div style={{ textAlign: 'center' }}>
          <div className={styles.loadingSpinner}></div>
          <p>Recherche de prestataires...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.providersContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.badge}>
          <Users style={{ width: '16px', height: '16px' }} />
          Prestataires professionnels
        </div>
        
        <h1 className={styles.title}>
          Trouvez votre <span className={styles.titleAccent}>prestataire idéal</span>
        </h1>
        
        <p className={styles.subtitle}>
          Découvrez les meilleurs professionnels pour votre événement
        </p>
      </div>

      {/* Filtres */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher par ville ou prestataire..."
            value={searchParams.searchTerm}
            onChange={(e) => setSearchParams(prev => ({ ...prev, searchTerm: e.target.value }))}
            className={styles.searchInput}
          />
 
        </div>
        
        <button onClick={handleSearch} className={styles.searchButton}>
          <Search size={16} />
          Rechercher
        </button>
      </div>


      {/* Résultats */}
      <div className={styles.resultsSection}>
        {error && (
          <div className={styles.errorMessage}>
            <p>❌ {error}</p>
            <button onClick={loadDefaultProviders}>Réessayer</button>
          </div>
        )}

        {providers.length === 0 && !loading && !error && (
          <div className={styles.emptyState}>
            <h3>Aucun prestataire trouvé</h3>
            <p>Essayez de modifier vos critères de recherche</p>
          </div>
        )}

        {providers.length > 0 && searchParams.searchTerm.trim() && (
          <div className={styles.resultsCount}>
            {(() => {
              const filteredProviders = providers.filter(provider => {
                const searchTerm = searchParams.searchTerm.toLowerCase();
                return (
                  provider.businessName.toLowerCase().includes(searchTerm) ||
                  provider.category?.name.toLowerCase().includes(searchTerm) ||
                  provider.displayCity.toLowerCase().includes(searchTerm) ||
                  provider.description?.toLowerCase().includes(searchTerm)
                );
              });
              return `${filteredProviders.length} prestataire${filteredProviders.length > 1 ? 's' : ''} trouvé${filteredProviders.length > 1 ? 's' : ''}`;
            })()}
          </div>
        )}

        <div className={styles.providersGrid}>
          {providers
            .filter(provider => {
              if (!searchParams.searchTerm.trim()) return true;
              const searchTerm = searchParams.searchTerm.toLowerCase();
              return (
                provider.businessName.toLowerCase().includes(searchTerm) ||
                provider.category?.name.toLowerCase().includes(searchTerm) ||
                provider.displayCity.toLowerCase().includes(searchTerm) ||
                provider.description?.toLowerCase().includes(searchTerm)
              );
            })
            .map((provider) => (
            <div key={provider.id} className={styles.providerCard}>
              <div className={styles.providerHeader}>
                <div className={styles.providerPhoto}>
                  {provider.profilePhoto ? (
                    <img src={provider.profilePhoto} alt={provider.businessName} />
                  ) : (
                    <div className={styles.photoPlaceholder}>
                      <Camera size={24} />
                    </div>
                  )}
                </div>
                
                <div className={styles.providerInfo}>
                  <h3>{provider.businessName}</h3>
                  <div className={styles.category}>
                    {provider.category?.icon} {provider.category?.name}
                  </div>
                  <div className={styles.location}>
                    <MapPin size={14} />
                    {provider.displayCity}
                  </div>
                </div>
              </div>

              <div className={styles.providerContent}>
                <p className={styles.description}>
                  {provider.description?.substring(0, 120)}
                  {provider.description && provider.description.length > 120 && '...'}
                </p>

                <div className={styles.rating}>
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.floor(provider.rating) ? styles.filled : styles.empty}
                      />
                    ))}
                  </div>
                  <span className={styles.ratingText}>
                    {provider.rating.toFixed(1)} ({provider.reviewCount} avis)
                  </span>
                </div>

                {(provider as any).services && (provider as any).services.length > 0 && (
                  <div className={styles.services}>
                    <h4>Services disponibles :</h4>
                    <div className={styles.serviceList}>
                      {(provider as any).services.slice(0, 2).map((service: any) => (
                        <div key={service.id} className={styles.serviceItem}>
                          <span className={styles.serviceName}>{service.name}</span>
                          <span className={styles.servicePrice}>
                            {formatPrice(service.price, service.priceType)}
                          </span>
                        </div>
                      ))}
                      {(provider as any).services.length > 2 && (
                        <div className={styles.moreServices}>
                          +{(provider as any).services.length - 2} autres services
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.providerActions}>
               
                <button 
                  className={styles.viewButton}
                  onClick={() => router.push(`/client/providers/${provider.id}`)}
                >
                  Voir le profil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
