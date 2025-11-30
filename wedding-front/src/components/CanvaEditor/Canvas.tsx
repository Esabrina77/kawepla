'use client';

import React, { useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { useEditorStore } from '@/store/useEditorStore';
import styles from './Canvas.module.css';

interface CanvasProps {
    onCanvasReady?: (canvas: fabric.Canvas) => void;
}

const Canvas = ({ onCanvasReady }: CanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const {
        setCanvas,
        setSelectedObjects,
        backgroundColor,
        format,
        saveHistory,
        zoom,
        setZoom,
        drawingMode,
        gridEnabled
    } = useEditorStore();

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // Obtenir la couleur de fond depuis les variables CSS si backgroundColor n'est pas défini
        const getDefaultBackgroundColor = () => {
            if (backgroundColor) return backgroundColor;
            if (typeof window !== 'undefined') {
                const root = document.documentElement;
                const computedStyle = getComputedStyle(root);
                return computedStyle.getPropertyValue('--bg-primary').trim() || '#ffffff';
            }
            return '#ffffff';
        };

        // Initialize Fabric Canvas
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: format.width,
            height: format.height,
            backgroundColor: getDefaultBackgroundColor(),
            preserveObjectStacking: true,
            selection: true,
        });

        setCanvas(canvas);
        
        // Exposer le canvas au parent
        if (onCanvasReady) {
            onCanvasReady(canvas);
        }

        // Initial history save
        saveHistory();

        // Event Listeners
        const handleSelection = (e: any) => {
            setSelectedObjects(e.selected || []);
        };

        const handleModification = () => {
            saveHistory();
        };

        const handlePathCreated = (e: any) => {
            saveHistory();
        };

        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);
        canvas.on('selection:cleared', handleSelection);

        canvas.on('object:modified', handleModification);
        canvas.on('object:added', handleModification);
        canvas.on('object:removed', handleModification);
        canvas.on('path:created', handlePathCreated);

        // Responsive Scaling Logic
        const resizeCanvas = () => {
            if (!containerRef.current) return;

            const containerWidth = containerRef.current.clientWidth;
            const containerHeight = containerRef.current.clientHeight;

            // Add some padding
            const padding = 60;
            const availableWidth = containerWidth - padding;
            const availableHeight = containerHeight - padding;
            // Calculate scale to fit
            const scaleX = availableWidth / format.width;
            const scaleY = availableHeight / format.height;

            // Fit entire page within the container
            const fitScale = Math.min(scaleX, scaleY);

            setZoom(fitScale);
        };

        // Initial Resize
        resizeCanvas();

        // Window Resize Listener
        window.addEventListener('resize', resizeCanvas);

        return () => {
            canvas.dispose();
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [setCanvas, setSelectedObjects, format.width, format.height, onCanvasReady]); // Re-init if format changes

    // Update zoom and dimensions when zoom/format changes
    useEffect(() => {
        const canvas = useEditorStore.getState().canvas;
        if (canvas) {
            canvas.setZoom(zoom);
            canvas.setWidth(format.width * zoom);
            canvas.setHeight(format.height * zoom);
            canvas.requestRenderAll();
        }
    }, [zoom, format.width, format.height]);

    // Update background color when store changes or theme changes
    useEffect(() => {
        const canvas = useEditorStore.getState().canvas;
        if (canvas) {
            const getBackgroundColor = () => {
                if (backgroundColor) return backgroundColor;
                if (typeof window !== 'undefined') {
                    const root = document.documentElement;
                    const computedStyle = getComputedStyle(root);
                    return computedStyle.getPropertyValue('--bg-primary').trim() || '#ffffff';
                }
                return '#ffffff';
            };
            canvas.backgroundColor = getBackgroundColor();
            canvas.requestRenderAll();
        }
    }, [backgroundColor]);

    // Observer les changements de thème pour mettre à jour le background
    useEffect(() => {
        const canvas = useEditorStore.getState().canvas;
        if (!canvas) return;

        const updateBackground = () => {
            if (!backgroundColor && typeof window !== 'undefined') {
                const root = document.documentElement;
                const computedStyle = getComputedStyle(root);
                const bgColor = computedStyle.getPropertyValue('--bg-primary').trim() || '#ffffff';
                canvas.backgroundColor = bgColor;
                canvas.requestRenderAll();
            }
        };

        const themeObserver = new MutationObserver(updateBackground);
        if (typeof window !== 'undefined') {
            themeObserver.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-theme']
            });
        }

        return () => {
            themeObserver.disconnect();
        };
    }, [backgroundColor]);

    // Handle Drawing Mode
    useEffect(() => {
        const canvas = useEditorStore.getState().canvas;
        if (canvas) {
            canvas.isDrawingMode = drawingMode;
            if (drawingMode) {
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                canvas.freeDrawingBrush.width = 5;
                canvas.freeDrawingBrush.color = '#000000';
            }
        }
    }, [drawingMode]);

    // Handle Grid
    useEffect(() => {
        const canvas = useEditorStore.getState().canvas;
        if (!canvas) return;

        // Remove existing grid lines
        canvas.getObjects().forEach((obj) => {
            if ((obj as any).id === 'grid-line') {
                canvas.remove(obj);
            }
        });

        if (gridEnabled) {
            const gridSize = 50;
            const width = format.width;
            const height = format.height;

            // Vertical lines
            for (let i = 0; i < (width / gridSize); i++) {
                const line = new fabric.Line([i * gridSize, 0, i * gridSize, height], {
                    stroke: '#ccc',
                    selectable: false,
                    evented: false,
                    strokeWidth: 1,
                    excludeFromExport: true,
                });
                (line as any).id = 'grid-line';
                canvas.add(line);
                canvas.sendObjectToBack(line);
            }

            // Horizontal lines
            for (let i = 0; i < (height / gridSize); i++) {
                const line = new fabric.Line([0, i * gridSize, width, i * gridSize], {
                    stroke: '#ccc',
                    selectable: false,
                    evented: false,
                    strokeWidth: 1,
                    excludeFromExport: true,
                });
                (line as any).id = 'grid-line';
                canvas.add(line);
                canvas.sendObjectToBack(line);
            }
        }
        canvas.requestRenderAll();
    }, [gridEnabled, format.width, format.height]);

    return (
        <div ref={containerRef} className={styles.canvasContainer}>
            <div className={styles.canvasWrapper}>
                <canvas ref={canvasRef} />
            </div>

            {/* Zoom Indicator */}
            <div className={styles.zoomIndicator}>
                <span>{Math.round(zoom * 100)}%</span>
                <span className={styles.separator}>|</span>
                <span>{format.width} x {format.height}</span>
            </div>
        </div>
    );
};

export default Canvas;

