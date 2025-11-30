'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProviderProfile } from '@/hooks/useProviderProfile';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { CreateProviderProfileDto } from '@/lib/api/providers';
import { HeaderMobile } from '@/components/HeaderMobile/HeaderMobile';
import { ConfirmModal } from '@/components/ui/modal';
import { usersApi } from '@/lib/api/users';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  MapPin, 
  Camera, 
  Save, 
  Plus,
  X,
  Star,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { WebsiteIcon, InstagramIcon, TikTokIcon, FacebookIcon } from '@/components/icons/SocialIcons';
import styles from './profile.module.css';

export default function ProviderProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { profile, loading, error, createProfile, updateProfile } = useProviderProfile();
  const { categories } = useServiceCategories();
  
  const [formData, setFormData] = useState<CreateProviderProfileDto>({
    businessName: '',
    description: '',
    categoryId: '',
    latitude: 0,
    longitude: 0,
    displayCity: '',
    phone: '',
    profilePhoto: '',
    portfolio: [],
    website: '',
    instagram: '',
    tiktok: '',
    facebook: ''
  });
  
  const [uploading, setUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        businessName: profile.businessName,
        description: profile.description || '',
        categoryId: profile.categoryId,
        latitude: profile.latitude || 0,
        longitude: profile.longitude || 0,
        displayCity: profile.displayCity,
        phone: profile.phone || '',
        profilePhoto: profile.profilePhoto || '',
        portfolio: profile.portfolio || [],
        website: profile.website || '',
        instagram: profile.instagram || '',
        tiktok: profile.tiktok || '',
        facebook: profile.facebook || ''
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (file: File, type: 'profile' | 'portfolio') => {
    if (!file) return;
    
    // Validation
    if (file.size > 5 * 1024 * 1024) { // 5MB
      setErrorMessage('La photo ne doit pas dépasser 5MB');
      setShowErrorModal(true);
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Veuillez sélectionner une image valide');
      setShowErrorModal(true);
      return;
    }

    setUploading(true);
    try {
      const { uploadToFirebase } = await import('@/lib/firebase');
      const timestamp = Date.now();
      const fileName = `provider-${type}-${timestamp}-${file.name}`;
      const firebaseUrl = await uploadToFirebase(file, fileName, type === 'profile' ? 'provider-profile' : 'provider-portfolio');
      
      if (type === 'profile') {
        setFormData(prev => ({ ...prev, profilePhoto: firebaseUrl }));
      } else {
        setFormData(prev => ({ ...prev, portfolio: [...(prev.portfolio || []), firebaseUrl] }));
      }
    } catch (error) {
      console.error('Erreur upload Firebase:', error);
      setErrorMessage('Erreur lors de l\'upload de la photo');
      setShowErrorModal(true);
    } finally {
      setUploading(false);
    }
  };

  const removePortfolioImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      portfolio: (prev.portfolio || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.businessName || !formData.categoryId || !formData.displayCity) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires');
      setShowErrorModal(true);
      return;
    }

    // Vérifier qu'au moins un réseau social est fourni
    const hasSocialNetwork = !!(formData.website?.trim() || formData.instagram?.trim() || formData.tiktok?.trim() || formData.facebook?.trim());
    if (!hasSocialNetwork) {
      setErrorMessage('Veuillez fournir au moins un lien de réseau social (site web, Instagram, TikTok ou Facebook)');
      setShowErrorModal(true);
      return;
    }

    try {
      if (profile) {
        await updateProfile(formData);
      } else {
        await createProfile(formData);
      }
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrorMessage('Erreur lors de la sauvegarde du profil');
      setShowErrorModal(true);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Catégorie inconnue';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <HeaderMobile title={profile ? 'Mon profil' : 'Créer mon profil'} />

      <main className={styles.main}>
        {/* Page Title */}
        <h1 className={styles.pageTitle}>
          {profile ? 'Mon profil prestataire' : 'Créer votre profil prestataire'}
        </h1>

        <form onSubmit={handleSubmit} className={styles.profileForm}>
        <div className={styles.formGrid}>
          {/* Informations de base */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Informations de base</h2>
            
            <div className={styles.formField}>
              <label className={styles.formLabel}>Nom de l'entreprise *</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="Ex: Studio Photo Marie"
                required
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Catégorie *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className={styles.formSelect}
                required
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Ville *</label>
              <input
                type="text"
                name="displayCity"
                value={formData.displayCity}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="Ex: Paris, Lyon, Marseille"
                required
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Téléphone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="Ex: +33 1 23 45 67 89"
                required
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={styles.formTextarea}
                placeholder="Décrivez votre entreprise, vos spécialités, votre expérience..."
                rows={4}
              />
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Réseaux sociaux *</h2>
            <p className={styles.sectionDescription}>
              Veuillez fournir au moins un lien (site web, Instagram, TikTok ou Facebook)
            </p>
            
            <div className={styles.formField}>
              <label className={styles.formLabel}>
                <WebsiteIcon size={16} />
                Site web personnel
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="https://www.votre-site.com"
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>
                <InstagramIcon size={16} />
                Instagram
              </label>
              <input
                type="url"
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="https://www.instagram.com/votre-compte"
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>
                <TikTokIcon size={16} />
                TikTok
              </label>
              <input
                type="url"
                name="tiktok"
                value={formData.tiktok}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="https://www.tiktok.com/@votre-compte"
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>
                <FacebookIcon size={16} />
                Facebook
              </label>
              <input
                type="url"
                name="facebook"
                value={formData.facebook}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="https://www.facebook.com/votre-page"
              />
            </div>
          </div>

          {/* Photos */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Photos</h2>
            
            {/* Photo de profil */}
            <div className={styles.formField}>
              <label className={styles.formLabel}>Photo de profil</label>
              <div className={styles.photoUpload}>
                {formData.profilePhoto ? (
                  <div className={styles.photoPreview}>
                    <img src={formData.profilePhoto} alt="Photo de profil" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, profilePhoto: '' }))}
                      className={styles.removePhotoButton}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.photoPlaceholder}>
                    <Camera size={32} />
                    <span>Ajouter une photo de profil</span>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(file, 'profile');
                  }}
                  className={styles.fileInput}
                  disabled={uploading}
                />
              </div>
            </div>

            {/* Portfolio */}
            <div className={styles.formField}>
              <label className={styles.formLabel}>Portfolio (max 10 photos)</label>
              <div className={styles.portfolioGrid}>
                {(formData.portfolio || []).map((photo, index) => (
                  <div key={index} className={styles.portfolioItem}>
                    <img src={photo} alt={`Portfolio ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removePortfolioImage(index)}
                      className={styles.removePortfolioButton}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                
                {(formData.portfolio || []).length < 10 && (
                  <div className={styles.addPortfolioItem}>
                    <Plus size={24} />
                    <span>Ajouter une photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(file, 'portfolio');
                      }}
                      className={styles.fileInput}
                      disabled={uploading}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.formActions}>
          <button 
            type="submit" 
            className={styles.saveButton}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <div className={styles.loadingSpinner}></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save size={20} />
                {profile ? 'Mettre à jour' : 'Créer le profil'}
              </>
            )}
          </button>
        </div>
        </form>

        {/* Danger Zone */}
        <div className={styles.dangerZone}>
          <div className={styles.dangerZoneHeader}>
            <AlertTriangle className={styles.dangerIcon} size={20} />
            <h3 className={styles.dangerZoneTitle}>Zone de danger</h3>
          </div>
          <p className={styles.dangerZoneDescription}>
            La suppression de votre compte est définitive et irréversible. Toutes vos données, y compris votre profil provider, vos services et vos réservations, seront supprimés.
          </p>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className={styles.deleteAccountButton}
            disabled={isDeleting}
          >
            <Trash2 size={18} />
            {isDeleting ? 'Suppression...' : 'Supprimer mon compte'}
          </button>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className={styles.modal} onClick={() => setShowSuccessModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <Star className={styles.successIcon} />
              <h3>Profil sauvegardé avec succès !</h3>
            </div>
            <p>Votre profil provider a été {profile ? 'mis à jour' : 'créé'} avec succès.</p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className={styles.modalButton}
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className={styles.modal} onClick={() => setShowErrorModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <X className={styles.errorIcon} />
              <h3>Erreur</h3>
            </div>
            <p>{errorMessage}</p>
            <button 
              onClick={() => setShowErrorModal(false)}
              className={styles.modalButton}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            await usersApi.deleteAccount();
            logout();
            router.push('/auth/login');
          } catch (error) {
            console.error('Erreur lors de la suppression du compte:', error);
            setErrorMessage('Erreur lors de la suppression du compte. Veuillez réessayer.');
            setShowErrorModal(true);
            setIsDeleting(false);
            setShowDeleteModal(false);
          }
        }}
        title="Supprimer mon compte"
        message="Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données (profil provider, services, réservations) seront définitivement supprimées."
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        isLoading={isDeleting}
      />
    </div>
  );
}
