'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import {
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    Underline,
    Trash2,
    Copy,
    Layers,
    Search,
    ChevronDown,
    Check,
    X
} from 'lucide-react';
import * as fabric from 'fabric';
import { GOOGLE_FONTS } from '@/utils/fonts';
import styles from './PropertiesPanel.module.css';

const PropertiesPanel = () => {
    const {
        selectedObjects,
        canvas,
        saveHistory,
        backgroundColor,
        setBackgroundColor,
        savedColors,
        addSavedColor,
        format
    } = useEditorStore();

    const [isFontPickerOpen, setIsFontPickerOpen] = useState(false);
    const [fontSearch, setFontSearch] = useState('');
    const fontPickerRef = useRef<HTMLDivElement>(null);

    const selectedObject = selectedObjects[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fontPickerRef.current && !fontPickerRef.current.contains(event.target as Node)) {
                setIsFontPickerOpen(false);
            }
        };

        if (isFontPickerOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFontPickerOpen]);

    const updateProperty = (key: string, value: any) => {
        if (!selectedObject || !canvas) return;
        selectedObject.set(key, value);
        canvas.requestRenderAll();
        saveHistory();
    };

    const handleDelete = () => {
        if (!selectedObject || !canvas) return;
        canvas.remove(selectedObject);
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        saveHistory();
    };

    const handleDuplicate = () => {
        if (!selectedObject || !canvas) return;
        selectedObject.clone().then((cloned: fabric.Object) => {
            canvas.discardActiveObject();
            cloned.set({
                left: selectedObject.left! + 20,
                top: selectedObject.top! + 20,
                evented: true,
            });
            if (cloned.type === 'activeSelection') {
                (cloned as any).canvas = canvas;
                (cloned as any).forEachObject((obj: any) => {
                    canvas.add(obj);
                });
                cloned.setCoords();
            } else {
                canvas.add(cloned);
            }
            canvas.setActiveObject(cloned);
            canvas.requestRenderAll();
            saveHistory();
        });
    };

    const handleBringForward = () => {
        if (!selectedObject || !canvas) return;
        canvas.bringObjectForward(selectedObject);
        canvas.requestRenderAll();
        saveHistory();
    };

    const handleSendBackward = () => {
        if (!selectedObject || !canvas) return;
        canvas.sendObjectBackwards(selectedObject);
        canvas.requestRenderAll();
        saveHistory();
    };

    const ColorInput = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
        const [localValue, setLocalValue] = useState(value);

        useEffect(() => {
            setLocalValue(value);
        }, [value]);

        const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newVal = e.target.value;
            setLocalValue(newVal);

            const cleanHex = newVal.replace(/[^0-9A-F]/gi, '');

            if (cleanHex.length === 3 || cleanHex.length === 6) {
                let fullHex = '#' + cleanHex;
                if (cleanHex.length === 3) {
                    fullHex = '#' + cleanHex.split('').map(c => c + c).join('');
                }
                onChange(fullHex);
                addSavedColor(fullHex);
            }
        };

        return (
            <div className={styles.colorPickerWrapper}>
                <div className={styles.colorPreviewWrapper}>
                    <div
                        className={styles.colorPreview}
                        style={{ backgroundColor: value }}
                    />
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => {
                            onChange(e.target.value);
                            addSavedColor(e.target.value);
                        }}
                        className={styles.colorInputHidden}
                    />
                </div>
                <input
                    type="text"
                    value={localValue}
                    onChange={handleTextChange}
                    className={styles.hexInput}
                    placeholder="#000000"
                    maxLength={7}
                />
            </div>
        );
    };

    if (!selectedObject) {
        return (
            <div className={styles.panel}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Page Settings</h2>
                </div>
                <div className={styles.content}>
                    <div className={styles.section}>
                        <label className={styles.label}>Background</label>
                        <div className={styles.row} style={{ marginBottom: 12 }}>
                            <button
                                className={styles.actionButton}
                                style={{ flex: 1, justifyContent: 'center', border: '1px solid #e2e8f0' }}
                                onClick={() => document.getElementById('bg-image-upload')?.click()}
                            >
                                Upload Image
                            </button>
                            <input
                                type="file"
                                id="bg-image-upload"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file && canvas) {
                                        const reader = new FileReader();
                                        reader.onload = (f) => {
                                            const data = f.target?.result as string;
                                            fabric.Image.fromURL(data).then((img) => {
                                                if (!format.width || !format.height) return;

                                                const scaleX = format.width / img.width!;
                                                const scaleY = format.height / img.height!;
                                                const scale = Math.max(scaleX, scaleY);

                                                img.scale(scale);
                                                img.set({
                                                    originX: 'center',
                                                    originY: 'center',
                                                    left: format.width / 2,
                                                    top: format.height / 2
                                                });

                                                canvas.backgroundImage = img;
                                                canvas.requestRenderAll();
                                                saveHistory();
                                            });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            {canvas?.backgroundImage && (
                                <button
                                    className={styles.actionButton}
                                    title="Remove Image"
                                    onClick={() => {
                                        if (canvas) {
                                            canvas.backgroundImage = undefined;
                                            canvas.backgroundColor = backgroundColor;
                                            canvas.requestRenderAll();
                                            saveHistory();
                                        }
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>

                        <label className={styles.subLabel}>Solid Color</label>
                        <ColorInput
                            value={backgroundColor}
                            onChange={(val) => {
                                setBackgroundColor(val);
                                if (canvas) {
                                    if (canvas.backgroundImage) {
                                        canvas.backgroundImage = undefined;
                                        canvas.requestRenderAll();
                                    }
                                    saveHistory();
                                }
                            }}
                        />
                        <div className={styles.savedColors}>
                            {savedColors.map((color) => (
                                <button
                                    key={color}
                                    className={styles.savedColorCircle}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setBackgroundColor(color)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const isText = selectedObject.type === 'textbox' || selectedObject.type === 'text' || selectedObject.type === 'i-text';
    const isImage = selectedObject.type === 'image';
    const isShape = !isText && !isImage;

    const filteredFonts = GOOGLE_FONTS.filter(font =>
        font.toLowerCase().includes(fontSearch.toLowerCase())
    );

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <h2 className={styles.title}>{selectedObject.type} Properties</h2>
                <div className={styles.actions}>
                    <button onClick={handleDuplicate} className={styles.actionButton} title="Duplicate">
                        <Copy size={16} />
                    </button>
                    <button onClick={handleDelete} className={`${styles.actionButton} ${styles.deleteButton}`} title="Delete">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.section}>
                    <label className={styles.label}>Layering</label>
                    <div className={styles.row}>
                        <button onClick={handleBringForward} className={styles.layerButton}>
                            <Layers size={14} /> Forward
                        </button>
                        <button onClick={handleSendBackward} className={styles.layerButton}>
                            <Layers size={14} /> Backward
                        </button>
                    </div>
                </div>

                <div className={styles.section}>
                    <label className={styles.label}>Opacity</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={selectedObject.opacity || 1}
                        onChange={(e) => updateProperty('opacity', parseFloat(e.target.value))}
                        className={styles.slider}
                    />
                </div>

                {isText && (
                    <>
                        <div className={styles.section}>
                            <label className={styles.label}>Text Color</label>
                            <ColorInput
                                value={selectedObject.get('fill') as string}
                                onChange={(val) => updateProperty('fill', val)}
                            />
                        </div>

                        <div className={styles.section}>
                            <div className={styles.row} style={{ marginBottom: 8, gap: 8 }}>
                                <div style={{ flex: 1 }}>
                                    <label className={styles.subLabel}>Spacing</label>
                                    <input
                                        type="number"
                                        value={selectedObject.get('charSpacing') || 0}
                                        onChange={(e) => updateProperty('charSpacing', parseInt(e.target.value))}
                                        className={styles.input}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className={styles.subLabel}>Line Height</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={selectedObject.get('lineHeight') || 1}
                                        onChange={(e) => updateProperty('lineHeight', parseFloat(e.target.value))}
                                        className={styles.input}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <label className={styles.label}>Saved Colors</label>
                            <div className={styles.savedColors}>
                                {savedColors.map((color) => (
                                    <button
                                        key={color}
                                        className={styles.savedColorCircle}
                                        style={{ backgroundColor: color }}
                                        onClick={() => updateProperty('fill', color)}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {isShape && (
                    <>
                        <div className={styles.section}>
                            <label className={styles.label}>Fill Color</label>
                            <ColorInput
                                value={selectedObject.get('fill') as string}
                                onChange={(val) => updateProperty('fill', val)}
                            />
                            <div className={styles.savedColors} style={{ marginTop: 8 }}>
                                {savedColors.map((color) => (
                                    <button
                                        key={color}
                                        className={styles.savedColorCircle}
                                        style={{ backgroundColor: color }}
                                        onClick={() => updateProperty('fill', color)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className={styles.section}>
                            <label className={styles.label}>Border</label>
                            <div className={styles.row}>
                                <div style={{ width: 120 }}>
                                    <ColorInput
                                        value={selectedObject.get('stroke') as string || '#000000'}
                                        onChange={(val) => updateProperty('stroke', val)}
                                    />
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    value={selectedObject.get('strokeWidth') || 0}
                                    onChange={(e) => updateProperty('strokeWidth', parseInt(e.target.value))}
                                    className={styles.input}
                                    placeholder="Width"
                                />
                            </div>
                        </div>
                        {selectedObject.type === 'rect' && (
                            <div className={styles.section}>
                                <label className={styles.label}>Corner Radius</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={selectedObject.get('rx') || 0}
                                    onChange={(e) => {
                                        updateProperty('rx', parseInt(e.target.value));
                                        updateProperty('ry', parseInt(e.target.value));
                                    }}
                                    className={styles.slider}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PropertiesPanel;

