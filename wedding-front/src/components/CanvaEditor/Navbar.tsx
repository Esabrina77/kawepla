'use client';

import React, { useState } from 'react';
import {
    Undo2,
    Redo2,
    Download,
    ZoomIn,
    ZoomOut,
    Grid3X3,
    Save
} from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import styles from './Navbar.module.css';

interface NavbarProps {
    onSave?: () => void;
    onExport?: () => void;
    saving?: boolean;
    isEditing?: boolean;
}

const Navbar = ({ onSave, onExport, saving, isEditing }: NavbarProps) => {
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
                    title="Undo (Ctrl+Z)"
                >
                    <Undo2 size={18} strokeWidth={2} />
                </button>
                <button
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    className={styles.iconButton}
                    title="Redo (Ctrl+Shift+Z)"
                >
                    <Redo2 size={18} strokeWidth={2} />
                </button>

                <div className={styles.separator} />

                <button
                    onClick={toggleGrid}
                    className={`${styles.iconButton} ${gridEnabled ? styles.active : ''}`}
                    title="Toggle Grid"
                >
                    <Grid3X3 size={18} strokeWidth={2} />
                </button>

                <div className={styles.separator} />

                <button
                    onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
                    className={styles.iconButton}
                >
                    <ZoomOut size={18} strokeWidth={2} />
                </button>
                <span className={styles.zoomLabel}>
                    {Math.round(zoom * 100)}%
                </span>
                <button
                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                    className={styles.iconButton}
                >
                    <ZoomIn size={18} strokeWidth={2} />
                </button>
            </div>

            <div className={styles.rightActions}>
                {onSave && (
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className={styles.saveButton}
                        style={{ opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
                    >
                        {saving ? 'Saving...' : (isEditing ? 'Update Design' : 'Save to Kawepla')}
                        <Save size={16} strokeWidth={2.5} />
                    </button>
                )}
                <button
                    onClick={handleExport}
                    className={styles.exportButton}
                >
                    Download PNG
                    <Download size={16} strokeWidth={2.5} />
                </button>
            </div>
        </header>
    );
};

export default Navbar;
