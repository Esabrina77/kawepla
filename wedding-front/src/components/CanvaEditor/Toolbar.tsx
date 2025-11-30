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
    Sparkles
} from 'lucide-react';
import * as fabric from 'fabric';
import { useEditorStore } from '@/store/useEditorStore';
import { GOOGLE_FONTS, loadFonts } from '@/utils/fonts';
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
        selectedObjects
    } = useEditorStore();

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
            left: canvas.width! / 2 - 100,
            top: canvas.height! / 2,
            width: 200,
            fontSize: options.fontSize || 20,
            fontWeight: options.fontWeight || 'normal',
            fontFamily: 'Inter',
            fill: '#000000',
            textAlign: 'center',
            ...options
        });
        canvas.add(textbox);
        canvas.setActiveObject(textbox);
        saveHistory();
    };

    const addShape = (type: string) => {
        if (!canvas) return;
        let shape;
        const center = canvas.getCenter();

        switch (type) {
            case 'rect':
                shape = new fabric.Rect({
                    left: center.left,
                    top: center.top,
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
                    left: center.left,
                    top: center.top,
                    fill: '#e2e8f0',
                    radius: 100,
                    originX: 'center',
                    originY: 'center',
                });
                break;
            case 'triangle':
                shape = new fabric.Triangle({
                    left: center.left,
                    top: center.top,
                    fill: '#e2e8f0',
                    width: 200,
                    height: 200,
                    originX: 'center',
                    originY: 'center',
                });
                break;
            case 'line':
                shape = new fabric.Line([50, 100, 200, 100], {
                    left: center.left,
                    top: center.top,
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
                img.scaleToWidth(300);
                const center = canvas.getCenter();
                img.set({
                    left: center.left,
                    top: center.top,
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
        { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
        { id: 'text', icon: Type, label: 'Text' },
        { id: 'elements', icon: Square, label: 'Elements' },
        { id: 'draw', icon: Pencil, label: 'Draw' },
        { id: 'images', icon: ImageIcon, label: 'Images' },
        { id: 'background', icon: Palette, label: 'Background' },
        { id: 'animations', icon: Sparkles, label: 'Animate' },
        { id: 'fonts', icon: Type, label: 'Fonts', hidden: true },
    ];

    return (
        <div className={styles.toolbar}>
            <div className={styles.iconRail}>
                {tabs.filter(t => !t.hidden).map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSidebarTab(tab.id)}
                        className={activeSidebarTab === tab.id ? styles.railButtonActive : styles.railButton}
                    >
                        <tab.icon size={24} strokeWidth={1.5} />
                        <span className={styles.railLabel}>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className={styles.panelContent}>
                <div className={styles.panelHeader}>
                    <h2 className={styles.panelTitle}>
                        {activeSidebarTab === 'fonts' ? 'Fonts' : activeSidebarTab.charAt(0).toUpperCase() + activeSidebarTab.slice(1)}
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
                                <p className={styles.uploadText}>Upload Template</p>
                                <p className={styles.uploadSubtext}>JSON file</p>
                            </div>

                            <h3 className={styles.sectionTitle} style={{ marginTop: 24 }}>Example Templates</h3>
                            <div className={styles.grid2}>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className={styles.templateCard}>
                                        <div className={styles.templateOverlay}>
                                            <span className={styles.templateName}>Template {i}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSidebarTab === 'text' && (
                        <div className={styles.section}>
                            <button
                                onClick={() => addText('Add a heading', { fontSize: 42, fontWeight: 'bold' })}
                                className={styles.textButton}
                            >
                                <h1 className={styles.headingPreview}>Add a heading</h1>
                            </button>
                            <button
                                onClick={() => addText('Add a subheading', { fontSize: 28, fontWeight: '600' })}
                                className={styles.textButton}
                            >
                                <h2 className={styles.subheadingPreview}>Add a subheading</h2>
                            </button>
                            <button
                                onClick={() => addText('Add a little bit of body text', { fontSize: 16, fontWeight: 'normal' })}
                                className={styles.textButton}
                            >
                                <p className={styles.bodyPreview}>Add a little bit of body text</p>
                            </button>
                        </div>
                    )}

                    {activeSidebarTab === 'elements' && (
                        <div>
                            <h3 className={styles.sectionTitle}>Shapes</h3>
                            <div className={styles.grid3}>
                                <button onClick={() => addShape('rect')} className={styles.shapeButton}>
                                    <Square size={32} />
                                </button>
                                <button onClick={() => addShape('circle')} className={styles.shapeButton}>
                                    <Circle size={32} />
                                </button>
                                <button onClick={() => addShape('triangle')} className={styles.shapeButton}>
                                    <Triangle size={32} />
                                </button>
                                <button onClick={() => addShape('line')} className={styles.shapeButton}>
                                    <Minus size={32} />
                                </button>
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
                                <p className={styles.uploadText}>Upload Image</p>
                                <p className={styles.uploadSubtext}>JPEG, PNG, SVG</p>
                            </div>
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

