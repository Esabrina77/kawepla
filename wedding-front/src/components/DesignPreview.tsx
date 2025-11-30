'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { Design } from '@/types';
import { Palette } from 'lucide-react';
import styles from './DesignPreview.module.css';

interface DesignPreviewProps {
  design: Design;
  width?: number;
  height?: number;
  className?: string;
}

export default function DesignPreview({ design, width = 300, height = 400, className }: DesignPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstanceRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // S'assurer que le composant est monté avant d'initialiser le canvas
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    // Si on a une thumbnail ou previewImage, on l'affiche directement
    if (design.thumbnail || design.previewImage) {
      setLoading(false);
      return;
    }

    // Sinon, on charge le fabricData dans un canvas statique
    if (!design.fabricData) {
      setError('Aucune donnée de design disponible');
      setLoading(false);
      return;
    }

    // Nettoyer le canvas précédent s'il existe
    if (canvasInstanceRef.current) {
      try {
        // Vérifier que le canvas est toujours dans le DOM avant de le disposer
        const canvasElement = canvasInstanceRef.current.getElement();
        if (canvasElement && canvasElement.parentNode) {
          canvasInstanceRef.current.dispose();
        }
      } catch (err) {
        // Ignorer les erreurs si le canvas a déjà été supprimé
      }
      canvasInstanceRef.current = null;
    }

    // Vérifier que le canvasRef est toujours valide
    if (!canvasRef.current || !canvasRef.current.parentNode) {
      return;
    }

    setLoading(true);
    setError(null);

    // Déclarer themeObserver en dehors du try pour le cleanup
    let themeObserver: MutationObserver | null = null;

    try {
      // Obtenir la couleur de fond depuis les variables CSS
      const getBackgroundColor = () => {
        if (typeof window !== 'undefined') {
          const root = document.documentElement;
          const computedStyle = getComputedStyle(root);
          // Utiliser --bg-primary pour le fond du canvas
          return computedStyle.getPropertyValue('--bg-primary').trim() || '#ffffff';
        }
        return '#ffffff';
      };

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: design.canvasWidth || width,
        height: design.canvasHeight || height,
        backgroundColor: getBackgroundColor(),
        preserveObjectStacking: true,
        selection: false, // Désactiver la sélection pour l'aperçu
        interactive: false, // Désactiver l'interactivité
      });

      canvasInstanceRef.current = canvas;

      // Mettre à jour le background si le thème change
      const updateBackground = () => {
        if (canvasInstanceRef.current) {
          const root = document.documentElement;
          const computedStyle = getComputedStyle(root);
          const bgColor = computedStyle.getPropertyValue('--bg-primary').trim() || '#ffffff';
          canvasInstanceRef.current.backgroundColor = bgColor;
          canvasInstanceRef.current.requestRenderAll();
        }
      };

      // Observer les changements de thème
      themeObserver = new MutationObserver(updateBackground);
      if (typeof window !== 'undefined') {
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme']
        });
      }

      // Charger le JSON Fabric.js
      canvas.loadFromJSON(design.fabricData)
        .then(() => {
          if (!canvasInstanceRef.current || !mounted) return;
          // Ajuster la taille du canvas pour l'aperçu
          const scale = Math.min(
            width / (design.canvasWidth || width),
            height / (design.canvasHeight || height)
          );
          canvasInstanceRef.current.setZoom(scale);
          canvasInstanceRef.current.renderAll();
          setLoading(false);
        })
        .catch((error: any) => {
          if (!mounted) return;
          console.error('Erreur lors du chargement du design:', error);
          setError('Erreur lors du chargement du design');
          setLoading(false);
        });
    } catch (err) {
      if (!mounted) return;
      console.error('Erreur lors de l\'initialisation du canvas:', err);
      setError('Erreur lors de l\'initialisation');
      setLoading(false);
    }

    // Cleanup: disposer le canvas quand le composant se démonte ou change
    return () => {
      if (themeObserver) {
        themeObserver.disconnect();
      }
      if (canvasInstanceRef.current) {
        try {
          const canvasElement = canvasInstanceRef.current.getElement();
          // Vérifier que l'élément existe et est toujours dans le DOM
          if (canvasElement && canvasElement.parentNode) {
            canvasInstanceRef.current.dispose();
          }
        } catch (err) {
          // Ignorer les erreurs de disposal
        }
        canvasInstanceRef.current = null;
      }
    };
  }, [mounted, design.id, design.fabricData, design.canvasWidth, design.canvasHeight, width, height]);

  // Si on a une thumbnail ou previewImage, l'afficher directement
  if (design.thumbnail || design.previewImage) {
    return (
      <img
        src={design.thumbnail || design.previewImage}
        alt={design.name}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: '8px',
          display: 'block'
        }}
      />
    );
  }

  // Si erreur ou pas de fabricData
  if (error || !design.fabricData) {
    return (
      <div className={`${styles.previewPlaceholder} ${className || ''}`}>
        <Palette size={48} />
        <h3>{design.name}</h3>
        <p>{error || 'Aperçu non disponible'}</p>
        {design.editorVersion === 'legacy' && (
          <p style={{ fontSize: '0.7rem', color: '#666' }}>
            Design legacy (ancien format)
          </p>
        )}
      </div>
    );
  }

  // Afficher le canvas Fabric.js
  return (
    <div ref={containerRef} className={`${styles.previewContainer} ${className || ''}`}>
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Chargement...</p>
        </div>
      )}
      {mounted && (
        <canvas
          key={`canvas-${design.id}`}
          ref={canvasRef}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      )}
    </div>
  );
}

