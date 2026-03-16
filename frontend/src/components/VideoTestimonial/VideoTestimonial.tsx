'use client';

import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import styles from './VideoTestimonial.module.css';

interface VideoTestimonialProps {
  videoUrl: string;
  posterUrl: string;
  title: string;
  subtitle: string;
  duration: string;
  className?: string;
}

export const VideoTestimonial: React.FC<VideoTestimonialProps> = ({
  videoUrl,
  posterUrl,
  title,
  subtitle,
  duration,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className={`${styles.videoTestimonial} ${className}`}>
      <div 
        className={styles.videoContainer}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          src={videoUrl}
          poster={posterUrl}
          className={styles.video}
          muted={isMuted}
          loop
          playsInline
        />
        
        {/* Overlay avec informations */}
        <div className={styles.videoOverlay}>
          <div className={styles.videoInfo}>
            <h4 className={styles.videoTitle}>{title}</h4>
            <p className={styles.videoSubtitle}>{subtitle}</p>
            <span className={styles.videoDuration}>{duration}</span>
          </div>
        </div>

        {/* Contrôles vidéo */}
        <div className={`${styles.videoControls} ${showControls ? styles.show : ''}`}>
          <button 
            onClick={handlePlayPause}
            className={styles.controlButton}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>
          
          <button 
            onClick={handleMuteToggle}
            className={styles.controlButton}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Badge "Témoignage vidéo" */}
        <div className={styles.videoBadge}>
          <Play className="w-4 h-4" />
          Témoignage vidéo
        </div>
      </div>
    </div>
  );
};
