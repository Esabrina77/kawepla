'use client';

import { useState, useEffect } from 'react';
import { useProviderProfile } from '@/hooks/useProviderProfile';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { CreateProviderProfileDto } from '@/lib/api/providers';
import { 
  User, 
  MapPin, 
  Camera, 
  Save, 
  Upload,
  Plus,
  X,
  Star,
  Briefcase
} from 'lucide-react';
import styles from './profile.module.css';

export default function ProviderProfilePage() {
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
    portfolio: []
  });
  
  const [uploading, setUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
        portfolio: profile.portfolio || []
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
    <div className={styles.profileContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.badge}>
          <User style={{ width: '16px', height: '16px' }} />
          {profile ? 'Mon Profil' : 'Créer mon Profil'}
        </div>
        
        <h1 className={styles.title}>
          {profile ? 'Mon Profil Prestataire' : 'Créer votre profil prestataire'}
        </h1>
        
        <p className={styles.subtitle}>
          {profile 
            ? 'Gérez les informations de votre entreprise'
            : 'Complétez votre profil pour commencer à proposer vos services'
          }
        </p>
      </div>

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
    </div>
  );
}
