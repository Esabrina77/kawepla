import styles from './photos.module.css';
import Image from 'next/image';

export default function PhotosPage() {
  return (
    <div className={styles.photosContainer}>
      <div className={styles.header}>
        <h1>
          <Image
            src="/icons/photos.svg"
            alt=""
            width={32}
            height={32}
          />
          Photos
        </h1>
        <button className="primaryButton">
          + Ajouter des photos
        </button>
      </div>

      <div className={styles.albumsSection}>
        <h2>Albums</h2>
        <div className={styles.albumsGrid}>
          <div className={styles.albumCard}>
            <div className={styles.albumCover}>
              <Image
                src="/images/testimonials/julie-nicolas.jpg"
                alt="Séance d'engagement"
                width={300}
                height={200}
              />
              <div className={styles.albumInfo}>
                <h3>Séance d'engagement</h3>
                <span>24 photos</span>
              </div>
            </div>
          </div>

          <div className={styles.albumCard}>
            <div className={styles.albumCover}>
              <Image
                src="/images/testimonials/emma-lucas.jpg"
                alt="Préparatifs"
                width={300}
                height={200}
              />
              <div className={styles.albumInfo}>
                <h3>Préparatifs</h3>
                <span>12 photos</span>
              </div>
            </div>
          </div>

          <div className={styles.newAlbumCard}>
            <div className={styles.newAlbumContent}>
              <span className={styles.plusIcon}>+</span>
              <p>Créer un nouvel album</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.recentSection}>
        <h2>Photos récentes</h2>
        <div className={styles.photosGrid}>
          {[...Array(6)].map((_, index) => (
            <div key={index} className={styles.photoCard}>
              <Image
                src={`/images/testimonials/${
                  index % 2 === 0 ? 'julie-nicolas.jpg' : 'emma-lucas.jpg'
                }`}
                alt={`Photo ${index + 1}`}
                width={300}
                height={200}
              />
              <div className={styles.photoOverlay}>
                <div className={styles.photoActions}>
                  <button className="iconButton">
                    <span>❤️</span>
                  </button>
                  <button className="iconButton">
                    <span>🗑️</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.uploadSection}>
        <div className={styles.uploadCard}>
          <div className={styles.uploadContent}>
            <Image
              src="/icons/photos.svg"
              alt=""
              width={48}
              height={48}
            />
            <h3>Glissez-déposez vos photos ici</h3>
            <p>ou</p>
            <button className="secondaryButton">Parcourir les fichiers</button>
            <p className={styles.uploadInfo}>
              JPG, PNG • Max 10MB • Max 20 photos à la fois
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 