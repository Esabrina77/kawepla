'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import styles from './FloatingThemeToggle.module.css';

interface ThemeToggleProps {
  className?: string;
  size?: number;
  variant?: 'floating' | 'inline';
}

export const FloatingThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 20,
  variant = 'inline',
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      className={`${styles.themeToggle} ${variant === 'floating' ? styles.floating : styles.inline} ${className}`}
      onClick={toggleTheme}
      title={`Basculer vers le mode ${isDark ? 'clair' : 'sombre'}`}
      aria-label={`Basculer vers le mode ${isDark ? 'clair' : 'sombre'}`}
    >
      {isDark ? (
        <Sun size={size} className={styles.icon} />
      ) : (
        <Moon size={size} className={styles.icon} />
      )}
    </button>
  );
};
