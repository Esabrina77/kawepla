'use client';

import Link from 'next/link';
import { 
  Home, 
  Calendar, 
  Heart, 
  Gift, 
  Camera, 
  Users, 
  Music,
  Sparkles,
  Star,
  Moon,
  ArrowLeft
} from 'lucide-react';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.notFoundContainer}>
      {/* Étoiles animées */}
      <div className={styles.starsContainer}>
        {/* Étoiles principales */}
        <div className={`${styles.star} ${styles.starLarge} ${styles.animateTwinkle}`} style={{ top: '5rem', left: '5rem' }}></div>
        <div className={`${styles.star} ${styles.starSmall} ${styles.animateTwinkleDelay}`} style={{ top: '8rem', right: '8rem' }}></div>
        <div className={`${styles.star} ${styles.starMedium} ${styles.animateTwinkleDelay2}`} style={{ top: '10rem', left: '50%' }}></div>
        <div className={`${styles.star} ${styles.starSmall} ${styles.animateTwinkle}`} style={{ top: '15rem', right: '5rem' }}></div>
        <div className={`${styles.star} ${styles.starLarge} ${styles.animateTwinkleDelay}`} style={{ top: '20rem', left: '10rem' }}></div>
        <div className={`${styles.star} ${styles.starSmall} ${styles.animateTwinkleDelay2}`} style={{ top: '24rem', right: '33%' }}></div>
        
        {/* Étoiles secondaires */}
        <div className={`${styles.star} ${styles.starSmall} ${styles.animateTwinkle}`} style={{ bottom: '10rem', left: '5rem' }}></div>
        <div className={`${styles.star} ${styles.starMedium} ${styles.animateTwinkleDelay}`} style={{ bottom: '15rem', right: '10rem' }}></div>
        <div className={`${styles.star} ${styles.starSmall} ${styles.animateTwinkleDelay2}`} style={{ bottom: '20rem', left: '33%' }}></div>
        <div className={`${styles.star} ${styles.starSmall} ${styles.animateTwinkle}`} style={{ bottom: '8rem', right: '5rem' }}></div>
        
        {/* Constellation */}
        <div className={`${styles.star} ${styles.starLarge} ${styles.animateTwinkle}`} style={{ top: '25%', left: '25%' }}></div>
        <div className={`${styles.star} ${styles.starLarge} ${styles.animateTwinkle}`} style={{ top: '25%', left: '25%' }}></div>
        <div className={`${styles.star} ${styles.starSmall} ${styles.animateTwinkleDelay}`} style={{ top: '33%', left: '33%' }}></div>
        <div className={`${styles.star} ${styles.starMedium} ${styles.animateTwinkleDelay2}`} style={{ top: '50%', left: '50%' }}></div>
      </div>

      {/* Planète décorative */}
      <div className={styles.planetContainer}>
        <div className={styles.planet}>
          <div className={`${styles.crater} ${styles.craterLarge}`}></div>
          <div className={`${styles.crater} ${styles.craterMedium}`}></div>
          <div className={`${styles.crater} ${styles.craterSmall}`}></div>
        </div>
          </div>

      <div className={styles.contentContainer}>
        {/* 404 Number avec style spatial */}
        <div className={styles.errorNumber}>
          <div className={styles.errorNumberMain}>404</div>
          <div className={styles.errorNumberGlow}>404</div>
        </div>
        
        {/* Contenu principal */}
        <div className={`${styles.mainContent} ${styles.animateFadeInUp}`}>
      
          
          <div className={styles.textContent}>
            <p className={`${styles.mainText} ${styles.animateSlideInRight}`}>
              Nous ne trouvons pas la page que vous cherchez
            </p>
            <p className={`${styles.secondaryText} ${styles.animateSlideInRightDelay}`}>
              Elle organise peut-être un événement avec Kawepla !
              </p>
            </div>
        </div>
        
        {/* Boutons d'action */}
        <div className={`${styles.actionContainer} ${styles.animateFadeInUpDelay}`}>
          <button 
            onClick={() => window.history.back()} 
            className={`${styles.actionButton} ${styles.secondaryButton}`}
          >
            <ArrowLeft className={styles.buttonIcon} />
            Retour
          </button>
          <Link href="/" className={styles.actionButton}>
            <Home className={styles.buttonIcon} />
            Retour à l'accueil
          </Link>
        </div>

        {/* Éléments flottants supplémentaires */}
        <div className={`${styles.floatingElement} ${styles.animateFloatSlow}`} style={{ top: '8rem', left: '3rem' }}>
          <Heart className={styles.floatingIcon} />
        </div>
        <div className={`${styles.floatingElementSmall} ${styles.animateFloatSlowDelay}`} style={{ top: '12rem', right: '5rem' }}>
          <Star className={styles.floatingIcon} />
        </div>
        <div className={`${styles.floatingElementSmall} ${styles.animateFloatSlowDelay2}`} style={{ bottom: '12rem', left: '6rem' }}>
          <Moon className={styles.floatingIcon} />
        </div>
        <div className={`${styles.floatingElement} ${styles.animateFloatSlow}`} style={{ bottom: '8rem', right: '4rem' }}>
          <Gift className={styles.floatingIcon} />
        </div>
        <div className={`${styles.floatingElementTiny} ${styles.animateFloatSlowDelay}`} style={{ top: '25%', left: '1rem' }}>
          <Camera className={styles.floatingIcon} />
        </div>
        <div className={`${styles.floatingElementTiny} ${styles.animateFloatSlowDelay2}`} style={{ top: '35%', right: '1rem' }}>
          <Sparkles className={styles.floatingIcon} />
        </div>
        <div className={`${styles.floatingElementTiny} ${styles.animateFloatSlowDelay}`} style={{ top: '65%', left: '1.5rem' }}>
          <Users className={styles.floatingIcon} />
        </div>
        <div className={`${styles.floatingElementTiny} ${styles.animateFloatSlowDelay2}`} style={{ top: '75%', right: '1.5rem' }}>
          <Music className={styles.floatingIcon} />
        </div>
        <div className={`${styles.floatingElementTiny} ${styles.animateFloatSlow}`} style={{ top: '15%', right: '8rem' }}>
          <Heart className={styles.floatingIcon} />
        </div>
      </div>
    </div>
  );
} 