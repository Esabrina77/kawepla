"use client";

import React, { useEffect, useRef, useCallback } from "react";
import * as fabric from "fabric";
import { useEditorStore } from "@/store/useEditorStore";
import { initAlignmentGuidelines } from "./utils/alignmentGuidelines";
import styles from "./Canvas.module.css";

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
    gridEnabled,
    loading: storeLoading,
  } = useEditorStore();

  // ─── Calcul du zoom fit-to-screen ─────────────────────────────────────────
  const computeFitZoom = useCallback(() => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const padding = 80;
    const scaleX = (cw - padding) / format.width;
    const scaleY = (ch - padding) / format.height;
    const fitScale = Math.min(scaleX, scaleY, 1); // jamais > 100 %
    setZoom(fitScale);
  }, [format.width, format.height, setZoom]);

  // ─── Création du canvas UNE SEULE FOIS ────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width:  format.width,
      height: format.height,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selection: true,
    });

    setCanvas(canvas);
    if (onCanvasReady) onCanvasReady(canvas);
    saveHistory();

    // Événements sélection
    const handleSelection = (e: any) => setSelectedObjects(e.selected || []);
    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", handleSelection);

    // Événements modification → historique
    const handleModification = () => saveHistory();
    canvas.on("object:modified", handleModification);
    canvas.on("object:added",    handleModification);
    canvas.on("object:removed",  handleModification);
    canvas.on("path:created",    handleModification);
    canvas.on("text:changed",    handleModification);

    // Guidelines d'alignement
    const cleanupGuidelines = initAlignmentGuidelines(canvas);

    // Supprimer avec la touche Delete
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const active = canvas.getActiveObject();
      if (!active || (active as any).isEditing) return;
      if (active.type === "activeSelection") {
        (active as any).forEachObject((obj: fabric.Object) => canvas.remove(obj));
        canvas.discardActiveObject();
      } else {
        canvas.remove(active);
      }
      canvas.requestRenderAll();
      saveHistory();
    };
    window.addEventListener("keydown", handleKeyDown);

    // Zoom initial et au resize
    const handleResize = () => computeFitZoom();
    window.addEventListener("resize", handleResize);
    computeFitZoom(); // premier calcul

    return () => {
      if (typeof cleanupGuidelines === "function") cleanupGuidelines();
      canvas.dispose();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize",  handleResize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← UNE SEULE FOIS (pas de dépendances format/zoom)

  // ─── Recalculer le zoom quand le FORMAT change ────────────────────────────
  useEffect(() => {
    computeFitZoom();
  }, [format.width, format.height, computeFitZoom]);

  // ─── Appliquer le zoom au canvas ──────────────────────────────────────────
  useEffect(() => {
    const canvas = useEditorStore.getState().canvas;
    if (!canvas) return;
    canvas.setZoom(zoom);
    canvas.setWidth(format.width   * zoom);
    canvas.setHeight(format.height * zoom);
    canvas.requestRenderAll();
  }, [zoom, format.width, format.height]);

  // ─── Couleur de fond ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = useEditorStore.getState().canvas;
    if (!canvas) return;
    canvas.backgroundColor = backgroundColor || "#ffffff";
    canvas.requestRenderAll();
  }, [backgroundColor]);

  // ─── Mode dessin ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = useEditorStore.getState().canvas;
    if (!canvas) return;
    canvas.isDrawingMode = drawingMode;
    if (drawingMode) {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = 5;
      canvas.freeDrawingBrush.color = "#000000";
    }
  }, [drawingMode]);

  // ─── Grille ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = useEditorStore.getState().canvas;
    if (!canvas) return;

    canvas.getObjects().forEach((obj) => {
      if ((obj as any).id === "grid-line") canvas.remove(obj);
    });

    if (gridEnabled) {
      const gridSize = 50;
      const { width, height } = format;
      const color = "rgba(0,0,0,0.05)";

      for (let i = 0; i <= width / gridSize; i++) {
        const l = new fabric.Line([i * gridSize, 0, i * gridSize, height], {
          stroke: color, selectable: false, evented: false, strokeWidth: 1,
          excludeFromExport: true,
        } as any);
        (l as any).id = "grid-line";
        canvas.add(l);
        canvas.sendObjectToBack(l);
      }
      for (let i = 0; i <= height / gridSize; i++) {
        const l = new fabric.Line([0, i * gridSize, width, i * gridSize], {
          stroke: color, selectable: false, evented: false, strokeWidth: 1,
          excludeFromExport: true,
        } as any);
        (l as any).id = "grid-line";
        canvas.add(l);
        canvas.sendObjectToBack(l);
      }
    }
    canvas.requestRenderAll();
  }, [gridEnabled, format.width, format.height]);

  return (
    <div ref={containerRef} className={styles.canvasContainer}>
      <div className={`${styles.canvasWrapper} ${storeLoading ? styles.hidden : ""}`}>
        <canvas ref={canvasRef} />
      </div>

      {storeLoading && (
        <div className={styles.canvasLoading}>
          <div className={styles.premiumSpinner}>
            <div className={styles.spinnerInner} />
          </div>
          <p>Initialisation de votre studio...</p>
        </div>
      )}

      <div className={styles.zoomIndicator}>
        <span>{Math.round(zoom * 100)}%</span>
        <span className={styles.separator}>|</span>
        <span>{format.width} × {format.height}</span>
      </div>
    </div>
  );
};

export default Canvas;
