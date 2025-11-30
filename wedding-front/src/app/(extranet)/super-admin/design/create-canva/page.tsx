'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { HeaderMobile } from '@/components/HeaderMobile';
import { useDesigns } from '@/hooks/useDesigns';
import { uploadToFirebase } from '@/lib/firebase';
import * as fabric from 'fabric';
import { convertFabricToKawepla, loadKaweplaDesignToFabric } from '@/utils/fabricToKaweplaAdapter';
import { useToast } from '@/components/ui/toast';
import styles from './create-canva.module.css';

// Importer dynamiquement les composants de l'éditeur Canva
const Canvas = dynamic(() => import('@/components/CanvaEditor/Canvas'), {
  ssr: false,
  loading: () => <div>Chargement de l'éditeur...</div>
});

const Toolbar = dynamic(() => import('@/components/CanvaEditor/Toolbar'), {
  ssr: false
});

const PropertiesPanel = dynamic(() => import('@/components/CanvaEditor/PropertiesPanel'), {
  ssr: false
});

const ContextToolbar = dynamic(() => import('@/components/CanvaEditor/ContextToolbar'), {
  ssr: false
});

const Navbar = dynamic(() => import('@/components/CanvaEditor/Navbar'), {
  ssr: false
});

interface SaveDesignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description?: string; category?: string; tags?: string[]; priceType?: string }) => Promise<void>;
  loading: boolean;
  initialData?: { name: string; description?: string; category?: string; priceType?: string };
}

function SaveDesignDialog({ isOpen, onClose, onSave, loading, initialData }: SaveDesignDialogProps) {
  const { addToast } = useToast();
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || 'invitation');
  const [priceType, setPriceType] = useState<'FREE' | 'ESSENTIAL' | 'ELEGANT' | 'LUXE'>((initialData?.priceType as any) || 'FREE');

  // Mettre à jour les champs si initialData change
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || 'invitation');
      setPriceType((initialData.priceType as any) || 'FREE');
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez saisir un nom pour le design'
      });
      return;
    }
    await onSave({ name, description, category, priceType });
    setName('');
    setDescription('');
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Sauvegarder le design</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nom du design *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Invitation mariage élégante"
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du design..."
                rows={3}
                className={styles.textarea}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={styles.select}
              >
                <option value="invitation">Invitation</option>
                <option value="minimaliste">Minimaliste</option>
                <option value="moderne">Moderne</option>
                <option value="élégant">Élégant</option>
                <option value="luxe">Luxe</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Type de prix</label>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value as any)}
                className={styles.select}
              >
                <option value="FREE">Gratuit</option>
                <option value="ESSENTIAL">Essentiel</option>
                <option value="ELEGANT">Élégant</option>
                <option value="LUXE">Luxe</option>
              </select>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={styles.cancelButton}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className={styles.saveButton}
            >
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateCanvaDesignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createDesign, getDesignById, updateDesign } = useDesigns();
  const { addToast } = useToast();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  // États pour l'édition
  const [designId, setDesignId] = useState<string | null>(null);
  const [currentDesign, setCurrentDesign] = useState<any>(null);
  const [loadingDesign, setLoadingDesign] = useState(false);

  // Récupérer le designId depuis l'URL
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setDesignId(id);
    }
  }, [searchParams]);

  // Charger le design existant si on est en mode édition
  useEffect(() => {
    if (designId) {
      const loadDesign = async () => {
        try {
          setLoadingDesign(true);
          const design = await getDesignById(designId);
          if (design) {
            setCurrentDesign(design);
          } else {
            addToast({
              type: 'error',
              title: 'Erreur',
              message: 'Design introuvable'
            });
            router.push('/super-admin/design');
          }
        } catch (error) {
          console.error('Erreur lors du chargement du design:', error);
          addToast({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors du chargement du design'
          });
        } finally {
          setLoadingDesign(false);
        }
      };
      loadDesign();
    }
  }, [designId, getDesignById, router]);

  // Charger le design dans le canvas une fois que le canvas est prêt
  useEffect(() => {
    if (canvas && currentDesign) {
      loadKaweplaDesignToFabric(currentDesign, canvas);
    }
  }, [canvas, currentDesign]);

  const handleSave = async (data: { name: string; description?: string; category?: string; tags?: string[]; priceType?: string }) => {
    if (!canvas) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Canvas non disponible'
      });
      return;
    }

    setSaving(true);
    try {
      // 1. Générer l'image de prévisualisation (Thumbnail)
      // On déselectionne tout pour que la capture soit propre
      canvas.discardActiveObject();
      canvas.requestRenderAll();

      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 0.8,
        multiplier: 0.5, // 50% de la taille pour la miniature
      });

      // Convertir DataURL en File
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const fileName = `design-thumb-${Date.now()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Uploader vers Firebase
      // On passe le chemin dans le nom de fichier car le type 'designs' n'est pas dans l'enum
      const thumbnailUrl = await uploadToFirebase(file, `designs/preview/${fileName}`);

      // Convertir le canvas Fabric.js vers le format Kawepla simplifié
      const converted = convertFabricToKawepla(canvas, backgroundImage || undefined);

      // Préparer les données pour l'API (structure simplifiée)
      const designData = {
        name: data.name,
        description: data.description || `Design créé le ${new Date().toLocaleDateString()}`,
        tags: data.tags || [],
        priceType: (data.priceType as 'FREE' | 'ESSENTIAL' | 'ELEGANT' | 'LUXE') || 'FREE',
        fabricData: converted.fabricData,
        editorVersion: 'canva' as const,
        canvasWidth: converted.canvasWidth,
        canvasHeight: converted.canvasHeight,
        canvasFormat: converted.canvasFormat,
        backgroundImage: backgroundImage || undefined,
        thumbnail: thumbnailUrl,
        previewImage: thumbnailUrl,
        isTemplate: true, // Les designs créés par super-admin sont des modèles
      };

      if (designId) {
        // Mise à jour d'un design existant
        await updateDesign(designId, designData);
        addToast({
          type: 'success',
          title: 'Succès',
          message: 'Design mis à jour avec succès !'
        });
      } else {
        // Création d'un nouveau design
        await createDesign(designData);
        addToast({
          type: 'success',
          title: 'Succès',
          message: 'Design sauvegardé avec succès !'
        });
      }

      setShowSaveDialog(false);
      router.push('/super-admin/design');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      addToast({
        type: 'error',
        title: 'Erreur',
        message: `Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <HeaderMobile
        title="Créer un design avec Canva"
        onBack={() => router.push('/super-admin/design')}
      />

      <div className={styles.editorContainer}>
        {/* Navbar intégré dans la page avec callback onSave */}
        <Navbar
          onSave={() => setShowSaveDialog(true)}
          isEditing={!!designId}
        />

        {/* Workspace de l'éditeur */}
        <div className={styles.workspace}>
          <Toolbar />
          <div className={styles.canvasArea}>
            <ContextToolbar />
            <Canvas onCanvasReady={setCanvas} />
          </div>
          <PropertiesPanel />
        </div>
      </div>

      <SaveDesignDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSave}
        loading={saving}
        initialData={currentDesign}
      />
    </div>
  );
}
