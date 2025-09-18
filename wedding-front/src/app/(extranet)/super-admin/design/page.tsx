'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDesigns } from '@/hooks/useDesigns';
import { Design } from '@/types';
import { TemplateEngine } from '@/lib/templateEngine';
import { getDefaultInvitationData } from '@/lib/templateEngine';
import { 
  Palette, 
  Search, 
  Filter, 
  Eye, 
  Edit,
  Trash2,
  Plus,
  Crown,
  Star,
  Power,
  PowerOff
} from 'lucide-react';
import styles from './design.module.css';

export default function SuperAdminDesignPage() {
  const router = useRouter();
  const { designs, loading, error, updateDesign, deleteDesign, toggleDesignStatus } = useDesigns();
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [deletingDesignId, setDeletingDesignId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Données d'exemple pour les prévisualisations (NOUVELLE architecture)
  const miniPreviewData = {
    eventTitle: "Antoine & Marie",
    eventDate: new Date('2024-06-15T15:00:00'),
    eventTime: "15h00",
    location: "Château de Versailles, Paris",
    eventType: "event",
    customText: "Ont le plaisir de vous inviter à célébrer leur événement",
    moreInfo: "cérémonie suivie d'un cocktail et dîner"
  };

  const fullPreviewData = getDefaultInvitationData();

  // Filtrer les designs en fonction de la recherche et du filtre
  const filteredDesigns = designs.filter(design => {
    // Filtre par recherche
    const searchMatch = searchTerm === '' || 
      design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      design.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      design.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      design.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtre par catégorie/type
    const filterMatch = selectedFilter === 'all' || 
      design.category === selectedFilter ||
      (selectedFilter === 'premium' && design.isPremium) ||
      (selectedFilter === 'active' && design.isActive) ||
      (selectedFilter === 'inactive' && !design.isActive);
    
    return searchMatch && filterMatch;
  });

  // Obtenir toutes les catégories uniques pour le select
  const categories = ['all', ...new Set(designs.map(d => d.category).filter(Boolean) as string[])];
  
  // Options pour le filtre
  const filterOptions = [
    { value: 'all', label: 'Tous les designs' },
    { value: 'premium', label: 'Designs Premium' },
    { value: 'active', label: 'Designs Actifs' },
    { value: 'inactive', label: 'Designs Inactifs' },
    ...categories.filter(cat => cat !== 'all').map(cat => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1)
    }))
  ];

  const handleDeleteDesign = async (designId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce design ?')) {
      try {
        setDeletingDesignId(designId);
        await deleteDesign(designId);
      } catch (error) {
        console.error('Erreur lors de la suppression du design:', error);
        alert('Erreur lors de la suppression du design. Veuillez réessayer.');
      } finally {
        setDeletingDesignId(null);
      }
    }
  };

  const handleToggleStatus = async (designId: string) => {
    try {
      const design = designs.find(d => d.id === designId);
      if (design) {
        await toggleDesignStatus(designId, !design.isActive);
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const handlePreviewDesign = (design: Design) => {
    setSelectedDesign(design);
    setShowPreviewModal(true);
  };


  const handleEditDesign = (designId: string) => {
    router.push(`/super-admin/design/create?id=${designId}`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement des designs...</p>
        </div>
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
    <div className={styles.designPage}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.badge}>
          <Palette style={{ width: '16px', height: '16px' }} />
          Gestion des designs
        </div>
        
        <h1 className={styles.title}>
          Vos <span className={styles.titleAccent}>designs</span>
        </h1>
        
        <p className={styles.subtitle}>
          Gérez les designs d'invitations d'événements disponibles dans votre collection
        </p>

        <button
          onClick={() => router.push('/super-admin/design/create')}
          className={styles.createButton}
        >
          <Plus style={{ width: '16px', height: '16px' }} />
          Créer un design
        </button>
      </div>



      {/* Filters */}
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

      {/* Designs Grid */}
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
                    __html: new TemplateEngine().render(design, miniPreviewData)
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
                  onClick={() => handlePreviewDesign(design)}
                  className={styles.previewButton}
                >
                  <Eye style={{ width: '14px', height: '14px' }} />
                  Voir
                </button>
                
                <button
                  onClick={() => handleEditDesign(design.id)}
                  className={styles.editButton}
                >
                  <Edit style={{ width: '14px', height: '14px' }} />
                  Modif
                </button>
                
                <button
                  onClick={() => handleToggleStatus(design.id)}
                  className={styles.toggleButton}
                >
                  {design.isActive ? (
                    <>
                      <PowerOff style={{ width: '14px', height: '14px' }} />
                      OFF
                    </>
                  ) : (
                    <>
                      <Power style={{ width: '14px', height: '14px' }} />
                      ON
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleDeleteDesign(design.id)}
                  disabled={deletingDesignId === design.id}
                  className={styles.deleteButton}
                >
                  <Trash2 style={{ width: '14px', height: '14px' }} />
                  {deletingDesignId === design.id ? 'Suppression...' : 'Supprimer'}
                </button>
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
          <p>
            {searchTerm || selectedFilter !== 'all' 
              ? 'Aucun design ne correspond à vos critères de recherche' 
              : 'Commencez par créer votre premier design'
            }
          </p>
        </div>
      )}

      {/* Modal de prévisualisation */}
      {showPreviewModal && selectedDesign && (
        <div className={styles.modal} onClick={() => setShowPreviewModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Aperçu - {selectedDesign.name}</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowPreviewModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalPreviewContainer}>
                {selectedDesign.template && selectedDesign.styles && selectedDesign.variables ? (
                  <div 
                    className={styles.fullPreview}
                    dangerouslySetInnerHTML={{
                      __html: new TemplateEngine().render(selectedDesign, fullPreviewData)
                    }}
                  />
                ) : (
                  <div className={styles.noPreview}>
                    <h3>Aperçu non disponible</h3>
                    <p>Les données du template ne sont pas complètes pour ce design.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
