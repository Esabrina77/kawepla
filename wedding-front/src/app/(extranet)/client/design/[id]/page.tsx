'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDesigns } from '@/hooks/useDesigns';
import { Design } from '@/types';
import { TemplateEngine, getPreviewDataByType } from '@/lib/templateEngine';
import { Palette, ArrowLeft, Crown } from 'lucide-react';
import styles from './design-detail.module.css';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function DesignDetailPage({ params }: Props) {
  const router = useRouter();
  const { getDesignById } = useDesigns();
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [designId, setDesignId] = useState<string | null>(null);
  
  // Resolve params asynchronously
  useEffect(() => {
    params.then(resolvedParams => {
      setDesignId(resolvedParams.id);
    }).catch(err => {
      console.error('Error resolving params:', err);
      setError('Erreur lors du chargement des paramètres');
      setLoading(false);
    });
  }, [params]);

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
    return <div className={styles.loading}>Chargement du design...</div>;
  }

  if (error || !design) {
    return (
      <div className={styles.error}>
        <div className={styles.errorMessage}>{error || 'Design non trouvé'}</div>
        <button
          onClick={() => router.back()}
          className={styles.backButton}
        >
          Retour aux designs
        </button>
      </div>
    );
  }

  return (
    <div className={styles.designDetailPage}>
      <div className={styles.header}>
        <button
          onClick={() => router.back()}
          className={styles.backButton}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Retour aux designs
        </button>
        
        <div className={styles.badge}>
          <Palette style={{ width: '16px', height: '16px' }} />
          {design.name}
        </div>
      </div>

      <div className={styles.content}>
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

        <div className={styles.infoSection}>
          <div className={styles.designInfo}>
            <h2>Détails du design</h2>
            <p>{design.description}</p>
            
            {design.category && (
              <div className={styles.metadata}>
                <span className={styles.label}>Catégorie:</span>
                <span className={styles.category}>{design.category}</span>
              </div>
            )}
            
            {design.tags && design.tags.length > 0 && (
              <div className={styles.metadata}>
                <span className={styles.label}>Tags:</span>
                <div className={styles.tags}>
                  {design.tags.map((tag: string) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
            )}
            
            {design.isPremium && (
              <div className={styles.premium}>
                <Crown style={{ width: '14px', height: '14px' }} />
                <span>Design Premium</span>
              </div>
            )}
          </div>

          <div className={styles.actionSection}>
            <button 
              onClick={handleSelectDesign}
              className={styles.selectButton}
            >
              <Palette style={{ width: '16px', height: '16px' }} />
              Utiliser ce design
            </button>
            
            <div className={styles.description}>
              <p>
                Cliquez sur "Utiliser ce design" pour créer votre invitation personnalisée 
                avec ce template. Vous pourrez ensuite personnaliser tous les textes, 
                dates et informations selon votre événement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 