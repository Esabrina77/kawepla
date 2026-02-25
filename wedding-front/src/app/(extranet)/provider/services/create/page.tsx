'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProviderServices } from '@/hooks/useProviderServices';
import { CreateServiceDto } from '@/lib/api/providers';
import { HeaderMobile } from '@/components/HeaderMobile/HeaderMobile';
import {
  Plus,
  Save,
  Upload,
  X,
  Euro,
  Clock,
  Users,
  Camera,
  Sparkles,
} from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import styles from './create.module.css';

export default function CreateServicePage() {
  const router = useRouter();
  const { createService } = useProviderServices();
  const { improveDescription, loading: aiLoading } = useAI();

  const [formData, setFormData] = useState<CreateServiceDto>({
    name: '',
    description: '',
    price: 0,
    priceType: 'FIXED',
    duration: undefined,
    capacity: undefined,
    inclusions: [],
    requirements: [],
    photos: []
  });

  const [uploading, setUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [newInclusion, setNewInclusion] = useState('');
  const [newRequirement, setNewRequirement] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'duration' || name === 'capacity'
        ? (value ? Number(value) : undefined)
        : value
    }));
  };

  const handlePhotoUpload = async (file: File) => {
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

    if ((formData.photos || []).length >= 10) {
      setErrorMessage('Maximum 10 photos par service');
      setShowErrorModal(true);
      return;
    }

    setUploading(true);
    try {
      const { uploadToFirebase } = await import('@/lib/firebase');
      const timestamp = Date.now();
      const fileName = `service-photo-${timestamp}-${file.name}`;
      const firebaseUrl = await uploadToFirebase(file, fileName, 'provider-services');

      setFormData(prev => ({ ...prev, photos: [...(prev.photos || []), firebaseUrl] }));
    } catch (error) {
      console.error('Erreur upload Firebase:', error);
      setErrorMessage('Erreur lors de l\'upload de la photo');
      setShowErrorModal(true);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== index)
    }));
  };


  const addInclusion = () => {
    if (newInclusion.trim()) {
      setFormData(prev => ({
        ...prev,
        inclusions: [...(prev.inclusions || []), newInclusion.trim()]
      }));
      setNewInclusion('');
    }
  };

  const removeInclusion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      inclusions: (prev.inclusions || []).filter((_, i) => i !== index)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...(prev.requirements || []), newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: (prev.requirements || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || formData.price <= 0) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires');
      setShowErrorModal(true);
      return;
    }

    try {
      await createService(formData);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      setErrorMessage('Erreur lors de la création du service');
      setShowErrorModal(true);
    }
  };

  const handleSuccess = () => {
    setShowSuccessModal(false);
    router.push('/provider/services');
  };

  return (
    <div className={styles.createContainer}>
      <HeaderMobile title="Créer un service" />

      <div className={styles.pageContent}>
        {/* Page Title */}
        <h1 className={styles.pageTitle}>Créer un nouveau service</h1>

        <form onSubmit={handleSubmit} className={styles.createForm}>
          <div className={styles.formGrid}>
            {/* Informations de base */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Informations de base</h2>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Nom du service *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="Ex: Séance photo mariage"
                  required
                />
              </div>

              <div className={styles.formField}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className={styles.formLabel}>Description *</label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!formData.description) return;
                      try {
                        const result = await improveDescription({
                          currentDescription: formData.description,
                          serviceName: formData.name || 'Service',
                          price: formData.price || undefined
                        });
                        setFormData(prev => ({ ...prev, description: result.improvedDescription }));
                      } catch (err) {
                        setErrorMessage(err instanceof Error ? err.message : 'Erreur lors de l\'amélioration');
                        setShowErrorModal(true);
                      }
                    }}
                    disabled={aiLoading || !formData.description}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: aiLoading || !formData.description ? 'not-allowed' : 'pointer',
                      opacity: aiLoading || !formData.description ? 0.5 : 1,
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    <Sparkles size={14} />
                    {aiLoading ? 'Amélioration...' : 'Améliorer avec l\'IA'}
                  </button>
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  placeholder="Décrivez votre service en détail..."
                  rows={4}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Prix *</label>
                  <div className={styles.priceInput}>
                    <Euro size={16} />
                    <input
                      type="number"
                      name="price"
                      value={formData.price || ''}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Type de tarif *</label>
                  <select
                    name="priceType"
                    value={formData.priceType}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                    required
                  >
                    <option value="FIXED">Prix fixe</option>
                    <option value="PER_PERSON">Par personne</option>
                    <option value="PER_HOUR">Par heure</option>
                    <option value="CUSTOM">Sur devis</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Durée (minutes)</label>
                  <div className={styles.durationInput}>
                    <Clock size={16} />
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration || ''}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      placeholder="Ex: 120"
                      min="0"
                    />
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Capacité (personnes)</label>
                  <div className={styles.capacityInput}>
                    <Users size={16} />
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity || ''}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      placeholder="Ex: 50"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Détails du service */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Détails du service</h2>

              {/* Inclusions */}
              <div className={styles.formField}>
                <label className={styles.formLabel}>Inclusions</label>
                <div className={styles.listInput}>
                  <div className={styles.listItems}>
                    {(formData.inclusions || []).map((inclusion, index) => (
                      <div key={index} className={styles.listItem}>
                        <span>{inclusion}</span>
                        <button
                          type="button"
                          onClick={() => removeInclusion(index)}
                          className={styles.removeItemButton}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className={styles.addItemInput}>
                    <input
                      type="text"
                      value={newInclusion}
                      onChange={(e) => setNewInclusion(e.target.value)}
                      placeholder="Ajouter une inclusion..."
                      className={styles.formInput}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInclusion())}
                    />
                    <button
                      type="button"
                      onClick={addInclusion}
                      className={styles.addItemButton}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className={styles.formField}>
                <label className={styles.formLabel}>Prérequis</label>
                <div className={styles.listInput}>
                  <div className={styles.listItems}>
                    {(formData.requirements || []).map((requirement, index) => (
                      <div key={index} className={styles.listItem}>
                        <span>{requirement}</span>
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className={styles.removeItemButton}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className={styles.addItemInput}>
                    <input
                      type="text"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="Ajouter un prérequis..."
                      className={styles.formInput}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    />
                    <button
                      type="button"
                      onClick={addRequirement}
                      className={styles.addItemButton}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div className={styles.formField}>
                <label className={styles.formLabel}>Photos (max 10)</label>
                <div className={styles.photosGrid}>
                  {(formData.photos || []).map((photo, index) => (
                    <div key={index} className={styles.photoItem}>
                      <img src={photo} alt={`Service ${index + 1}`} />
                      <div className={styles.photoActions}>

                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className={styles.removePhotoButton}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {(formData.photos || []).length < 10 && (
                    <div className={styles.addPhotoItem}>
                      <Camera size={24} />
                      <span>Ajouter une photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(file);
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
              type="button"
              onClick={() => router.push('/provider/services')}
              className={styles.cancelButton}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className={styles.loadingSpinner}></div>
                  Création...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Créer le service
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className={styles.modal} onClick={handleSuccess}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <Plus className={styles.successIcon} />
              <h3>Service créé avec succès !</h3>
            </div>
            <p>Votre nouveau service a été créé et est maintenant disponible.</p>
            <button
              onClick={handleSuccess}
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
