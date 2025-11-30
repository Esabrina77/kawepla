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
import styles from './editor.module.css';

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
    onSave: (name: string) => Promise<void>;
    loading: boolean;
    initialName?: string;
}

function SaveDesignDialog({ isOpen, onClose, onSave, loading, initialName }: SaveDesignDialogProps) {
    const [name, setName] = useState(initialName || '');

    useEffect(() => {
        if (initialName) setName(initialName);
    }, [initialName]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        await onSave(name);
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Sauvegarder votre design</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nom du design</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Mon invitation de mariage"
                                required
                                className={styles.input}
                                autoFocus
                            />
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

export default function ClientDesignEditorPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { getDesignById, createPersonalizedDesign, updateDesign } = useDesigns();
    const { addToast } = useToast();

    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    // IDs
    const designId = searchParams.get('designId'); // Pour éditer un design existant
    const templateId = searchParams.get('templateId'); // Pour créer depuis un modèle

    const [currentDesign, setCurrentDesign] = useState<any>(null);

    // Charger le design ou le modèle
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                let idToLoad = designId || templateId;

                if (!idToLoad) {
                    addToast({
                        type: 'error',
                        title: 'Erreur',
                        message: 'Aucun design spécifié'
                    });
                    router.push('/client/design');
                    return;
                }

                const design = await getDesignById(idToLoad);
                if (design) {
                    setCurrentDesign(design);
                } else {
                    addToast({
                        type: 'error',
                        title: 'Erreur',
                        message: 'Design introuvable'
                    });
                    router.push('/client/design');
                }
            } catch (error) {
                console.error('Erreur chargement:', error);
                addToast({
                    type: 'error',
                    title: 'Erreur',
                    message: 'Erreur lors du chargement'
                });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [designId, templateId, getDesignById, router]);

    // Initialiser le canvas
    useEffect(() => {
        if (canvas && currentDesign) {
            loadKaweplaDesignToFabric(currentDesign, canvas);
        }
    }, [canvas, currentDesign]);

    const handleSaveClick = () => {
        if (designId) {
            // Si on édite, on sauvegarde directement (ou on pourrait demander confirmation)
            handleSave(currentDesign.name);
        } else {
            // Si nouveau, on demande le nom
            setShowSaveDialog(true);
        }
    };

    const handleSave = async (name: string) => {
        if (!canvas) return;

        setSaving(true);
        try {
            // 1. Générer miniature
            // 1. Générer miniature haute qualité
            canvas.discardActiveObject();

            // Sauvegarder l'état actuel (zoom et dimensions)
            const originalZoom = canvas.getZoom();
            const originalWidth = canvas.width;
            const originalHeight = canvas.height;
            const originalVpt = canvas.viewportTransform;

            // Calculer les dimensions logiques (taille réelle du design)
            // Si le zoom est 0, on évite la division par zéro (peu probable)
            const safeZoom = originalZoom || 1;
            const logicalWidth = originalWidth / safeZoom;
            const logicalHeight = originalHeight / safeZoom;

            // Réinitialiser à l'échelle 100% pour l'export
            canvas.setZoom(1);
            canvas.setWidth(logicalWidth);
            canvas.setHeight(logicalHeight);
            // S'assurer que le viewport est remis à zéro (pas de pan)
            if (canvas.viewportTransform) {
                canvas.viewportTransform[4] = 0;
                canvas.viewportTransform[5] = 0;
            }
            canvas.requestRenderAll();

            // Exporter avec un multiplicateur pour une qualité encore meilleure (ex: Retina)
            const dataUrl = canvas.toDataURL({
                format: 'png',
                quality: 1.0,
                multiplier: 2.0, // x2 sur la taille réelle (A4 -> ~1600px large)
            });

            // Restaurer l'état original pour l'utilisateur
            canvas.setZoom(originalZoom);
            canvas.setWidth(originalWidth);
            canvas.setHeight(originalHeight);
            if (originalVpt) {
                canvas.viewportTransform = originalVpt;
            }
            canvas.requestRenderAll();

            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const fileName = `design-personal-${Date.now()}.png`;
            const file = new File([blob], fileName, { type: 'image/png' });

            const thumbnailUrl = await uploadToFirebase(file, `designs/preview/${fileName}`);

            // 2. Convertir données
            const converted = convertFabricToKawepla(canvas);

            if (designId) {
                // Mise à jour
                await updateDesign(designId, {
                    name,
                    fabricData: converted.fabricData,
                    thumbnail: thumbnailUrl,
                    previewImage: thumbnailUrl,
                    canvasWidth: converted.canvasWidth,
                    canvasHeight: converted.canvasHeight,
                });
                addToast({
                    type: 'success',
                    title: 'Succès',
                    message: 'Design mis à jour !'
                });
            } else if (templateId) {
                // Création
                await createPersonalizedDesign(
                    templateId,
                    converted.fabricData,
                    name,
                    thumbnailUrl,
                    thumbnailUrl
                );
                addToast({
                    type: 'success',
                    title: 'Succès',
                    message: 'Design créé avec succès !'
                });
            }

            router.push('/client/design'); // Retour à la galerie (onglet "Mes créations" sera géré par l'utilisateur ou par défaut)
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            addToast({
                type: 'error',
                title: 'Erreur',
                message: 'Erreur lors de la sauvegarde'
            });
        } finally {
            setSaving(false);
            setShowSaveDialog(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Chargement de l'éditeur...</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <HeaderMobile
                title={currentDesign?.name || "Éditeur de design"}
                onBack={() => router.push('/client/design')}
                showBackButton={true}
            />

            <div className={styles.editorContainer}>
                <Navbar
                    onSave={handleSaveClick}
                    isEditing={!!designId}
                    saving={saving}
                />

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
                initialName={currentDesign?.name ? `${currentDesign.name} - Copie` : ''}
            />
        </div>
    );
}
