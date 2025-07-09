'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useDesigns, Design } from '@/hooks/useDesigns';
import { TemplateEngine } from '@/lib/templateEngine';
import { getExampleTemplateData } from '@/lib/utils';
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
  
  // Unwrap params avec React.use()
  const resolvedParams = use(params);

  // Données d'exemple pour la prévisualisation
  const previewData = getExampleTemplateData();

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        setLoading(true);
        setError(null);
        const designData = await getDesignById(resolvedParams.id);
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
  }, [resolvedParams.id, getDesignById]);

  const handleSelectDesign = () => {
    // TODO: Implémenter la sélection du design
    alert('Fonctionnalité à venir : sélection du design');
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
          ← Retour aux designs
        </button>
        <h1>{design.name}</h1>

      </div>

      <div className={styles.content}>
        <div className={styles.previewSection}>
          <div className={styles.previewContainer}>
            <div 
              className={styles.preview}
              dangerouslySetInnerHTML={{
                __html: new TemplateEngine().render(design, previewData)
              }}
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
                  {design.tags.map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
            )}
            
            {design.isPremium && (
              <div className={styles.premium}>
                <span>✨ Design Premium</span>
              </div>
            )}
          </div>

          <div className={styles.customizationSection}>
            <h2>Personnalisation</h2>
            <p>
              Cette section vous permettra bientôt de personnaliser votre invitation avec vos propres textes, 
              couleurs et styles. Restez à l'écoute !
            </p>
            {/* TODO: Ajouter le formulaire de personnalisation */}
          </div>
        </div>
      </div>
    </div>
  );
} 