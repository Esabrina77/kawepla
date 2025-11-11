'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProviderSearch } from '@/hooks/useProviders';
import { HeaderMobile } from '@/components/HeaderMobile';
import { Search, Star, UtensilsCrossed, Camera, Music, Flower2, Calendar, Palette, Building2 } from 'lucide-react';
import styles from './providers.module.css';

export default function ProvidersPage() {
  const router = useRouter();
  const { providers, loading, error, searchProviders } = useProviderSearch();
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDefaultProviders();
  }, []);

  const loadDefaultProviders = async () => {
    try {
      await searchProviders({
        limit: 50
      });
    } catch (error) {
      console.error('Erreur lors du chargement des prestataires:', error);
    }
  };

  const handleSearch = async () => {
    try {
      await searchProviders({
        limit: 100
      });
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    }
  };

  const getCategoryIcon = (categoryName?: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Traiteur': <UtensilsCrossed size={14} />,
      'Photographe': <Camera size={14} />,
      'DJ': <Music size={14} />,
      'Fleuriste': <Flower2 size={14} />,
      'Salle': <Calendar size={14} />,
      'Décoration': <Palette size={14} />,
    };
    return icons[categoryName || ''] || <Building2 size={14} />;
  };

  const filteredProviders = providers.filter(provider => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      provider.businessName.toLowerCase().includes(term) ||
      provider.category?.name.toLowerCase().includes(term) ||
      provider.displayCity.toLowerCase().includes(term) ||
      provider.description?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className={styles.providersPage}>
        <HeaderMobile title="Prestataires" />
      <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p>Recherche de prestataires...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.providersPage}>
      <HeaderMobile title="Prestataires" />
      
      <main className={styles.main}>
        {/* Search Section - Sticky */}
        <div className={styles.searchSection}>
          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              <div className={styles.searchIconWrapper}>
                <Search size={20} />
      </div>
          <input
            type="text"
                className={styles.searchInput}
            placeholder="Rechercher par ville ou prestataire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
          </div>
          {searchTerm.trim() && filteredProviders.length > 0 && (
            <p className={styles.resultsCount}>
              {filteredProviders.length} prestataire{filteredProviders.length > 1 ? 's' : ''} trouvé{filteredProviders.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        {/* Results */}
        {error && (
          <div className={styles.errorContainer}>
            <div className={styles.errorContent}>
            <p>❌ {error}</p>
            <button onClick={loadDefaultProviders}>Réessayer</button>
            </div>
          </div>
        )}

        {filteredProviders.length === 0 && !loading && !error && (
          <div className={styles.emptyState}>
            <h3>Aucun prestataire trouvé</h3>
            <p>Essayez de modifier vos critères de recherche</p>
          </div>
        )}

        {filteredProviders.length > 0 && (
          <div className={styles.providersList}>
            {filteredProviders.map((provider) => {
              const services = (provider as any).services || [];
              const categoryName = provider.category?.name || '';
              
              return (
            <div key={provider.id} className={styles.providerCard}>
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

                  {/* Provider Content */}
                  <div className={styles.providerContent}>
                    {/* Header */}
              <div className={styles.providerHeader}>
                      <div className={styles.providerTitleRow}>
                        <h3 className={styles.providerName}>{provider.businessName}</h3>
                        {categoryName && (
                          <div className={styles.categoryBadge}>
                            {getCategoryIcon(categoryName)}
                            <span>{categoryName}</span>
                    </div>
                  )}
                </div>
                      <p className={styles.providerDescription}>
                        {provider.displayCity} - {provider.description || 'Prestataire professionnel pour vos événements.'}
                      </p>
                      <div className={styles.ratingRow}>
                        <Star className={styles.starIcon} size={16} fill="currentColor" />
                        <span className={styles.ratingValue}>
                          {provider.rating.toFixed(1)}
                        </span>
                        <span>({provider.reviewCount} avis)</span>
                </div>
              </div>

                    {/* Divider */}
                    <hr className={styles.divider} />

                    {/* Services */}
                    {services.length > 0 && (
                      <div className={styles.servicesList}>
                        {services.slice(0, 2).map((service: any, index: number) => (
                          <div key={service.id || index} className={styles.serviceItem}>
                          <span className={styles.serviceName}>{service.name}</span>
                          <span className={styles.servicePrice}>
                              {service.price}€
                          </span>
                        </div>
                      ))}
                        {services.length > 2 && (
                        <div className={styles.moreServices}>
                            +{services.length - 2} autres services
                        </div>
                      )}
                  </div>
                )}
               
                    {/* View Button */}
                <button 
                  className={styles.viewButton}
                  onClick={() => router.push(`/client/providers/${provider.id}`)}
                >
                  Voir le profil
                </button>
              </div>
            </div>
              );
            })}
        </div>
        )}
      </main>
    </div>
  );
}
