'use client';

import React, { useState } from 'react';
import {
    Type,
    Square,
    Image as ImageIcon,
    LayoutTemplate,
    Palette,
    Upload,
    Circle,
    Triangle,
    Minus,
    Pencil,
    Search,
    X,
    Check,
    Sparkles,
    Info
} from 'lucide-react';
import * as fabric from 'fabric';
import { useEditorStore } from '@/store/useEditorStore';
import { GOOGLE_FONTS, loadFonts } from '@/utils/fonts';
import { useModals } from '@/components/ui/modal-provider';
import styles from './Toolbar.module.css';

const Toolbar = () => {
    // Charger les polices au démarrage
    React.useEffect(() => {
        loadFonts(GOOGLE_FONTS);
    }, []);
    const {
        canvas,
        saveHistory,
        setBackgroundColor,
        drawingMode,
        setDrawingMode,
        activeSidebarTab,
        setActiveSidebarTab,
        selectedObjects,
        format
    } = useEditorStore();

    const { showAlert } = useModals();

    const [fontSearch, setFontSearch] = useState('');

    const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canvas || !e.target.files?.[0]) return;
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async (f) => {
            const data = f.target?.result as string;
            try {
                const json = JSON.parse(data);
                await canvas.loadFromJSON(json);
                canvas.renderAll();
                saveHistory();
            } catch (error) {
                console.error('Error loading template:', error);
            }
        };
        reader.readAsText(file);
    };

    const addText = (text: string, options: any) => {
        if (!canvas) return;
        const textbox = new fabric.Textbox(text, {
            left: format.width / 2,
            top: format.height / 2,
            width: 200,
            fontSize: options.fontSize || 20,
            fontWeight: options.fontWeight || 'normal',
            fontFamily: 'Inter',
            fill: '#000000',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            ...options
        });
        canvas.add(textbox);
        canvas.setActiveObject(textbox);
        saveHistory();
    };

    const addShape = (type: string) => {
        if (!canvas) return;
        let shape;
        const centerX = format.width / 2;
        const centerY = format.height / 2;

        switch (type) {
            case 'rect':
                shape = new fabric.Rect({
                    left: centerX,
                    top: centerY,
                    fill: '#e2e8f0',
                    width: 200,
                    height: 200,
                    rx: 10,
                    ry: 10,
                    originX: 'center',
                    originY: 'center',
                });
                break;
            case 'circle':
                shape = new fabric.Circle({
                    left: centerX,
                    top: centerY,
                    fill: '#e2e8f0',
                    radius: 100,
                    originX: 'center',
                    originY: 'center',
                });
                break;
            case 'triangle':
                shape = new fabric.Triangle({
                    left: centerX,
                    top: centerY,
                    fill: '#e2e8f0',
                    width: 200,
                    height: 200,
                    originX: 'center',
                    originY: 'center',
                });
                break;
            case 'line':
                shape = new fabric.Line([centerX - 75, centerY, centerX + 75, centerY], {
                    left: centerX,
                    top: centerY,
                    stroke: '#000000',
                    strokeWidth: 4,
                    originX: 'center',
                    originY: 'center',
                });
                break;
        }

        if (shape) {
            canvas.add(shape);
            canvas.setActiveObject(shape);
            saveHistory();
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canvas || !e.target.files?.[0]) return;
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (f) => {
            const data = f.target?.result as string;
            fabric.Image.fromURL(data, { crossOrigin: 'anonymous' }).then((img) => {
                const maxWidth = format.width * 0.8;
                if (img.width! > maxWidth) {
                    img.scaleToWidth(maxWidth);
                }
                img.set({
                    left: format.width / 2,
                    top: format.height / 2,
                    originX: 'center',
                    originY: 'center',
                });
                canvas.add(img);
                canvas.setActiveObject(img);
                saveHistory();
            });
        };
        reader.readAsDataURL(file);
    };

    const updateFont = (fontFamily: string) => {
        if (!canvas || selectedObjects.length === 0) return;
        selectedObjects.forEach((obj) => {
            if (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text') {
                obj.set('fontFamily', fontFamily);
            }
        });
        canvas.requestRenderAll();
        saveHistory();
    };

    const applyAnimation = (animationType: string) => {
        if (!canvas || selectedObjects.length === 0) return;
        selectedObjects.forEach((obj) => {
            (obj as any).set('animation', animationType);
        });
        saveHistory();
    };

    const filteredFonts = GOOGLE_FONTS.filter(font =>
        font.toLowerCase().includes(fontSearch.toLowerCase())
    );

    const tabs = [
        { id: 'templates', icon: LayoutTemplate, label: 'Modèles' },
        { id: 'text', icon: Type, label: 'Texte' },
        { id: 'elements', icon: Square, label: 'Éléments' },
        { id: 'draw', icon: Pencil, label: 'Dessin' },
        { id: 'images', icon: ImageIcon, label: 'Images' },
        { id: 'background', icon: Palette, label: 'Fond' },
        { id: 'animations', icon: Sparkles, label: 'Animer' },
        { id: 'fonts', icon: Type, label: 'Polices', hidden: true },
    ];

    return (
        <div className={styles.toolbar}>
            <div className={styles.iconRail}>
                {tabs.filter(t => !t.hidden).map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSidebarTab(tab.id)}
                        className={activeSidebarTab === tab.id ? styles.railButtonActive : styles.railButton}
                        title={tab.label}
                    >
                        <tab.icon size={22} strokeWidth={1.6} />
                        <span className={styles.railLabel}>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className={styles.panelContent}>
                <div className={styles.panelHeader}>
                    <h2 className={styles.panelTitle}>
                        {tabs.find(t => t.id === activeSidebarTab)?.label || activeSidebarTab}
                    </h2>
                </div>

                <div className={styles.scrollArea}>
                    {activeSidebarTab === 'templates' && (
                        <div className={styles.section}>
                            <div className={styles.uploadArea}>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleTemplateUpload}
                                    className={styles.fileInput}
                                />
                                <div className={styles.uploadIconCircle}>
                                    <Upload size={24} />
                                </div>
                                <p className={styles.uploadText}>Importer un design</p>
                                <p className={styles.uploadSubtext}>Fichier JSON Fabric</p>
                            </div>

                            <div className={styles.infoBox}>
                                <Info size={16} className={styles.infoIcon} />
                                <p>Glissez-déposez un fichier de sauvegarde pour reprendre votre travail.</p>
                            </div>
                        </div>
                    )}

                    {activeSidebarTab === 'text' && (
                        <div className={styles.section}>
                            <button
                                onClick={() => addText('Ajouter un titre', { fontSize: 42, fontWeight: 'bold' })}
                                className={styles.textButton}
                            >
                                <h1 className={styles.headingPreview}>Ajouter un titre</h1>
                            </button>
                            <button
                                onClick={() => addText('Ajouter un sous-titre', { fontSize: 28, fontWeight: '600' })}
                                className={styles.textButton}
                            >
                                <h2 className={styles.subheadingPreview}>Ajouter un sous-titre</h2>
                            </button>
                            <button
                                onClick={() => addText('Texte de corps', { fontSize: 16, fontWeight: 'normal' })}
                                className={styles.textButton}
                            >
                                <p className={styles.bodyPreview}>Ajouter du texte de corps</p>
                            </button>

                            <div className={styles.divider} />

                            <button className={styles.magicButton} onClick={() => showAlert('Bientôt disponible', 'L\'IA Magic Write arrive très prochainement sur Kawepla pour vous aider à rédiger vos invitations !', 'success')}>
                                <Sparkles size={16} />
                                <span>Écriture Magique IA</span>
                            </button>
                        </div>
                    )}

                    {activeSidebarTab === 'elements' && (
                        <div className={styles.section}>
                            <div className={styles.searchWrapper}>
                                <Search size={14} className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Rechercher des éléments..."
                                    className={styles.searchInput}
                                />
                            </div>

                            {/* ── Formes géométriques ── */}
                            <div>
                                <p className={styles.sectionLabel}>Formes</p>
                                <div className={styles.shapesGrid}>
                                    <button onClick={() => addShape('rect')} className={styles.shapeCard} title="Rectangle">
                                        <div className={styles.shapePreviewRect} />
                                        <span>Rect.</span>
                                    </button>
                                    <button onClick={() => addShape('circle')} className={styles.shapeCard} title="Cercle">
                                        <div className={styles.shapePreviewCircle} />
                                        <span>Cercle</span>
                                    </button>
                                    <button onClick={() => addShape('triangle')} className={styles.shapeCard} title="Triangle">
                                        <div className={styles.shapePreviewTriangle} />
                                        <span>Triangle</span>
                                    </button>
                                    <button onClick={() => addShape('line')} className={styles.shapeCard} title="Ligne">
                                        <div className={styles.shapePreviewLine} />
                                        <span>Ligne</span>
                                    </button>
                                </div>
                            </div>

                            {/* ── Séparateurs décoratifs ── */}
                            <div>
                                <p className={styles.sectionLabel}>Séparateurs</p>
                                <div className={styles.dividersGrid}>
                                    {[
                                        { label: 'Simple', stroke: 2, dash: 'none' },
                                        { label: 'Épais', stroke: 5, dash: 'none' },
                                        { label: 'Pointillé', stroke: 2, dash: '6,4' },
                                        { label: 'Tirets', stroke: 2, dash: '12,6' },
                                    ].map(({ label, stroke, dash }) => (
                                        <button
                                            key={label}
                                            className={styles.dividerCard}
                                            onClick={() => {
                                                if (!canvas) return;
                                                const cx = format.width / 2;
                                                const cy = format.height / 2;
                                                const line = new fabric.Line([cx - 100, cy, cx + 100, cy], {
                                                    stroke: '#000000',
                                                    strokeWidth: stroke,
                                                    strokeDashArray: dash !== 'none' ? dash.split(',').map(Number) : undefined,
                                                    originX: 'center',
                                                    originY: 'center',
                                                    left: cx,
                                                    top: cy,
                                                } as any);
                                                canvas.add(line);
                                                canvas.setActiveObject(line);
                                                saveHistory();
                                            }}
                                        >
                                            <svg width="100%" height="18" viewBox="0 0 80 18">
                                                <line
                                                    x1="4" y1="9" x2="76" y2="9"
                                                    stroke="currentColor"
                                                    strokeWidth={stroke}
                                                    strokeDasharray={dash === 'none' ? undefined : dash}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <span>{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ── Stickers Mariage ── */}
                            <div>
                                <p className={styles.sectionLabel}>Stickers Mariage</p>
                                <div className={styles.stickersGrid}>
                                    {['💍', '💒', '🌸', '🌿', '🕊️', '🥂', '💌', '🎊', '✨', '💖', '🌹', '🎀'].map((emoji) => (
                                        <button
                                            key={emoji}
                                            className={styles.stickerBtn}
                                            title={emoji}
                                            onClick={() => {
                                                if (!canvas) return;
                                                const t = new fabric.Textbox(emoji, {
                                                    left: format.width / 2,
                                                    top: format.height / 2,
                                                    fontSize: 48,
                                                    fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif',
                                                    originX: 'center',
                                                    originY: 'center',
                                                    width: 60,
                                                    textAlign: 'center',
                                                });
                                                canvas.add(t);
                                                canvas.setActiveObject(t);
                                                saveHistory();
                                            }}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSidebarTab === 'draw' && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Drawing Tools</h3>
                            <button
                                onClick={() => setDrawingMode(!drawingMode)}
                                className={`${styles.textButton} ${drawingMode ? styles.activeButton : ''}`}
                                style={{ justifyContent: 'center', flexDirection: 'column', gap: 8, height: 100 }}
                            >
                                <Pencil size={32} />
                                <span>{drawingMode ? 'Stop Drawing' : 'Start Drawing'}</span>
                            </button>

                            {drawingMode && (
                                <div style={{ marginTop: 20 }}>
                                    <label className={styles.label}>Brush Size</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="50"
                                        defaultValue="5"
                                        onChange={(e) => {
                                            if (canvas && canvas.freeDrawingBrush) {
                                                canvas.freeDrawingBrush.width = parseInt(e.target.value, 10);
                                            }
                                        }}
                                        className={styles.slider}
                                    />
                                    <label className={styles.label} style={{ marginTop: 12 }}>Brush Color</label>
                                    <div className={styles.colorGrid}>
                                        {['#000000', '#ef4444', '#3b82f6', '#22c55e', '#eab308'].map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => {
                                                    if (canvas && canvas.freeDrawingBrush) {
                                                        canvas.freeDrawingBrush.color = color;
                                                    }
                                                }}
                                                className={styles.colorButton}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSidebarTab === 'images' && (
                        <div className={styles.section}>
                             <div className={styles.uploadArea}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className={styles.fileInput}
                                />
                                <div className={styles.uploadIconCircle}>
                                    <Upload size={24} />
                                </div>
                                <p className={styles.uploadText}>Importer vos images</p>
                                <p className={styles.uploadSubtext}>PNG, JPG, SVG supportés</p>
                            </div>

                            <div className={styles.divider} />
                            
                            <h3 className={styles.sectionTitle}>Images de Stock</h3>
                            <p className={styles.emptyHint}>Recherchez des images pour votre événement.</p>
                        </div>
                    )}

                    {activeSidebarTab === 'background' && (
                        <div className={styles.section}>
                            <div>
                                <h3 className={styles.sectionTitle}>Solid Colors</h3>
                                <div className={styles.colorGrid}>
                                    {['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b'].map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setBackgroundColor(color)}
                                            className={styles.colorButton}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className={styles.sectionTitle}>Gradients</h3>
                                <div className={styles.grid2}>
                                    <button
                                        onClick={() => setBackgroundColor('#ff9a9e')}
                                        className={styles.gradientButton}
                                        style={{ background: 'linear-gradient(to right, #ff9a9e, #fecfef)' }}
                                    />
                                    <button
                                        onClick={() => setBackgroundColor('#a18cd1')}
                                        className={styles.gradientButton}
                                        style={{ background: 'linear-gradient(to right, #a18cd1, #fbc2eb)' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSidebarTab === 'animations' && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Entrance Animations</h3>
                            <div className={styles.grid2}>
                                <button onClick={() => applyAnimation('fade')} className={styles.textButton} style={{ justifyContent: 'center' }}>
                                    Fade In
                                </button>
                                <button onClick={() => applyAnimation('slideUp')} className={styles.textButton} style={{ justifyContent: 'center' }}>
                                    Slide Up
                                </button>
                                <button onClick={() => applyAnimation('zoomIn')} className={styles.textButton} style={{ justifyContent: 'center' }}>
                                    Zoom In
                                </button>
                                <button onClick={() => applyAnimation(null as any)} className={styles.textButton} style={{ justifyContent: 'center', border: '1px solid #ef4444', color: '#ef4444' }}>
                                    Remove
                                </button>
                            </div>
                            <p className={styles.uploadSubtext} style={{ marginTop: 12 }}>
                                Select an object and click an animation to apply it. Use the Preview button in the top bar to play.
                            </p>
                        </div>
                    )}

                    {activeSidebarTab === 'fonts' && (
                        <div className={styles.section}>
                            <div className={styles.searchWrapper} style={{ marginBottom: 16 }}>
                                <Search size={14} className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Search fonts..."
                                    value={fontSearch}
                                    onChange={(e) => setFontSearch(e.target.value)}
                                    className={styles.searchInput}
                                    autoFocus
                                />
                                {fontSearch && (
                                    <button onClick={() => setFontSearch('')} className={styles.clearSearch}>
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                            <div className={styles.fontList}>
                                {filteredFonts.map((font) => (
                                    <button
                                        key={font}
                                        className={styles.fontOption}
                                        onClick={() => updateFont(font)}
                                        style={{
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            display: 'flex',
                                            padding: '10px 12px',
                                            background: selectedObjects[0]?.get('fontFamily') === font ? '#eff6ff' : 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textAlign: 'left'
                                        }}
                                    >
                                        <span style={{ fontFamily: font, fontSize: 14 }}>{font}</span>
                                        {selectedObjects[0]?.get('fontFamily') === font && <Check size={14} color="#4f46e5" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Toolbar;

