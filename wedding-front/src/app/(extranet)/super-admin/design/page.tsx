'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDesigns } from '@/hooks/useDesigns';
import { HeaderMobile } from '@/components/HeaderMobile';
import { Design } from '@/types';
import DesignPreview from '@/components/DesignPreview';
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
import { deleteFromFirebase } from '@/lib/firebase';
import styles from './design.module.css';

export default function SuperAdminDesignPage() {
  const router = useRouter();
  const { designs, loading, error, updateDesign, deleteDesign, toggleDesignStatus } = useDesigns();
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [deletingDesignId, setDeletingDesignId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'templates' | 'personalized'>('templates');

  // Filtrer les designs en fonction de la recherche et du filtre
  const filteredDesigns = designs.filter(design => {
    // Filtre par recherche
    const searchMatch = searchTerm === '' ||
      design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      design.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      design.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtre par type (View Mode)
    const viewModeMatch = viewMode === 'templates' ? design.isTemplate : !design.isTemplate;

    // Filtre par type
    const filterMatch = selectedFilter === 'all' ||
      (selectedFilter === 'active' && design.isActive) ||
      (selectedFilter === 'inactive' && !design.isActive) ||
      (selectedFilter === 'free' && design.priceType === 'FREE') ||
      (selectedFilter === 'paid' && design.priceType !== 'FREE');

    return searchMatch && filterMatch && viewModeMatch;
  });

  // Obtenir tous les tags uniques pour le filtre
  const allTags = Array.from(new Set(designs.flatMap(d => d.tags || [])));

  // Options pour le filtre
  const filterOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'active', label: 'Actifs' },
    { value: 'inactive', label: 'Inactifs' },
    { value: 'free', label: 'Gratuits' },
    { value: 'paid', label: 'Payants' },
  ];

  const handleDeleteDesign = async (designId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce design ? Cette action est irréversible.')) {
      try {
        setDeletingDesignId(designId);
        const design = designs.find(d => d.id === designId);

        // Supprimer le design de la base de données
        await deleteDesign(designId);

        // Si succès, nettoyer les images de Firebase
        if (design) {
          if (design.thumbnail && design.thumbnail.includes('firebasestorage')) {
            try { await deleteFromFirebase(design.thumbnail); } catch (e) { console.error('Erreur suppression thumbnail:', e); }
          }
          if (design.previewImage && design.previewImage !== design.thumbnail && design.previewImage.includes('firebasestorage')) {
            try { await deleteFromFirebase(design.previewImage); } catch (e) { console.error('Erreur suppression preview:', e); }
          }
        }
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
    router.push(`/super-admin/design/create-canva?id=${designId}`);
  };

  if (loading) {
    return (
      <div className={styles.designPage}>
        <HeaderMobile title="Designs" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement des designs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.designPage}>
        <HeaderMobile title="Designs" />
        <div className={styles.errorContainer}>
          <p>Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.designPage}>
      <HeaderMobile title="Designs" />

      <main className={styles.main}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <button
            onClick={() => router.push('/super-admin/design/create-canva')}
            className={styles.createButton}
          >
            <Plus size={18} />
            Créer un design
          </button>
        </div>

        {/* View Mode Toggles */}
        <div className={styles.viewModeContainer}>
          <button
            className={`${styles.viewModeButton} ${viewMode === 'templates' ? styles.active : ''}`}
            onClick={() => setViewMode('templates')}
          >
            Modèles (Admin)
          </button>
          <button
            className={`${styles.viewModeButton} ${viewMode === 'personalized' ? styles.active : ''}`}
            onClick={() => setViewMode('personalized')}
          >
            Designs Personnalisés (Clients)
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
              {/* Badge Prix */}
              {design.priceType && design.priceType !== 'FREE' && (
                <div className={styles.premiumBadge}>
                  <Crown style={{ width: '12px', height: '12px' }} />
                  {design.priceType === 'ESSENTIAL' ? 'Essentiel' :
                    design.priceType === 'ELEGANT' ? 'Élégant' :
                      design.priceType === 'LUXE' ? 'Luxe' : design.priceType}
                </div>
              )}

              {/* Preview */}
              <div className={styles.previewContainer}>
                <DesignPreview
                  design={design}
                  width={300}
                  height={400}
                  className={styles.previewContent}
                />
              </div>

              {/* Info */}
              <div className={styles.designInfo}>
                <h3 className={styles.designTitle}>
                  {design.name}
                </h3>

                <p className={styles.designDescription}>
                  {design.description}
                </p>

                {design.priceType && design.priceType !== 'FREE' && (
                  <span className={styles.priceBadge}>
                    {design.priceType === 'ESSENTIAL' ? 'Essentiel' :
                      design.priceType === 'ELEGANT' ? 'Élégant' :
                        design.priceType === 'LUXE' ? 'Luxe' : design.priceType}
                  </span>
                )}
                {design.isTemplate ? (
                  <span className={styles.templateBadge}>Modèle</span>
                ) : (
                  <span className={styles.personalizedBadge}>Personnalisé</span>
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
            <Palette size={64} />
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
                  <DesignPreview
                    design={selectedDesign}
                    width={600}
                    height={800}
                    className={styles.fullPreview}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
