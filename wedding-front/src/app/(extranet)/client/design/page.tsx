'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HeaderMobile } from '@/components/HeaderMobile';
import { useDesigns } from '@/hooks/useDesigns';
import { Design } from '@/types';
import { TemplateEngine, getPreviewDataByType } from '@/lib/templateEngine';
import { 
  Palette, 
  Crown
} from 'lucide-react';
import styles from './design.module.css';

export default function ClientDesignPage() {
  const router = useRouter();
  const { designs, loading, error } = useDesigns();
  const [returnTo, setReturnTo] = useState<string | null>(null);

  // Vérifier si on vient de la page invitations
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const returnToParam = urlParams.get('returnTo');
    if (returnToParam) {
      setReturnTo(returnToParam);
    }
  }, []);

  // Données d'exemple pour les prévisualisations (adaptées au type d'événement)
  const getPreviewData = (design: Design) => {
    return getPreviewDataByType(design.category || 'event');
  };

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
      <div className={styles.designPage}>
        <HeaderMobile title="Designs" />
      <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.designPage}>
        <HeaderMobile title="Designs" />
      <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
          <p>Erreur: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.designPage}>
      <HeaderMobile title="Designs" />
      
      <main className={styles.main}>
      {/* Grille des designs */}
        {designs.length > 0 ? (
      <div className={styles.designsGrid}>
            {designs.map((design) => (
          <div key={design.id} className={styles.designCard}>
            {/* Badge Premium */}
            {design.isPremium && (
              <div className={styles.premiumBadge}>
                    <Crown size={12} />
                Premium
              </div>
            )}

            {/* Preview */}
                <div className={styles.designImageWrapper}>
              {design.template && design.styles && design.variables ? (
                <div 
                      className={styles.designPreview}
                  dangerouslySetInnerHTML={{
                    __html: new TemplateEngine().render(design, getPreviewData(design))
                  }}
                />
              ) : (
                    <div className={styles.designPlaceholder}>
                      <Palette size={48} />
                  <h3>{design.name}</h3>
                </div>
              )}
            </div>
            
            {/* Info */}
                <div className={styles.designContent}>
              {design.category && (
                    <span className={styles.designType}>
                  {design.category}
                </span>
              )}
              
                  <p className={styles.designTitle}>
                    {design.name}
                  </p>
                  
                  {design.description && (
                    <p className={styles.designDetail}>
                      {design.description}
                    </p>
              )}
              
              {/* Actions */}
                  <div className={styles.designActions}>
                <button
                  onClick={() => handlePreviewClick(design.id)}
                      className={styles.designActionButton}
                >
                      Voir
                </button>
                
                {returnTo === 'invitations' && (
                  <button
                    onClick={() => handleChooseDesign(design.id)}
                        className={`${styles.designActionButton} ${styles.chooseButton}`}
                  >
                        Choisir
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
        ) : (
        <div className={styles.emptyState}>
            <Palette size={64} />
            <h3>Aucun design disponible</h3>
            <p>Les designs seront bientôt disponibles</p>
        </div>
      )}
      </main>
    </div>
  );
} 