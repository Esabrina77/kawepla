'use client';

import React, { useState } from 'react';
import {
    Undo2,
    Redo2,
    Download,
    Grid3X3,
    Save,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import styles from './Navbar.module.css';

interface NavbarProps {
    onSave?: () => void;
    onExport?: () => void;
    saving?: boolean;
    isEditing?: boolean;
    showJsonExport?: boolean;
}

const Navbar = ({ onSave, onExport, saving, isEditing, showJsonExport }: NavbarProps) => {
    const {
        undo,
        redo,
        historyIndex,
        history,
        zoom,
        setZoom,
        gridEnabled,
        toggleGrid
    } = useEditorStore();

    const handleExport = () => {
        const canvas = useEditorStore.getState().canvas;
        if (!canvas) return;
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2
        });

        const link = document.createElement('a');
        link.download = 'invitation-design.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <header className={styles.navbar}>
            <div className={styles.brandSection}>
                {/* Logo, title and menu removed */}
            </div>

            <div className={styles.centerControls}>
                <button
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className={styles.iconButton}
                    title="Annuler (Ctrl+Z)"
                >
                    <Undo2 size={18} strokeWidth={2} />
                </button>
                <button
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    className={styles.iconButton}
                    title="Rétablir (Ctrl+Shift+Z)"
                >
                    <Redo2 size={18} strokeWidth={2} />
                </button>

                <div className={styles.separator} />

                <button
                    onClick={toggleGrid}
                    className={`${styles.iconButton} ${gridEnabled ? styles.active : ''}`}
                    title="Afficher/Masquer la grille"
                >
                    <Grid3X3 size={18} strokeWidth={2} />
                </button>

                <div className={styles.separator} />

                <button
                    onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}
                    className={styles.iconButton}
                    title="Zoom -"
                >
                    <ZoomOut size={16} strokeWidth={2} />
                </button>
                <span className={styles.zoomLabel}>
                    {Math.round(zoom * 100)}%
                </span>
                <button
                    onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                    className={styles.iconButton}
                    title="Zoom +"
                >
                    <ZoomIn size={16} strokeWidth={2} />
                </button>

            </div>

            <div className={styles.rightActions}>
                {showJsonExport && (
                    <button
                        onClick={() => {
                            const canvas = useEditorStore.getState().canvas;
                            if (!canvas) return;
                            const json = JSON.stringify(canvas.toJSON());
                            const blob = new Blob([json], { type: 'application/json' });
                            const link = document.createElement('a');
                            link.download = 'design.json';
                            link.href = URL.createObjectURL(blob);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className={styles.exportButton}
                        title="Export JSON"
                    >
                        JSON
                        <Download size={16} strokeWidth={2.5} />
                    </button>
                )}
                {onSave && (
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className={styles.saveButton}
                        style={{ opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
                    >
                        {saving ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Enregistrer sur Kawepla')}
                        <Save size={16} strokeWidth={2.5} />
                    </button>
                )}
                <button
                    onClick={handleExport}
                    className={styles.exportButton}
                >
                    Télécharger PNG
                    <Download size={16} strokeWidth={2.5} />
                </button>
            </div>
        </header>
    );
};

export default Navbar;
