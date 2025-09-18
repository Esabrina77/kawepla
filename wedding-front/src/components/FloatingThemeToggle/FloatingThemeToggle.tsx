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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Limiter à la zone visible
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
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
