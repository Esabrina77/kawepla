'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { HeaderMobile } from '@/components/HeaderMobile';
import { useDesigns } from '@/hooks/useDesigns';
import { Design } from '@/types';
import { TemplateEngine, getPreviewDataByType } from '@/lib/templateEngine';
import { Palette, Crown } from 'lucide-react';
import styles from './design-detail.module.css';

export default function DesignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { getDesignById } = useDesigns();
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const designId = params?.id as string;

  // Données d'exemple pour la prévisualisation (adaptées au type d'événement)
  const getPreviewData = (design: Design | null) => {
    return getPreviewDataByType(design?.category || 'event');
  };

  useEffect(() => {
    if (!designId) return;
    
    const fetchDesign = async () => {
      try {
        setLoading(true);
        setError(null);
        const designData = await getDesignById(designId);
        if (!designData) {
          setError('Design non trouvé');
          return;
        }
        setDesign(designData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchDesign();
  }, [designId, getDesignById]);

  const handleSelectDesign = () => {
    // Rediriger vers la page de création d'invitation avec le design sélectionné
    router.push(`/client/invitations?designId=${design?.id}`);
  };

  if (loading) {
    return (
      <div className={styles.designDetailPage}>
        <HeaderMobile title="Détail du design" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingSpinner}></div>
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className={styles.designDetailPage}>
        <HeaderMobile title="Détail du design" />
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <p className={styles.errorMessage}>{error || 'Design non trouvé'}</p>
        <button
              onClick={() => router.push('/client/design')}
          className={styles.backButton}
        >
          Retour aux designs
        </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.designDetailPage}>
      <HeaderMobile title={design.name} />

      <main className={styles.main}>
        {/* Preview Section - Full Page */}
        <div className={styles.previewSection}>
          <div className={styles.previewContainer}>
            <div 
              className={styles.preview}
              dangerouslySetInnerHTML={{
                __html: new TemplateEngine().render(design, getPreviewData(design))
              }}
              key={`preview-${design.id}`}
            />
          </div>
        </div>

        {/* Info Section - Compact */}
        <div className={styles.infoSection}>
          <div className={styles.infoHeader}>
            {design.category && (
              <span className={styles.designType}>
                {design.category}
              </span>
            )}
            {design.isPremium && (
              <div className={styles.premiumBadge}>
                <Crown size={12} />
                Premium
              </div>
            )}
          </div>

          <h2 className={styles.designTitle}>{design.name}</h2>

          {/* Action Button */}
            <button 
              onClick={handleSelectDesign}
              className={styles.selectButton}
            >
            <Palette size={18} />
              Utiliser ce design
            </button>
        </div>
      </main>
    </div>
  );
} 