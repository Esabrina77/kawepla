'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Minus,
    Plus,
    ChevronDown
} from 'lucide-react';
import styles from './ContextToolbar.module.css';

const ContextToolbar = () => {
    const { selectedObjects, canvas, saveHistory, setActiveSidebarTab } = useEditorStore();

    if (!selectedObjects || selectedObjects.length === 0) return null;

    const activeObject = selectedObjects[0];
    const isText = activeObject.type === 'textbox' || activeObject.type === 'text' || activeObject.type === 'i-text';

    if (!isText) return null;

    const updateProperty = (key: string, value: any) => {
        activeObject.set(key, value);
        canvas?.requestRenderAll();
        saveHistory();
    };

    const toggleProperty = (key: string, onValue: any, offValue: any) => {
        const currentValue = activeObject.get(key);
        updateProperty(key, currentValue === onValue ? offValue : onValue);
    };

    return (
        <div className={styles.contextToolbar}>
            <button
                className={styles.fontFamilyTrigger}
                onClick={() => setActiveSidebarTab('fonts')}
            >
                <span className={styles.fontName} style={{ fontFamily: activeObject.get('fontFamily') as string }}>
                    {activeObject.get('fontFamily') as string}
                </span>
                <ChevronDown size={14} />
            </button>

            <div className={styles.separator} />

            <div className={styles.fontSizeControl}>
                <button
                    className={styles.iconButton}
                    onClick={() => updateProperty('fontSize', (activeObject.get('fontSize') as number) - 1)}
                >
                    <Minus size={14} />
                </button>
                <input
                    type="number"
                    className={styles.fontSizeInput}
                    value={activeObject.get('fontSize')}
                    onChange={(e) => updateProperty('fontSize', parseInt(e.target.value))}
                />
                <button
                    className={styles.iconButton}
                    onClick={() => updateProperty('fontSize', (activeObject.get('fontSize') as number) + 1)}
                >
                    <Plus size={14} />
                </button>
            </div>

            <div className={styles.separator} />

            <div
                className={styles.colorTrigger}
                onClick={() => {
                    console.log('Color picker clicked');
                }}
            >
                <div
                    className={styles.colorIndicator}
                    style={{ backgroundColor: activeObject.get('fill') as string }}
                />
            </div>

            <div className={styles.separator} />

            <button
                className={`${styles.iconButton} ${activeObject.get('fontWeight') === 'bold' ? styles.active : ''}`}
                onClick={() => toggleProperty('fontWeight', 'bold', 'normal')}
            >
                <Bold size={18} />
            </button>
            <button
                className={`${styles.iconButton} ${activeObject.get('fontStyle') === 'italic' ? styles.active : ''}`}
                onClick={() => toggleProperty('fontStyle', 'italic', 'normal')}
            >
                <Italic size={18} />
            </button>
            <button
                className={`${styles.iconButton} ${activeObject.get('underline') ? styles.active : ''}`}
                onClick={() => toggleProperty('underline', true, false)}
            >
                <Underline size={18} />
            </button>

            <div className={styles.separator} />

            <button
                className={styles.iconButton}
                onClick={() => {
                    const align = activeObject.get('textAlign');
                    const next = align === 'left' ? 'center' : align === 'center' ? 'right' : 'left';
                    updateProperty('textAlign', next);
                }}
            >
                {activeObject.get('textAlign') === 'left' && <AlignLeft size={18} />}
                {activeObject.get('textAlign') === 'center' && <AlignCenter size={18} />}
                {activeObject.get('textAlign') === 'right' && <AlignRight size={18} />}
            </button>
        </div>
    );
};

export default ContextToolbar;

