import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className
}) => {
  const cardClasses = [
    styles.card,
    styles[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const headerClasses = [
    styles.cardHeader,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={headerClasses}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const titleClasses = [
    styles.cardTitle,
    className
  ].filter(Boolean).join(' ');

  return (
    <h3 className={titleClasses}>
      {children}
    </h3>
  );
};

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const contentClasses = [
    styles.cardContent,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={contentClasses}>
      {children}
    </div>
  );
}; 