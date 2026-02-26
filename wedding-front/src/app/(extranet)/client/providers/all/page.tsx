'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProviderSearch } from '@/hooks/useProviders';
import { 
  Search, 
  Star, 
  UtensilsCrossed, 
  Camera, 
  Music, 
  Flower2, 
  Calendar, 
  Palette, 
  Building2, 
  MapPin, 
  Heart,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import styles from './providers.module.css';

export default function ProvidersPage() {
  const router = useRouter();
  const { providers, loading, error, searchProviders } = useProviderSearch();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  const categoriesList = [
    { name: 'Tous', id: null },
    { name: 'Salle', id: 'Salle' },
    { name: 'Traiteur', id: 'Traiteur' },
    { name: 'Photographe', id: 'Photographe' },
    { name: 'DJ', id: 'DJ' },
    { name: 'Fleuriste', id: 'Fleuriste' },
    { name: 'Décoration', id: 'Décoration' },
  ];

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = !searchTerm.trim() || (
      provider.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.displayCity.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesCategory = !selectedCategory || provider.category?.name === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className={styles.providersPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.providersPage}>
      {/* Premium Hero Section */}
      <div className={styles.pageHeaderSection}>
        <div className={styles.headerContent}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.4rem 1rem', borderRadius: '100px', marginBottom: '1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <Sparkles size={14} style={{ color: '#' }} />
            Le carnet d'adresses d'exception
          </div>
          <h1 className={styles.headerTitle}>Trouvez vos prestataires de rêve</h1>
          <p className={styles.headerSubtitle}>Explorez notre sélection rigoureuse pour un évènement inoubliable</p>
        </div>
      </div>

      <div className={styles.pageContent}>
        {/* Unified Search & Category Filters */}
        <div className={styles.searchSection}>
          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              <div className={styles.searchIconWrapper}>
                <Search size={20} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Ville, nom, catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
            </div>
            {searchTerm.trim() && (
              <p className={styles.resultsCount}>
                {filteredProviders.length} résultat{filteredProviders.length > 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className={styles.categoryFilters}>
            {categoriesList.map((cat) => (
              <button
                key={cat.name}
                className={`${styles.filterTag} ${selectedCategory === cat.id ? styles.active : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Results Grid */}
        {error && (
          <div className={styles.errorContainer}>
            <p>Une erreur est survenue lors du chargement.</p>
            <button onClick={loadDefaultProviders}>Réessayer</button>
          </div>
        )}

        {filteredProviders.length === 0 && !loading && !error && (
          <div className={styles.emptyState}>
            <h3>Aucun résultat</h3>
            <p>Nous n'avons pas trouvé de prestataire correspondant à vos critères.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory(null); }}
              style={{ marginTop: '1.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

        <div className={styles.providersList}>
          {filteredProviders.map((provider) => {
            const services = provider.services || [];
            const minPrice = services.length > 0 
              ? Math.min(...services.map(s => s.price).filter(p => p > 0)) 
              : 0;
            const categoryName = provider.category?.name || 'Prestataire';

            return (
              <div key={provider.id} className={styles.providerCard}>
                {/* Visual Identity */}
                <div className={styles.providerImageContainer}>
                  <img 
                    src={provider.profilePhoto || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop'} 
                    alt={provider.businessName}
                    className={styles.providerImage}
                  />
                  <button className={styles.favoriteButton}>
                    <Heart size={20} />
                  </button>
                  <div className={styles.imageOverlay}>
                    <div className={styles.locationTag}>
                      <MapPin size={14} />
                      {provider.displayCity}
                    </div>
                  </div>
                </div>

                {/* Information Content */}
                <div className={styles.providerContent}>
                  <div className={styles.providerHeader}>
                    <div className={styles.categoryBadge}>
                      {getCategoryIcon(categoryName)}
                      {categoryName}
                    </div>
                    <h3 className={styles.providerName}>{provider.businessName}</h3>
                    <div className={styles.ratingRow}>
                      <div className={styles.ratingStars}>
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i < Math.floor(provider.rating) ? "currentColor" : "none"} 
                            stroke="currentColor" 
                          />
                        ))}
                      </div>
                      <span className={styles.ratingValue}>{provider.rating.toFixed(1)}</span>
                      <span className={styles.reviewCount}>({provider.reviewCount} avis)</span>
                    </div>
                  </div>

                  <p className={styles.description}>
                    {provider.description || 'Découvrez nos services d\'exception pour sublimer votre plus beau jour.'}
                  </p>

                  <hr className={styles.divider} />

                  {minPrice > 0 ? (
                    <div className={styles.pricing}>
                      <span className={styles.priceLabel}>À partir de</span>
                      <span className={styles.priceValue}>{minPrice}€</span>
                    </div>
                  ) : (
                    <div className={styles.pricing} style={{ height: '24px' }} />
                  )}

                  <button
                    className={styles.viewButton}
                    onClick={() => router.push(`/client/providers/${provider.id}`)}
                  >
                    Découvrir l'univers
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
