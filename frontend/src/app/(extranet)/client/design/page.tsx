'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDesigns } from '@/hooks/useDesigns';
import { useInvitations } from '@/hooks/useInvitations';
import { Design } from '@/types';
import DesignPreview from '@/components/DesignPreview';
import { HeaderMobile } from '@/components/HeaderMobile';
import { Search, Sparkles, Heart, Palette, LayoutTemplate, Trash2, Upload, X } from 'lucide-react';
import { deleteFromFirebase, uploadToFirebase } from '@/lib/firebase';
import { useToast } from '@/components/ui/toast';
import styles from './page.module.css';

type Tab = 'templates' | 'favorites' | 'personal';

export default function DesignsGalleryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchTemplates, fetchUserDesigns, loading, deleteDesign, createPersonalizedDesign } = useDesigns();
  const { invitations, fetchInvitations } = useInvitations();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('templates');
  const [importLoading, setImportLoading] = useState(false);
  const [showImportBanner, setShowImportBanner] = useState(true);

  const [templates, setTemplates] = useState<Design[]>([]);
  const [personalDesigns, setPersonalDesigns] = useState<Design[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const [filteredDesigns, setFilteredDesigns] = useState<Design[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriceType, setSelectedPriceType] = useState<string>('all');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'personal' || tabParam === 'favorites' || tabParam === 'templates') {
      setActiveTab(tabParam as Tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favoriteDesigns') || '[]');
    setFavoriteIds(storedFavorites);
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

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

    if (searchQuery.trim()) {
      filtered = filtered.filter(design =>
        design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        design.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        design.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(design =>
        selectedTags.some(tag => design.tags?.includes(tag))
      );
    }

    if (activeTab !== 'personal' && selectedPriceType !== 'all') {
      filtered = filtered.filter(design => design.priceType === selectedPriceType);
    }

    setFilteredDesigns(filtered);
  }, [searchQuery, selectedTags, selectedPriceType, templates, personalDesigns, favoriteIds, activeTab]);

  const allTags = Array.from(new Set((activeTab === 'personal' ? personalDesigns : templates).flatMap(d => d.tags || [])));

  const handleCardClick = (design: Design) => {
    if (activeTab === 'personal') {
      router.push(`/client/design/editor?designId=${design.id}`);
    } else {
      router.push(`/client/design/${design.id}`);
    }
  };

  const handleUseDesign = (e: React.MouseEvent, design: Design) => {
    e.stopPropagation();
    router.push(`/client/invitations?designId=${design.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, design: Design) => {
    e.stopPropagation();

    const isUsed = invitations.some(inv => inv.designId === design.id);
    if (isUsed) {
      alert("Impossible de supprimer ce design car il est utilisé dans un événement.");
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce design ?')) {
      try {
        await deleteDesign(design.id);

        if (design.thumbnail && design.thumbnail.includes('firebasestorage')) {
          try { await deleteFromFirebase(design.thumbnail); } catch (e) { console.error(e); }
        }
        if (design.previewImage && design.previewImage !== design.thumbnail && design.previewImage.includes('firebasestorage')) {
          try { await deleteFromFirebase(design.previewImage); } catch (e) { console.error(e); }
        }

        const data = await fetchUserDesigns();
        setPersonalDesigns(data || []);
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleImportImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    try {
      const fileName = `design-import-${Date.now()}.${file.name.split('.').pop()}`;
      const imageUrl = await uploadToFirebase(file, `designs/preview/${fileName}`);

      const simpleFabricData = {
        version: '6.9.0',
        objects: [],
        width: 794,
        height: 1123,
        background: '#ffffff',
      };

      await createPersonalizedDesign(
        '',
        simpleFabricData,
        file.name.replace(/\.[^.]+$/, '') || 'Mon invitation importée',
        imageUrl,
        imageUrl
      );

      addToast({
        type: 'success',
        title: 'Import réussi !',
        message: 'Votre invitation a été enregistrée dans vos créations.'
      });

      const data = await fetchUserDesigns();
      setPersonalDesigns(data || []);
      setActiveTab('personal');
      router.replace('/client/design?tab=personal');
    } catch (error) {
      console.error('Erreur import:', error);
      addToast({
        type: 'error',
        title: 'Erreur',
        message: "Impossible d'importer l'image. Vérifiez le format."
      });
    } finally {
      setImportLoading(false);
      e.target.value = '';
    }
  };

  const getIntroText = () => {
    switch (activeTab) {
      case 'templates':
        return 'Parcourez nos modèles et choisissez celui qui vous correspond pour créer votre invitation.';
      case 'favorites':
        return 'Retrouvez ici tous les modèles que vous avez ajoutés à vos favoris.';
      case 'personal':
        return 'Vos créations personnalisées. Cliquez sur un design pour le modifier dans l\'éditeur.';
    }
  };

  return (
    <div className={styles.page}>
      <HeaderMobile title="Designs" />

      <div className={styles.pageContent}>
        {/* Tabs — underline style */}
        <div className={styles.tabs} role="tablist">
          <button
            className={`${styles.tab} ${activeTab === 'templates' ? styles.activeTab : ''}`}
            onClick={() => {
              setActiveTab('templates');
              router.replace('/client/design?tab=templates');
            }}
            role="tab"
            aria-selected={activeTab === 'templates'}
          >
            <LayoutTemplate size={16} />
            Modèles
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'favorites' ? styles.activeTab : ''}`}
            onClick={() => {
              setActiveTab('favorites');
              router.replace('/client/design?tab=favorites');
            }}
            role="tab"
            aria-selected={activeTab === 'favorites'}
          >
            <Heart size={16} />
            Favoris
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'personal' ? styles.activeTab : ''}`}
            onClick={() => {
              setActiveTab('personal');
              router.replace('/client/design?tab=personal');
            }}
            role="tab"
            aria-selected={activeTab === 'personal'}
          >
            <Palette size={16} />
            Mes créations
          </button>
        </div>

        {/* Intro + Search — same row */}
        <div className={styles.searchBar}>
          <p className={styles.introText}>{getIntroText()}</p>

          <div className={styles.searchRight}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                aria-label="Rechercher un design"
              />
            </div>

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
                {allTags.slice(0, 6).map(tag => (
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

        {/* Grid */}
        {loading ? (
          <div className={styles.loading}>Chargement...</div>
        ) : (
          <div className={styles.grid} role="tabpanel">

            {/* Carte d'importation d'invitation — uniquement dans 'personal' */}
            {activeTab === 'personal' && showImportBanner && (
              <div className={styles.importCard}>
                <button
                  className={styles.importBannerClose}
                  onClick={() => setShowImportBanner(false)}
                  title="Masquer"
                >
                  <X size={14} />
                </button>

                <div className={styles.importCardContent}>
                  <div className={styles.importIconWrap}>
                    <Upload size={28} />
                  </div>
                  <div>
                    <p className={styles.importCardTitle}>Importer votre invitation</p>
                    <p className={styles.importCardSub}>PNG, JPG, JPEG acceptés — Canva, Photoshop, etc.</p>
                  </div>
                </div>

                <label className={styles.importButton}>
                  {importLoading ? 'Import en cours...' : 'Choisir une image'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleImportImage}
                    className={styles.fileInputHidden}
                    disabled={importLoading}
                  />
                </label>
              </div>
            )}

            {filteredDesigns.length === 0 && activeTab !== 'personal' && (
              <div className={styles.emptyInline}>
                <Sparkles size={40} />
                <p>Aucun design trouvé</p>
                {activeTab === 'favorites' && <p>Ajoutez des modèles à vos favoris pour les retrouver ici.</p>}
              </div>
            )}

            {filteredDesigns.length === 0 && activeTab === 'personal' && (
              <div className={styles.emptyInline}>
                <Sparkles size={40} />
                <p>Aucune création pour l&apos;instant.</p>
                <p>Utilisez la carte ci-dessus pour importer ou choisissez un modèle.</p>
              </div>
            )}
            {filteredDesigns.map(design => (
              <div
                key={design.id}
                className={styles.designCard}
                onClick={() => handleCardClick(design)}
              >
                <div className={styles.cardImage}>
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

                  {activeTab === 'personal' && (
                    <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
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
                        className={`${styles.secondaryButton} ${styles.deleteButton}`}
                        onClick={(e) => handleDelete(e, design)}
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        className={styles.viewButton}
                        onClick={(e) => handleUseDesign(e, design)}
                      >
                        Utiliser
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
