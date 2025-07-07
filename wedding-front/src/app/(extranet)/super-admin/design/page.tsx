'use client';

import { useState } from 'react';
import { useDesigns } from '@/hooks/useDesigns';
import { Design } from '@/types';
import styles from './design.module.css';
import { TemplateEngine } from '@/lib/templateEngine';
import { getExampleTemplateData } from '@/lib/utils';

export default function SuperAdminDesignPage() {
  const { designs, loading, error, updateDesign, deleteDesign, toggleDesignStatus } = useDesigns();
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [deletingDesignId, setDeletingDesignId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Données d'exemple pour les prévisualisations
  const miniPreviewData = {
    coupleName: "A & B",
    day: "15",
    month: "Juin",
    year: "2024"
  };

  const fullPreviewData = getExampleTemplateData();

  // Filtrer les designs en fonction de la recherche
  const filteredDesigns = designs.filter(design => {
    if (searchTerm === '') return true;
    
    const searchLower = searchTerm.toLowerCase();
    return design.name.toLowerCase().includes(searchLower) ||
           design.description?.toLowerCase().includes(searchLower) ||
           design.category?.toLowerCase().includes(searchLower) ||
           design.tags?.some(tag => tag.toLowerCase().includes(searchLower));
  });

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

  if (loading) return <div className={styles.loading}>Chargement des designs...</div>;
  if (error) return <div className={styles.error}>Erreur: {error}</div>;

  return (
    <div className={styles.designPage}>
      <div className={styles.header}>
        <h1>Gestion des Designs</h1>
        <p>Gérez les designs d'invitations de mariage disponibles dans la base de données</p>
        
        <div className={styles.filters}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Rechercher par nom, description, catégorie ou tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <span className={styles.designCount}>
            {searchTerm ? 
              `${filteredDesigns.length} design${filteredDesigns.length > 1 ? 's' : ''} trouvé${filteredDesigns.length > 1 ? 's' : ''} sur ${designs.length}` :
              `${designs.length} design${designs.length > 1 ? 's' : ''} disponible${designs.length > 1 ? 's' : ''}`
            }
          </span>
        </div>
      </div>

      {filteredDesigns.length === 0 ? (
        <div className={styles.emptyState}>
          {searchTerm ? (
            <>
              <h2>Aucun résultat trouvé</h2>
              <p>Aucun design ne correspond à votre recherche "{searchTerm}". Essayez avec d'autres mots-clés.</p>
            </>
          ) : (
            <>
              <h2>Aucun design disponible</h2>
              <p>Aucun design n'a encore été créé. Rendez-vous dans la section Templates pour créer vos premiers designs.</p>
            </>
          )}
        </div>
      ) : (
        <div className={styles.designsList}>
          <div className={styles.designsGrid}>
            {filteredDesigns.map((design) => (
              <div key={design.id} className={styles.designCard}>
                <div className={styles.designPreview}>
                  {design.template && design.styles && design.variables ? (
                    <div 
                      className={styles.miniPreview}
                      dangerouslySetInnerHTML={{
                        __html: new TemplateEngine().render(design, miniPreviewData)
                      }}
                    />
                  ) : (
                    <div className={styles.placeholderPreview}>
                      <h3>{design.name}</h3>
                      <p>Aperçu non disponible</p>
                    </div>
                  )}
                </div>
                
                <div className={styles.designInfo}>
                  <h3>{design.name}</h3>
                  <p>{design.description}</p>
                  
                  <div className={styles.designMeta}>
                    <div className={styles.statusRow}>
                      <span className={`${styles.status} ${design.isActive ? styles.active : styles.inactive}`}>
                        {design.isActive ? 'Actif' : 'Inactif'}
                      </span>
                      {design.isPremium && <span className={styles.premium}>Premium</span>}
                    </div>
                    
                    {design.category && (
                      <div className={styles.categoryRow}>
                        <span className={styles.category}>{design.category}</span>
                      </div>
                    )}
                    
                    {design.tags && design.tags.length > 0 && (
                      <div className={styles.tagsRow}>
                        {design.tags.map((tag: string) => (
                          <span key={tag} className={styles.tag}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={styles.designActions}>
                  <button 
                    className={styles.previewButton}
                    onClick={() => handlePreviewDesign(design)}
                  >
                    Aperçu
                  </button>
                  
                  <button 
                    className={styles.toggleButton}
                    onClick={() => handleToggleStatus(design.id)}
                  >
                    {design.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                  
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDeleteDesign(design.id)}
                    disabled={deletingDesignId === design.id}
                  >
                    {deletingDesignId === design.id ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
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
              <div className={styles.previewContainer}>
                {selectedDesign.template && selectedDesign.styles && selectedDesign.variables ? (
                  <div 
                    className={styles.fullPreview}
                    dangerouslySetInnerHTML={{
                      __html: new TemplateEngine().render(selectedDesign, {
                        coupleName: "Marie & Pierre",
                        date: "15 Juin 2024",
                        details: "Château de Versailles, 14h00",
                        message: "Nous avons l'honneur de vous inviter à notre mariage",
                        rsvpForm: "RSVP avant le 1er Mai"
                      })
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
