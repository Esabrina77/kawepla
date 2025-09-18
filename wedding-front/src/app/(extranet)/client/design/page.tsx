'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDesigns } from '@/hooks/useDesigns';
import { Design } from '@/types';
import { TemplateEngine } from '@/lib/templateEngine';
import { 
  Palette, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  Sparkles,
  Crown,
  Star
} from 'lucide-react';
import styles from './design.module.css';

export default function ClientDesignPage() {
  const router = useRouter();
  const { designs, loading, error } = useDesigns();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [returnTo, setReturnTo] = useState<string | null>(null);

  // Vérifier si on vient de la page invitations
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const returnToParam = urlParams.get('returnTo');
    if (returnToParam) {
      setReturnTo(returnToParam);
    }
  }, []);

  // Données d'exemple pour les prévisualisations
  const miniPreviewData = {
    organisateurName: "A & B",
    day: "15",
    month: "Juin",
    year: "2024"
  };

  // Filtrer les designs
  const filteredDesigns = designs.filter(design => {
    // Filtre par recherche (nom, description, tags)
    const searchMatch = searchTerm === '' || 
      design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      design.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      design.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtre par catégorie/type
    const filterMatch = selectedFilter === 'all' || 
      design.category === selectedFilter ||
      (selectedFilter === 'premium' && design.isPremium) ||
      (selectedFilter === 'free' && !design.isPremium);
    
    return searchMatch && filterMatch;
  });

  // Obtenir toutes les catégories uniques pour le select
  const categories = ['all', ...new Set(designs.map(d => d.category).filter(Boolean) as string[])];
  
  // Options pour le filtre
  const filterOptions = [
    { value: 'all', label: 'Tous les designs' },
    { value: 'premium', label: 'Designs Premium' },
    { value: 'free', label: 'Designs Gratuits' },
    ...categories.filter(cat => cat !== 'all').map(cat => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1)
    }))
  ];

  const handlePreviewClick = (designId: string) => {
    router.push(`/client/design/${designId}`);
  };

  const handleChooseDesign = (designId: string) => {
    if (returnTo === 'invitations') {
      // Rediriger vers la page d'invitations avec l'ID du design
      router.push(`/client/invitations?designId=${designId}`);
    } else {
      // Comportement par défaut - aller à la page de détail
      router.push(`/client/design/${designId}`);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div style={{ textAlign: 'center' }}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement des designs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div style={{ textAlign: 'center' }}>
          <p>Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.designPage}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.badge}>
          <Palette style={{ width: '16px', height: '16px' }} />
          {returnTo === 'invitations' ? 'Sélection de design' : 'Galerie de designs'}
        </div>
        
        <h1 className={styles.title}>
          Nos <span className={styles.titleAccent}>design</span>
        </h1>
        
        <p className={styles.subtitle}>
          {returnTo === 'invitations' 
            ? 'Sélectionnez le design parfait pour votre invitation d\'événement' 
            : 'Découvrez notre collection de designs élégants et personnalisables'
          }
        </p>

        {returnTo === 'invitations' && (
          <div className={styles.returnInfo}>
            <p>
              👈 Vous serez redirigé vers la création d'invitation après avoir choisi un design
            </p>
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher un design..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterContainer}>
          <Filter className={styles.filterIcon} />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className={styles.filterSelect}
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grille des designs */}
      <div className={styles.designsGrid}>
        {filteredDesigns.map((design) => (
          <div key={design.id} className={styles.designCard}>
            {/* Badge Premium */}
            {design.isPremium && (
              <div className={styles.premiumBadge}>
                <Crown style={{ width: '12px', height: '12px' }} />
                Premium
              </div>
            )}

            {/* Preview */}
            <div className={styles.previewContainer}>
              {design.template && design.styles && design.variables ? (
                <div 
                  className={styles.previewContent}
                  dangerouslySetInnerHTML={{
                    __html: new TemplateEngine().render(design, {
                      eventTitle: "Emma & Lucas",
                      eventDate: new Date('2025-06-14T15:00:00'),
                      eventTime: "15h00",
                      location: "Château de la Roseraie, Paris",
                      eventType: "event",
                      customText: "Ont le plaisir de vous inviter à célébrer leur événement.",
                      moreInfo: "cérémonie suivie d'un cocktail et dîner."
                    })
                  }}
                />
              ) : (
                <div className={styles.previewPlaceholder}>
                  <Palette style={{ width: '48px', height: '48px', marginBottom: 'var(--space-sm)' }} />
                  <h3>{design.name}</h3>
                  <p>Aperçu non disponible</p>
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className={styles.designInfo}>
              <h3 className={styles.designTitle}>
                {design.name}
              </h3>
              
              <p className={styles.designDescription}>
                {design.description}
              </p>
              
              {design.category && (
                <span className={styles.categoryBadge}>
                  {design.category}
                </span>
              )}
              
              {design.tags && design.tags.length > 0 && (
                <div className={styles.tagsContainer}>
                  {design.tags.map(tag => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Actions */}
              <div className={styles.actionsContainer}>
                <button
                  onClick={() => handlePreviewClick(design.id)}
                  className={styles.previewButton}
                >
                  <Eye style={{ width: '14px', height: '14px' }} />
                  Aperçu
                </button>
                
                {returnTo === 'invitations' && (
                  <button
                    onClick={() => handleChooseDesign(design.id)}
                    className={styles.chooseButton}
                  >
                    <CheckCircle style={{ width: '14px', height: '14px' }} />
                    Choisir ce design
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDesigns.length === 0 && (
        <div className={styles.emptyState}>
          <Palette style={{ width: '64px', height: '64px', marginBottom: 'var(--space-md)' }} />
          <h3>Aucun design trouvé</h3>
          <p>Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </div>
  );
} 