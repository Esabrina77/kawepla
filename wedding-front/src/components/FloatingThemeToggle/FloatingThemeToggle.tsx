'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import styles from './FloatingThemeToggle.module.css';

interface Position {
  x: number;
  y: number;
}

export const FloatingThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const iconRef = useRef<HTMLDivElement>(null);

  // Récupérer la position sauvegardée
  useEffect(() => {
    const savedPosition = localStorage.getItem('floatingIconPosition');
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
  }, []);

  // Sauvegarder la position
  useEffect(() => {
    localStorage.setItem('floatingIconPosition', JSON.stringify(position));
  }, [position]);

  const handleStart = (clientX: number, clientY: number) => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (isDragging && iconRef.current) {
      const newX = clientX - dragOffset.x;
      const newY = clientY - dragOffset.y;
      
      // Obtenir la taille réelle du bouton
      const iconRect = iconRef.current.getBoundingClientRect();
      const iconSize = Math.max(iconRect.width, iconRect.height);
      
      // Limiter à la zone visible avec la taille réelle du bouton
      const maxX = window.innerWidth - iconSize;
      const maxY = window.innerHeight - iconSize;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={iconRef}
      className={`${styles.floatingIcon} ${isDark ? styles.darkMode : styles.lightMode}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={(e) => {
        if (!isDragging) {
          e.preventDefault();
          toggleTheme();
        }
      }}
      title={`Basculer vers le mode ${isDark ? 'clair' : 'sombre'}`}
    >
      {isDark ? (
        <Sun size={24} className={styles.icon} />
      ) : (
        <Moon size={24} className={styles.icon} />
      )}
    </div>
  );
};
