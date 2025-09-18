'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import styles from './CountdownTimer.module.css';

interface CountdownTimerProps {
  endDate: Date;
  onComplete?: () => void;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endDate,
  onComplete,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        onComplete?.();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate, onComplete]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className={`${styles.countdownTimer} ${className}`}>
      <div className={styles.timerIcon}>
        <Clock className="w-5 h-5" />
      </div>
      
      <div className={styles.timerContent}>
        <div className={styles.timerLabel}>Offre limitée se termine dans</div>
        
        <div className={styles.timerDigits}>
          <div className={styles.timeUnit}>
            <span className={styles.number}>{formatNumber(timeLeft.days)}</span>
            <span className={styles.label}>Jours</span>
          </div>
          
          <div className={styles.separator}>:</div>
          
          <div className={styles.timeUnit}>
            <span className={styles.number}>{formatNumber(timeLeft.hours)}</span>
            <span className={styles.label}>Heures</span>
          </div>
          
          <div className={styles.separator}>:</div>
          
          <div className={styles.timeUnit}>
            <span className={styles.number}>{formatNumber(timeLeft.minutes)}</span>
            <span className={styles.label}>Min</span>
          </div>
          
          <div className={styles.separator}>:</div>
          
          <div className={styles.timeUnit}>
            <span className={styles.number}>{formatNumber(timeLeft.seconds)}</span>
            <span className={styles.label}>Sec</span>
          </div>
        </div>
      </div>
    </div>
  );
};
