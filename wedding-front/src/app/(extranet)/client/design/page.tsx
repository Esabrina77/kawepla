'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDesigns } from '@/hooks/useDesigns';
import { useInvitations } from '@/hooks/useInvitations';
import { Design } from '@/types';
import DesignPreview from '@/components/DesignPreview';
import { HeaderMobile } from '@/components/HeaderMobile';
import { Search, Filter, Grid, List, Sparkles, Heart, Palette, LayoutTemplate, Trash2 } from 'lucide-react';
import { deleteFromFirebase } from '@/lib/firebase';
import styles from './page.module.css';

type Tab = 'templates' | 'favorites' | 'personal';

export default function DesignsGalleryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchTemplates, fetchUserDesigns, loading, deleteDesign } = useDesigns();
  const { invitations, fetchInvitations } = useInvitations();
  const [activeTab, setActiveTab] = useState<Tab>('templates');

  const [templates, setTemplates] = useState<Design[]>([]);
  const [personalDesigns, setPersonalDesigns] = useState<Design[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const [filteredDesigns, setFilteredDesigns] = useState<Design[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriceType, setSelectedPriceType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Gérer le paramètre d'URL pour l'onglet actif
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'personal' || tabParam === 'favorites' || tabParam === 'templates') {
      setActiveTab(tabParam as Tab);
    }
  }, [searchParams]);

  // Charger les favoris depuis le localStorage
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favoriteDesigns') || '[]');
    setFavoriteIds(storedFavorites);
  }, []);

  // Charger les invitations pour vérifier l'utilisation des designs
  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  // Charger les designs selon l'onglet actif
  useEffect(() => {
    const loadData = async () => {
      if (activeTab === 'templates' || activeTab === 'favorites') {
        const data = await fetchTemplates();
        setTemplates(data || []);
      } else if (activeTab === 'personal') {
        const data = await fetchUserDesigns();
        setPersonalDesigns(data || []);
      }
    };
    loadData();
  }, [activeTab, fetchTemplates, fetchUserDesigns]);

  // Filtrer les designs
  useEffect(() => {
    let sourceDesigns: Design[] = [];

    if (activeTab === 'templates') {
      sourceDesigns = templates;
    } else if (activeTab === 'favorites') {
      sourceDesigns = templates.filter(d => favoriteIds.includes(d.id));
    } else if (activeTab === 'personal') {
      sourceDesigns = personalDesigns;
    }

    if (!sourceDesigns) {
      setFilteredDesigns([]);
      return;
    }

    let filtered = [...sourceDesigns];

    // Filtre par recherche
    if (searchQuery.trim()) {
      filtered = filtered.filter(design =>
        design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        design.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        design.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filtre par tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(design =>
        selectedTags.some(tag => design.tags?.includes(tag))
      );
    }

    // Filtre par prix (seulement pour les modèles)
    if (activeTab !== 'personal' && selectedPriceType !== 'all') {
      filtered = filtered.filter(design => design.priceType === selectedPriceType);
    }

    setFilteredDesigns(filtered);
  }, [searchQuery, selectedTags, selectedPriceType, templates, personalDesigns, favoriteIds, activeTab]);

  const allTags = Array.from(new Set((activeTab === 'personal' ? personalDesigns : templates).flatMap(d => d.tags || [])));

  const handleCardClick = (design: Design) => {
    if (activeTab === 'personal') {
      // Pour les designs personnels, on va directement dans l'éditeur pour modifier
      router.push(`/client/design/editor?designId=${design.id}`);
    } else {
      // Pour les modèles, on va sur la page de détail
      router.push(`/client/design/${design.id}`);
    }
  };

  const handleUseDesign = (e: React.MouseEvent, design: Design) => {
    e.stopPropagation(); // Empêcher le clic sur la carte
    // Rediriger vers la création d'invitation avec ce design
    router.push(`/client/invitations?designId=${design.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, design: Design) => {
    e.stopPropagation();

    // Vérifier si le design est utilisé dans une invitation
    const isUsed = invitations.some(inv => inv.designId === design.id);
    if (isUsed) {
      alert("Impossible de supprimer ce design car il est utilisé dans une ou plusieurs invitations.");
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce design ?')) {
      try {
        await deleteDesign(design.id);

        // Supprimer les images de Firebase
        if (design.thumbnail && design.thumbnail.includes('firebasestorage')) {
          try { await deleteFromFirebase(design.thumbnail); } catch (e) { console.error(e); }
        }
        if (design.previewImage && design.previewImage !== design.thumbnail && design.previewImage.includes('firebasestorage')) {
          try { await deleteFromFirebase(design.previewImage); } catch (e) { console.error(e); }
        }

        // Rafraîchir la liste
        const data = await fetchUserDesigns();
        setPersonalDesigns(data || []);
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className={styles.page}>
      <HeaderMobile title="Mes Designs" />

      <main className={styles.main}>
        <p className={styles.subtitle}>Gérez vos modèles favoris et vos créations personnelles</p>

        <div className={styles.viewControls}>
          <button
            onClick={() => setViewMode('grid')}
            className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
          >
            <List size={20} />
          </button>
        </div>

        {/* Onglets */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'templates' ? styles.activeTab : ''}`}
            onClick={() => {
              setActiveTab('templates');
              router.replace('/client/design?tab=templates');
            }}
          >
            <LayoutTemplate size={18} />
            Tous les modèles
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'favorites' ? styles.activeTab : ''}`}
            onClick={() => {
              setActiveTab('favorites');
              router.replace('/client/design?tab=favorites');
            }}
          >
            <Heart size={18} />
            Vos favoris
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'personal' ? styles.activeTab : ''}`}
            onClick={() => {
              setActiveTab('personal');
              router.replace('/client/design?tab=personal');
            }}
          >
            <Palette size={18} />
            Vos designs personnalisés
          </button>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher un design..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <Filter size={16} />
            <span className={styles.filterLabel}>Filtres :</span>

            {activeTab !== 'personal' && (
              <select
                value={selectedPriceType}
                onChange={(e) => setSelectedPriceType(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Tous les prix</option>
                <option value="FREE">Gratuit</option>
                <option value="ESSENTIAL">Essentiel</option>
                <option value="ELEGANT">Élégant</option>
                <option value="LUXE">Luxe</option>
              </select>
            )}

            {allTags.length > 0 && (
              <div className={styles.tagsFilter}>
                {allTags.slice(0, 10).map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTags(prev =>
                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                      );
                    }}
                    className={`${styles.tagButton} ${selectedTags.includes(tag) ? styles.active : ''}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Chargement...</div>
        ) : filteredDesigns.length === 0 ? (
          <div className={styles.empty}>
            <Sparkles size={48} />
            <p>Aucun design trouvé</p>
            {activeTab === 'favorites' && <p>Ajoutez des modèles à vos favoris pour les retrouver ici.</p>}
            {activeTab === 'personal' && <p>Vous n'avez pas encore créé de design personnalisé.</p>}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? styles.grid : styles.list}>
            {filteredDesigns.map(design => (
              <div key={design.id} className={styles.designCard}>
                <div className={styles.cardImage} onClick={() => handleCardClick(design)}>
                  <DesignPreview
                    design={design}
                    width={300}
                    height={400}
                  />
                  <div className={styles.cardOverlay}>
                    {activeTab !== 'personal' && (
                      <span className={styles.priceBadge}>
                        {design.priceType === 'FREE' ? 'Gratuit' :
                          design.priceType === 'ESSENTIAL' ? 'Essentiel' :
                            design.priceType === 'ELEGANT' ? 'Élégant' : 'Luxe'}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{design.name}</h3>
                  {design.description && (
                    <p className={styles.cardDescription}>{design.description}</p>
                  )}

                  {activeTab === 'personal' ? (
                    <div className={styles.cardActions}>
                      <button
                        className={styles.secondaryButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(design);
                        }}
                      >
                        Modifier
                      </button>
                      <button
                        className={styles.secondaryButton}
                        style={{ color: 'var(--alert-error)', borderColor: 'var(--alert-error)' }}
                        onClick={(e) => handleDelete(e, design)}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        className={styles.viewButton}
                        onClick={(e) => handleUseDesign(e, design)}
                      >
                        Utiliser
                      </button>
                    </div>
                  ) : (
                    <button
                      className={styles.viewButton}
                      onClick={() => handleCardClick(design)}
                    >
                      Voir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
