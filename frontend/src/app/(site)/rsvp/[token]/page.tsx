'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { rsvpApi, type RSVPStatus as ApiRSVPStatus } from '@/lib/api/rsvp';
import DesignPreview from '@/components/DesignPreview';
import { Heart, HelpCircle, CheckCircle, XCircle, Camera, Users, Wine, MessageCircle, Shield } from 'lucide-react';
import GuestProfilePhotoUpload from '@/components/GuestProfilePhotoUpload/GuestProfilePhotoUpload';
import PhoneInput from '@/components/PhoneInput/PhoneInput';
import { useNotifications } from '@/hooks/useNotifications';
import { Invitation } from '@/types';
import styles from './rsvp.module.css';

// Interface locale pour l'invitation avec design (pour le rendu)
interface InvitationWithDesign extends Invitation {
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
}

// Utiliser le type RSVPStatus de l'API
type RSVPStatus = ApiRSVPStatus;

export default function RSVPPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  // Hook pour les notifications
  const { notifyRSVPConfirmed, notifyRSVPDeclined } = useNotifications();

  const [invitation, setInvitation] = useState<InvitationWithDesign | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'PENDING' as 'PENDING' | 'CONFIRMED' | 'DECLINED',
    message: '',
    profilePhotoUrl: '',
    plusOne: false,
    plusOneName: '',
    dietaryRestrictions: ''
  });
  const [showExistingResponse, setShowExistingResponse] = useState(false);

  const [showSecurityModal, setShowSecurityModal] = useState(false);

  useEffect(() => {
    loadInvitationData();
  }, [token]);

  const loadInvitationData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Charger les détails de l'invitation avec le design
      const response = await rsvpApi.getInvitation(token);
      setInvitation(response.invitation);

      // Afficher la notice de sécurité une fois l'invitation chargée
      setShowSecurityModal(true);

      // Pré-remplir les infos du contact si disponibles dans la réponse (si l'API le renvoie)
      if ((response as any).guest) {
        const guest = (response as any).guest;
        setFormData(prev => ({
          ...prev,
          firstName: guest.firstName || '',
          lastName: guest.lastName || '',
          email: guest.email || '',
          phone: guest.phone || ''
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'invitation:', error);
      setError('Invitation non trouvée ou expirée');
      return; // Arrêter ici si l'invitation ne peut pas être chargée
    } finally {
      setLoading(false);
    }

    // Charger le statut RSVP s'il existe (séparément pour ne pas faire échouer l'invitation)
    try {
      const statusData = await rsvpApi.getStatus(token);
      if (statusData) {
        setRsvpStatus(statusData);
        setFormData(prev => ({
          ...prev,
          status: statusData.status,
          message: statusData.message || '',
          profilePhotoUrl: statusData.profilePhotoUrl || '',
          plusOne: statusData.plusOne || false,
          plusOneName: statusData.plusOneName || '',
          dietaryRestrictions: statusData.dietaryRestrictions || '',
          // Mettre à jour les infos personnelles si elles sont dans le statut
          firstName: statusData.guest.firstName || prev.firstName,
          lastName: statusData.guest.lastName || prev.lastName,
          email: statusData.guest.email || prev.email,
          phone: statusData.guest.phone || prev.phone
        }));
        // Si une réponse existe déjà, afficher la réponse au lieu du formulaire
        setShowExistingResponse(true);
      } else {
        // Pas de RSVP, c'est normal pour une première visite
        console.log('Pas de statut RSVP existant - première visite');
      }
    } catch (statusError) {
      // Erreur autre que 404 - ne pas faire échouer l'affichage de l'invitation
      console.error('Erreur lors du chargement du statut RSVP:', statusError);
    }
  };

  const handleNextStep = () => {
    // Validation simple pour l'étape 1
    if (step === 1) {
      // Si on a des champs obligatoires pour l'identité, on peut les vérifier ici
      // Pour une invitation existante, le nom/prénom est souvent déjà là
      if (!formData.firstName || !formData.lastName) {
        setError('Veuillez vérifier votre nom et prénom.');
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
    setSubmitting(true);
    setError(null);

    try {
      // Préparer les données
      const submitData = {
        ...formData
      };

      let isNewResponse = false;

      if (rsvpStatus) {
        // Mettre à jour la réponse existante
        await rsvpApi.updateResponse(token, submitData);
      } else {
        // Créer une nouvelle réponse
        await rsvpApi.respond(token, submitData);
        isNewResponse = true;
      }

      // Déclencher les notifications pour les nouvelles réponses
      if (isNewResponse && invitation) {
        const guestName = `${formData.firstName} ${formData.lastName}`;
        const invitationName = invitation.eventTitle || 'votre événement';

        if (formData.status === 'CONFIRMED') {
          notifyRSVPConfirmed(guestName, invitationName);
        } else if (formData.status === 'DECLINED') {
          notifyRSVPDeclined(guestName, invitationName);
        }
      }

      // Rediriger vers la page de remerciement
      router.push(`/rsvp/${token}/merci`);
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
        <div className={`card animate-scaleIn ${styles.loadingCard}`}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingIcon}>
              <Heart style={{ width: '24px', height: '24px' }} />
            </div>
            <h2 className={`${styles.loadingTitle}`}>Chargement...</h2>
            <p className={`${styles.loadingText}`}>
              Préparation de votre invitation
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className={styles.container}>
        <div className={`card animate-scaleIn ${styles.errorCard}`}>
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>
              <HelpCircle style={{ width: '24px', height: '24px' }} />
            </div>
            <h1 className={`${styles.errorTitle}`}>Invitation non trouvée</h1>
            <p className={`${styles.errorText}`}>
              {error || 'Cette invitation n\'existe pas ou a expiré.'}
            </p>
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
          <div className={`card animate-scaleIn ${styles.invitationCard}`}>
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
                  {invitation.eventDate && (
                    <p className={styles.fallbackDate}>
                      {new Date(invitation.eventDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  )}
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

        {/* Colonne droite : Formulaire RSVP ou Réponse existante */}
        <div className={styles.formColumn}>
          <div className="animate-scaleIn">
            <div className={styles.formCard}>
              {showExistingResponse ? (
                // Afficher la réponse existante
                <div className={styles.responseContent}>
                  <h2 className={`${styles.responseTitle}`}>
                    Votre réponse
                  </h2>

                  {/* Affichage du nom de l'invité */}
                  {rsvpStatus?.guest && (
                    <p className={styles.guestWelcome}>
                      Merci <strong className={styles.guestName}>
                        {rsvpStatus.guest.firstName} {rsvpStatus.guest.lastName}
                      </strong> !
                    </p>
                  )}

                  <div className={styles.statusContainer}>
                    <div className={`${styles.statusIcon} ${rsvpStatus?.status === 'CONFIRMED' ? styles.statusIconConfirmed : styles.statusIconDeclined
                      }`}>
                      {rsvpStatus?.status === 'CONFIRMED' ? (
                        <CheckCircle />
                      ) : (
                        <XCircle />
                      )}
                    </div>

                    <h3 className={`${styles.statusTitle} ${rsvpStatus?.status === 'CONFIRMED' ? styles.confirmed : styles.declined}`}>
                      {rsvpStatus?.status === 'CONFIRMED' ?
                        'Vous avez confirmé votre présence' :
                        'Vous avez décliné l\'invitation'
                      }
                    </h3>

                    {rsvpStatus?.status === 'CONFIRMED' && (
                      <div className={`${styles.detailsList} ${styles.confirmed}`}>
                        <div className={`${styles.detailItem} ${styles.confirmed}`}>
                          <Users />
                          <span>
                            {rsvpStatus?.numberOfGuests || (rsvpStatus?.plusOne ? 2 : 1)}
                            {(rsvpStatus?.numberOfGuests || (rsvpStatus?.plusOne ? 2 : 1)) === 1 ? ' personne' : ' personnes'}
                          </span>
                        </div>
                        {rsvpStatus?.plusOne && rsvpStatus?.plusOneName && (
                          <div className={`${styles.detailItem} ${styles.confirmed}`}>
                            <Users />
                            <span>Accompagnant: {rsvpStatus.plusOneName}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {rsvpStatus?.message && (
                      <div className={styles.messageBox}>
                        <h4 className={styles.messageTitle}>
                          <MessageCircle />
                          Votre message:
                        </h4>
                        <p className={styles.messageText}>"{rsvpStatus.message}"</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className={`${styles.responseDate}`}>
                      Votre réponse a été enregistrée le {rsvpStatus?.respondedAt ? new Date(rsvpStatus.respondedAt).toLocaleDateString('fr-FR') : 'aujourd\'hui'}
                    </p>
                  </div>
                </div>
              ) : (
                // Afficher le formulaire avec Stepper
                <div className={styles.formContent}>
                  <h2 className={`${styles.formTitle}`}>
                    Confirmer votre présence
                  </h2>

                  {renderStepper()}

                  <form onSubmit={handleSubmit} className={styles.form}>

                    {step === 1 && (
                      <div className={styles.stepContent}>
                        {/* Section informations personnelles */}
                        <div className={styles.formGroup}>
                          <h3 className={styles.sectionLabel}>Vos informations</h3>

                          <div className={styles.inputGrid}>
                            <div className={styles.formField}>
                              <label className={styles.formLabel}>Prénom</label>
                              <div className={styles.readOnlyValue}>{formData.firstName || '-'}</div>
                            </div>
                            <div className={styles.formField}>
                              <label className={styles.formLabel}>Nom</label>
                              <div className={styles.readOnlyValue}>{formData.lastName || '-'}</div>
                            </div>
                          </div>

                          <div className={styles.inputGrid}>
                            <div className={styles.formField}>
                              <label className={styles.formLabel}>Email</label>
                              <div className={styles.readOnlyValue}>{formData.email || '-'}</div>
                            </div>
                            <div className={styles.formField}>
                              <label className={styles.formLabel}>Téléphone</label>
                              <div className={styles.readOnlyValue}>{formData.phone || '-'}</div>
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
                        <div className={styles.formSection}>
                          <label className={styles.formLabel}>
                            Votre réponse
                          </label>
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
                            <div>
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
                                <div className={styles.plusOneSection}>
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
                            <div>
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

                        <div>
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

                        {error && (
                          <div className={styles.errorMessage}>
                            {error}
                          </div>
                        )}

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

                        {rsvpStatus && !showExistingResponse && (
                          <p className={`${styles.updateNote}`}>
                            Vous avez déjà répondu à cette invitation. Vous pouvez modifier votre réponse ci-dessus.
                          </p>
                        )}
                      </div>
                    )}

                  </form>
                </div>
              )}
            </div>

            {/* Notice de sécurité supprimée ici */}
          </div>
        </div>
      </div>


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