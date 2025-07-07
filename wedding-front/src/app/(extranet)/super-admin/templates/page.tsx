'use client';

import { useState } from 'react';
import { useDesigns } from '@/hooks/useDesigns';
import { TemplateEngine } from '@/lib/templateEngine';
import { getExampleTemplateData } from '@/lib/utils';
import styles from './templates.module.css';
import elegantTemplates from '@/data/elegantTemplates.json';

export default function SuperAdminTemplatesPage() {
  const { designs, createDesign } = useDesigns();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isCreating, setIsCreating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filtrer les templates en fonction de la recherche
  const filteredTemplates = Object.entries(elegantTemplates).filter(([key, template]) => {
    if (searchTerm === '') return true;
    
    const searchLower = searchTerm.toLowerCase();
    return template.name.toLowerCase().includes(searchLower) ||
           template.description?.toLowerCase().includes(searchLower) ||
           template.category?.toLowerCase().includes(searchLower) ||
           template.tags?.some(tag => tag.toLowerCase().includes(searchLower));
  });

  const handleCreateDesign = async (templateKey: string) => {
    const template = elegantTemplates[templateKey as keyof typeof elegantTemplates];
    if (!template) return;

    // Vérifier si un design avec ce nom existe déjà
    const existingDesign = designs.find(d => d.name === template.name);
    if (existingDesign) {
      alert('Un design avec ce nom existe déjà. Veuillez choisir un autre template.');
      return;
    }

    try {
      setIsCreating(templateKey);
      await createDesign({
        name: template.name,
        description: template.description,
        template: template.template as any,
        styles: template.styles as any,
        variables: template.variables as any,
        category: template.category || 'autre',
        tags: template.tags || [],
        isActive: true,
        isPremium: false
      });
      alert('Design créé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la création du design:', error);
      alert('Erreur lors de la création du design. Veuillez réessayer.');
    } finally {
      setIsCreating(null);
    }
  };

  const handlePreviewTemplate = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    setShowPreviewModal(true);
  };

  const getTemplatePreview = (templateKey: string) => {
    const template = elegantTemplates[templateKey as keyof typeof elegantTemplates];
    if (!template) return '';

    const mockDesign = {
      id: 'preview',
      name: template.name,
      description: template.description,
      template: template.template,
      styles: template.styles,
      variables: template.variables,
      category: template.category || 'autre',
      tags: template.tags || [],
      isActive: true,
      isPremium: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return new TemplateEngine().render(mockDesign, getExampleTemplateData());
  };

  const isTemplateAlreadyCreated = (templateName: string) => {
    return designs.some(d => d.name === templateName);
  };

  return (
    <div className={styles.templatesPage}>
      <div className={styles.header}>
        <h1>Templates d'Invitations</h1>
        <p>Découvrez et créez des designs à partir de nos templates prédéfinis</p>
        
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
        
        {searchTerm && (
          <div className={styles.searchResults}>
            {filteredTemplates.length} template{filteredTemplates.length > 1 ? 's' : ''} trouvé{filteredTemplates.length > 1 ? 's' : ''} sur {Object.keys(elegantTemplates).length}
          </div>
        )}
      </div>

      <div className={styles.templatesGrid}>
        {filteredTemplates.map(([key, template]) => {
          const isAlreadyCreated = isTemplateAlreadyCreated(template.name);
          const isCurrentlyCreating = isCreating === key;
          
          return (
            <div key={key} className={styles.templateCard}>
              <div className={styles.templatePreview}>
                <div 
                  className={styles.miniPreview}
                  dangerouslySetInnerHTML={{
                    __html: getTemplatePreview(key)
                  }}
                />
              </div>
              
              <div className={styles.templateInfo}>
                <h3>{template.name}</h3>
                <p>{template.description}</p>
                
                <div className={styles.templateMeta}>
                  <span className={styles.category}>{template.category}</span>
                  <div className={styles.tags}>
                    {template.tags.map((tag: string) => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className={styles.templateActions}>
                <button 
                  className={styles.previewButton}
                  onClick={() => handlePreviewTemplate(key)}
                >
                  Aperçu complet
                </button>
                
                <button 
                  className={`${styles.createButton} ${isAlreadyCreated ? styles.disabled : ''}`}
                  onClick={() => !isAlreadyCreated && !isCurrentlyCreating && handleCreateDesign(key)}
                  disabled={isAlreadyCreated || isCurrentlyCreating}
                >
                  {isCurrentlyCreating ? 'Création...' : 
                   isAlreadyCreated ? 'Déjà créé' : 'Créer ce design'}
                </button>
              </div>
              
              {isAlreadyCreated && (
                <div className={styles.alreadyCreatedBadge}>
                  ✓ Disponible
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de prévisualisation */}
      {showPreviewModal && selectedTemplate && (
        <div className={styles.modal} onClick={() => setShowPreviewModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Aperçu - {elegantTemplates[selectedTemplate as keyof typeof elegantTemplates]?.name}</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowPreviewModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.previewContainer}>
                <div 
                  className={styles.fullPreview}
                  dangerouslySetInnerHTML={{
                    __html: getTemplatePreview(selectedTemplate)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 