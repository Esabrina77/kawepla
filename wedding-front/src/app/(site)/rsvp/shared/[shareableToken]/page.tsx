'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import DesignPreview from '@/components/DesignPreview';
import GuestProfilePhotoUpload from '@/components/GuestProfilePhotoUpload/GuestProfilePhotoUpload';
import PhotoModal from '@/components/PhotoModal/PhotoModal';
import PhoneInput from '@/components/PhoneInput/PhoneInput';
import { Heart, CheckCircle, XCircle, Users, Church, Wine, MessageCircle, RefreshCw, Shield, Camera } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import styles from './rsvp.module.css';

interface Invitation {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventTime?: string;
  location: string;
  eventType: string;
  customText?: string;
  moreInfo?: string;
  rsvpDetails?: string;
  rsvpForm?: string;
  rsvpDate?: string;
  photos?: any[];
  program?: any;
  restrictions?: string;
  status: string;
  designId: string;
  design: {
    id: string;
    name: string;
    template: any;
    styles: any;
    variables: any;
    components?: any;
    version?: string;
    fabricData?: any; // Add fabricData support
  };
  guests?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    rsvp?: {
      status: 'CONFIRMED' | 'DECLINED' | 'PENDING';
      message?: string;
      plusOne?: boolean;
      plusOneName?: string;
      dietaryRestrictions?: string;
      profilePhotoUrl?: string;
    };
  }>;
}

export default function SharedRSVPPage() {
  const params = useParams();
  const router = useRouter();
  const shareableToken = params.shareableToken as string;

  // Hook pour les notifications
  const { notifyRSVPConfirmed, notifyRSVPDeclined } = useNotifications();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [existingResponse, setExistingResponse] = useState<any>(null);
  const [checkingExistingResponse, setCheckingExistingResponse] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; alt: string } | null>(null);
  const [step, setStep] = useState(1);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  const [formData, setFormData] = useState({
    // Infos personnelles (NOUVEAU)
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // RSVP classique
    status: 'PENDING' as 'PENDING' | 'CONFIRMED' | 'DECLINED',
    message: '',
    profilePhotoUrl: '',
    plusOne: false,
    plusOneName: '',
    dietaryRestrictions: ''
  });

  useEffect(() => {
    loadInvitationData();
  }, [shareableToken]);

  useEffect(() => {
    if (invitation && invitation.design) {
      checkExistingResponse();
    }
  }, [invitation]);

  const loadInvitationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les détails de l'invitation avec le design via le token partageable
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013'}/api/rsvp/shared/${shareableToken}/invitation`);

      if (!response.ok) {
        throw new Error('Lien d\'invitation invalide ou expiré');
      }

      const invitationData = await response.json();
      setInvitation(invitationData);

      // Afficher la notice de sécurité une fois l'invitation chargée
      setShowSecurityModal(true);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Lien d\'invitation invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingResponse = async () => {
    try {
      setCheckingExistingResponse(true);

      // Vérifier si on a un téléphone dans localStorage
      const savedPhone = localStorage.getItem(`rsvp_phone_${shareableToken}`);

      if (savedPhone) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013'}/api/rsvp/shared/${shareableToken}/status?phone=${encodeURIComponent(savedPhone)}`);
        if (response.ok) {
          const statusData = await response.json();
          if (statusData.guest && statusData.rsvp) {
            setExistingResponse(statusData);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la réponse existante:', error);
    } finally {
      setCheckingExistingResponse(false);
    }
  };

  const handleNextStep = () => {
    // Validation simple pour l'étape 1
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        setError('Veuillez remplir tous les champs obligatoires (*)');
        return;
      }
      setError(null);
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Obliger le choix du status
    if (formData.status !== 'CONFIRMED' && formData.status !== 'DECLINED') {
      setError('Veuillez indiquer si vous serez présent(e) ou non.');
      return;
    }


    setSubmitting(true);
    setError(null);
    try {
      // Envoyer la réponse via l'API partageable
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013'}/api/rsvp/shared/${shareableToken}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'envoi de votre réponse');
      }

      const result = await response.json();

      // Déclencher les notifications pour les nouvelles réponses
      if (invitation && !existingResponse) {
        const guestName = `${formData.firstName} ${formData.lastName}`;
        const invitationName = invitation.eventTitle || 'votre événement';

        if (formData.status === 'CONFIRMED') {
          notifyRSVPConfirmed(guestName, invitationName);
        } else if (formData.status === 'DECLINED') {
          notifyRSVPDeclined(guestName, invitationName);
        }
      }

      // Stocker les données RSVP dans sessionStorage pour la page de remerciement
      sessionStorage.setItem('rsvpData', JSON.stringify(result));

      // Sauvegarder le téléphone dans localStorage pour un accès ultérieur
      if (formData.phone) {
        localStorage.setItem(`rsvp_phone_${shareableToken}`, formData.phone);
      }

      // Rediriger vers la page de remerciement
      router.push(`/rsvp/shared/${shareableToken}/merci`);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setError('Erreur lors de l\'envoi de votre réponse');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
    }));
  };

  const handlePhotoClick = (photoUrl: string, alt: string) => {
    setSelectedPhoto({ url: photoUrl, alt });
    setPhotoModalOpen(true);
  };

  const closePhotoModal = () => {
    setPhotoModalOpen(false);
    setSelectedPhoto(null);
  };

  const renderStepper = () => (
    <div className={styles.stepperContainer}>
      <div className={`${styles.step} ${step >= 1 ? styles.activeStep : ''}`}>
        <div className={styles.stepNumber}>1</div>
        <span className={styles.stepLabel}>Identité</span>
      </div>
      <div className={`${styles.stepLine} ${step >= 2 ? styles.activeLine : ''}`} />
      <div className={`${styles.step} ${step >= 2 ? styles.activeStep : ''}`}>
        <div className={styles.stepNumber}>2</div>
        <span className={styles.stepLabel}>Réponse</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={`card ${styles.loadingCard}`}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingIcon}>
              <Heart style={{ width: '24px', height: '24px' }} />
            </div>
            <p className={styles.loadingText}>Chargement de votre invitation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className={styles.container}>
        <div className={`card ${styles.errorCard}`}>
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>
              <XCircle style={{ width: '32px', height: '32px' }} />
            </div>
            <h1 className={`heading-2 ${styles.errorTitle}`}>Lien d'invitation invalide</h1>
            <p className={styles.errorText}>{error || "Ce lien d'invitation n'existe pas ou a expiré."}</p>
            <Button
              variant="primary"
              className="mt-6"
              onClick={() => window.location.reload()}
            >
              <RefreshCw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Rafraîchir
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.rsvpLayout}>

        {/* Colonne gauche : Invitation avec son design visuel */}
        <div className={styles.invitationColumn}>
          <div className={styles.invitationCard}>
            {invitation && invitation.design ? (
              <div className="invitation-container" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                <DesignPreview
                  design={invitation.design as any}
                  width={600}
                  height={850}
                />
              </div>
            ) : (
              // Version de fallback si le rendu échoue
              <div className={styles.fallbackInvitation}>
                <h1 className={styles.fallbackTitle}>
                  {invitation.eventTitle}
                </h1>

                <div>
                  <p className={styles.fallbackDate}>
                    {new Date(invitation.eventDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  {invitation.eventTime && (
                    <p className={styles.fallbackTime}>
                      à {invitation.eventTime}
                    </p>
                  )}
                  <p className={styles.fallbackLocation}>
                    à {invitation.location}
                  </p>
                </div>

                {invitation.customText && (
                  <div className={styles.fallbackCustomText}>
                    <p>{invitation.customText}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite : Formulaire RSVP étendu */}
        <div className={styles.formColumn}>
          <div className={`card ${styles.formCard}`}>
            {checkingExistingResponse ? (
              <div className={styles.checkingContent}>
                <div className={styles.checkingIcon}>
                  <Heart style={{ width: '24px', height: '24px' }} />
                </div>
                <p className={styles.checkingText}>Vérification de votre réponse...</p>
              </div>
            ) : existingResponse ? (
              // Afficher la réponse existante
              <div className={styles.responseStatus}>
                <h2 className={`heading-2 ${styles.responseTitle}`}>Votre réponse</h2>

                <div className={styles.guestWelcome}>
                  <div className={`${styles.statusIcon} ${existingResponse.rsvp.status === 'CONFIRMED' ? styles.statusConfirmed : styles.statusDeclined
                    }`}>
                    {existingResponse.rsvp.status === 'CONFIRMED' ? (
                      <CheckCircle style={{ width: '48px', height: '48px', color: 'white' }} />
                    ) : (
                      <XCircle style={{ width: '48px', height: '48px', color: 'white' }} />
                    )}
                  </div>

                  <h3 className={`heading-3 ${styles.guestName}`}>
                    {existingResponse.guest.firstName} {existingResponse.guest.lastName}
                  </h3>

                  {existingResponse.rsvp.profilePhotoUrl && (
                    <div className={styles.photoContainer}>
                      <img
                        src={existingResponse.rsvp.profilePhotoUrl}
                        alt={`Photo de ${existingResponse.guest.firstName} ${existingResponse.guest.lastName}`}
                        className={styles.guestPhoto}
                        onClick={() => handlePhotoClick(existingResponse.rsvp.profilePhotoUrl, `Photo de ${existingResponse.guest.firstName} ${existingResponse.guest.lastName}`)}
                      />
                    </div>
                  )}

                  <p className={`${styles.statusMessage} ${existingResponse.rsvp.status === 'CONFIRMED' ? styles.statusMessageConfirmed : styles.statusMessageDeclined
                    }`}>
                    {existingResponse.rsvp.status === 'CONFIRMED' ?
                      'Vous avez confirmé votre présence' :
                      'Vous avez décliné l\'invitation'
                    }
                  </p>

                  {existingResponse.rsvp.status === 'CONFIRMED' && (
                    <div className={`${styles.detailList} ${styles.confirmed}`}>
                      <div className={`${styles.detailItem} ${styles.confirmed}`}>
                        <Users />
                        <span>{existingResponse.rsvp.plusOne ? '2 personnes' : '1 personne'}</span>
                      </div>
                      {existingResponse.rsvp.plusOne && existingResponse.rsvp.plusOneName && (
                        <div className={`${styles.detailItem} ${styles.confirmed}`}>
                          <Users />
                          <span>Accompagnant: {existingResponse.rsvp.plusOneName}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {existingResponse.rsvp.message && (
                    <div className={styles.messageBox}>
                      <h4 className={styles.messageHeader}>
                        <MessageCircle />
                        Votre message:
                      </h4>
                      <p className={styles.messageContent}>"{existingResponse.rsvp.message}"</p>
                    </div>
                  )}
                </div>

                <div className={styles.responseDate}>
                  <p>Votre réponse a été enregistrée le {new Date(existingResponse.rsvp.respondedAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            ) : (
              // Afficher le formulaire
              <div className={styles.formContent}>
                <h2 className={`heading-2 ${styles.formTitle}`}>Confirmer votre présence</h2>

                {renderStepper()}

                <form onSubmit={handleSubmit} className={styles.form}>

                  {step === 1 && (
                    <div className={styles.stepContent}>
                      {/* Section informations personnelles */}
                      <div className={styles.formGroup}>
                        <h3 className={styles.sectionLabel}>Vos informations</h3>

                        <div className={styles.inputGrid}>
                          <div className={styles.formField}>
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              required
                              placeholder="Prénom *"
                              className={styles.textInput}
                            />
                          </div>
                          <div className={styles.formField}>
                            <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              required
                              placeholder="Nom *"
                              className={styles.textInput}
                            />
                          </div>
                        </div>

                        <div className={styles.inputGrid}>
                          <div className={styles.formField}>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Email (optionnel)"
                              className={styles.textInput}
                            />
                          </div>
                          <div className={styles.formField}>
                            <PhoneInput
                              value={formData.phone}
                              onChange={(value: string) => setFormData(prev => ({ ...prev, phone: value }))}
                              placeholder="Téléphone *"
                              name="phone"
                              required
                            />
                          </div>
                        </div>

                        {/* Section photo de profil */}
                        <div className={styles.formField}>
                          <GuestProfilePhotoUpload
                            currentPhotoUrl={formData.profilePhotoUrl || null}
                            onPhotoChange={(url) => setFormData(prev => ({ ...prev, profilePhotoUrl: url || '' }))}
                            disabled={submitting}
                          />
                        </div>
                      </div>

                      <div className={styles.formActions}>
                        <button
                          type="button"
                          className={`btn btn-primary ${styles.nextButton}`}
                          onClick={handleNextStep}
                        >
                          Suivant
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className={styles.stepContent}>
                      {/* Formulaire RSVP classique */}
                      <div className={styles.formGroup}>
                        <h3 className={styles.sectionLabel}>Votre réponse</h3>
                        <div className={styles.responseButtons}>
                          <button
                            type="button"
                            className={`${styles.responseButton} ${formData.status === 'CONFIRMED' ? styles.confirmed : styles.outline}`}
                            onClick={() => setFormData(prev => ({ ...prev, status: 'CONFIRMED' }))}
                          >
                            <CheckCircle style={{ width: '18px', height: '18px' }} />
                            Je serai présent(e)
                          </button>
                          <button
                            type="button"
                            className={`${styles.responseButton} ${formData.status === 'DECLINED' ? styles.declined : styles.outline}`}
                            onClick={() => setFormData(prev => ({ ...prev, status: 'DECLINED' }))}
                          >
                            <XCircle style={{ width: '18px', height: '18px' }} />
                            Je ne pourrai pas venir
                          </button>
                        </div>
                      </div>

                      {formData.status === 'CONFIRMED' && (
                        <>
                          {/* Section accompagnant */}
                          <div className={styles.formGroup}>
                            <label className={styles.plusOneLabel}>
                              <input
                                type="checkbox"
                                name="plusOne"
                                checked={formData.plusOne}
                                onChange={handleInputChange}
                                className={styles.checkbox}
                              />
                              <Users style={{ width: '16px', height: '16px' }} />
                              👥 Accompagnant autorisé
                            </label>

                            {formData.plusOne && (
                              <div className={styles.formField}>
                                <input
                                  type="text"
                                  name="plusOneName"
                                  value={formData.plusOneName}
                                  onChange={handleInputChange}
                                  placeholder="Nom de l'accompagnant"
                                  className={styles.textInput}
                                />
                              </div>
                            )}
                          </div>

                          {/* Section restrictions alimentaires */}
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                              🥗 Restrictions alimentaires
                            </label>
                            <textarea
                              name="dietaryRestrictions"
                              rows={3}
                              value={formData.dietaryRestrictions}
                              onChange={handleInputChange}
                              placeholder="Ex: Végétarien, allergies, sans gluten..."
                              className={`${styles.textarea} ${styles.dietaryTextarea}`}
                            />
                          </div>
                        </>
                      )}

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          Message pour l'organisateur
                        </label>
                        <textarea
                          name="message"
                          rows={4}
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Votre message pour l'organisateur..."
                          className={styles.textarea}
                        />
                      </div>

                      <div className={styles.formActions}>
                        <button
                          type="button"
                          className={`btn btn-outline ${styles.prevButton}`}
                          onClick={handlePrevStep}
                        >
                          Retour
                        </button>
                        <button
                          type="submit"
                          disabled={submitting || formData.status === 'PENDING'}
                          className={`btn btn-primary ${styles.submitButton}`}
                        >
                          {submitting ? 'Envoi en cours...' : 'Envoyer ma réponse'}
                        </button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className={styles.errorMessage}>
                      {error}
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal pour agrandir les photos */}
      {selectedPhoto && (
        <PhotoModal
          isOpen={photoModalOpen}
          onClose={closePhotoModal}
          photoUrl={selectedPhoto.url}
          alt={selectedPhoto.alt}
        />
      )}

      {/* Security Modal */}
      {showSecurityModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalIcon}>
              <Shield style={{ width: '32px', height: '32px' }} />
            </div>
            <h3 className={styles.modalTitle}>Lien personnel</h3>
            <p className={styles.modalText}>
              Ce lien d'invitation est strictement personnel. Merci de ne pas le partager avec d'autres personnes pour garantir la bonne organisation de l'événement.
            </p>
            <button
              className={styles.modalButton}
              onClick={() => setShowSecurityModal(false)}
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
}