'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDesigns } from '@/hooks/useDesigns';
import { Design } from '@/types';
import styles from './design.module.css';
import { TemplateEngine } from '@/lib/templateEngine';

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
    coupleName: "A & B",
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

  if (loading) return <div className={styles.loading}>Chargement des designs...</div>;
  if (error) return <div className={styles.error}>Erreur: {error}</div>;

  return (
    <div className={styles.designPage}>
      <div className={styles.header}>
        <h1>Choisir un Design</h1>
        <p>
          {returnTo === 'invitations' 
            ? 'Sélectionnez le design pour votre invitation de mariage' 
            : 'Sélectionnez le design parfait pour votre invitation de mariage'
          }
        </p>
        {returnTo === 'invitations' && (
          <div className={styles.returnInfo}>
            <p>👈 Vous serez redirigé vers la création d'invitation après avoir choisi un design</p>
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterSelect}>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
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
      <div className={styles.designGrid}>
        {filteredDesigns.map((design) => (
          <div key={design.id} className={styles.designCard}>
            <div className={styles.designPreview}>
              <div className={styles.mockupContainer}>
                <div className={styles.mockup}>
                  {design.template && design.styles && design.variables ? (
                    <div 
                      dangerouslySetInnerHTML={{
                        __html: new TemplateEngine().render(design, {
                          coupleName: "A & B",
                          date: "2024",
                          details: "Lieu",
                          message: "Invitation",
                          rsvpForm: "RSVP"
                        })
                      }}
                    />
                  ) : (
                    <div className={styles.placeholderPreview}>
                      <h3>{design.name}</h3>
                      <p>Aperçu non disponible</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className={styles.designInfo}>
              <h3>{design.name}</h3>
              <p>{design.description}</p>
              
              {design.category && (
                <span className={styles.category}>{design.category}</span>
              )}
              
              {design.tags && design.tags.length > 0 && (
                <div className={styles.tags}>
                  {design.tags.map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}
              
              {design.isPremium && (
                <span className={styles.premium}>Premium</span>
              )}
              
              <div className={styles.actions}>
                <button
                  className={styles.previewButton}
                  onClick={() => handlePreviewClick(design.id)}
                >
                  Aperçu
                </button>
                {returnTo === 'invitations' && (
                  <button
                    className={styles.chooseButton}
                    onClick={() => handleChooseDesign(design.id)}
                  >
                    Choisir ce design
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 