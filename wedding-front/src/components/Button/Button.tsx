'use client';

import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  className = '',
  fullWidth = false,
  title,
  type = 'button',
  disabled = false,
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    disabled ? styles.disabled : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={buttonClasses} 
      onClick={onClick}
      title={title}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}; 