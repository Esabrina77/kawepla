'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { rsvpApi, type RSVPStatus as ApiRSVPStatus } from '@/lib/api/rsvp';
import { TemplateEngine } from '@/lib/templateEngine';
import { Heart, HelpCircle, CheckCircle, XCircle, Camera, Users, Wine, MessageCircle } from 'lucide-react';
import GuestProfilePhotoUpload from '@/components/GuestProfilePhotoUpload/GuestProfilePhotoUpload';
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
  const [renderedInvitation, setRenderedInvitation] = useState<{ html: string; css: string } | null>(null);
  
  const [formData, setFormData] = useState({
    status: 'PENDING' as 'PENDING' | 'CONFIRMED' | 'DECLINED',
    message: '',
    attendingCeremony: true,
    attendingReception: true,
    profilePhotoUrl: '',
    plusOne: false,
    plusOneName: '',
    dietaryRestrictions: ''
  });
  const [showExistingResponse, setShowExistingResponse] = useState(false);

  useEffect(() => {
    loadInvitationData();
  }, [token]);

  useEffect(() => {
    if (invitation && invitation.design) {
      renderInvitationTemplate();
    }
  }, [invitation]);

  const loadInvitationData = async () => {
      setLoading(true);
      setError(null);
      
    try {
      // Charger les détails de l'invitation avec le design
      const response = await rsvpApi.getInvitation(token);
      setInvitation(response.invitation);
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
          setFormData({
            status: statusData.status,
            message: statusData.message || '',
            attendingCeremony: statusData.attendingCeremony ?? true,
            attendingReception: statusData.attendingReception ?? true,
            profilePhotoUrl: statusData.profilePhotoUrl || '',
          plusOne: statusData.guest?.plusOne || false,
          plusOneName: statusData.guest?.plusOneName || '',
          dietaryRestrictions: statusData.guest?.dietaryRestrictions || ''
          });
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

  const renderInvitationTemplate = () => {
    if (!invitation || !invitation.design) return;

    try {
      const templateEngine = new TemplateEngine();
      
      // Utiliser la NOUVELLE architecture avec les données de l'invitation
      const invitationData = {
        eventTitle: invitation.eventTitle || '',
        eventDate: invitation.eventDate ? new Date(invitation.eventDate) : new Date(),
        eventTime: invitation.eventTime || '',
        location: invitation.location || '',
        eventType: invitation.eventType || 'event',
        customText: invitation.customText || '',
        moreInfo: invitation.moreInfo || ''
      };

      // Rendre le template avec la nouvelle architecture
      const renderedHtml = templateEngine.render(invitation.design, invitationData);
      
      // Extraire le CSS et le HTML du rendu
      const cssMatch = renderedHtml.match(/<style>([\s\S]*?)<\/style>/);
      const css = cssMatch ? cssMatch[1] : '';
      const htmlMatch = renderedHtml.replace(/<style>[\s\S]*?<\/style>/, '');
      
      setRenderedInvitation({ 
        html: htmlMatch, 
        css: css 
      });
    } catch (error) {
      console.error('Erreur lors du rendu du template:', error);
      // En cas d'erreur, on affichera la version simple
      setRenderedInvitation(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Préparer les données sans numberOfGuests
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
        const guestName = rsvpStatus?.guest ? 
          `${rsvpStatus.guest.firstName} ${rsvpStatus.guest.lastName}` : 
          'Un invité';
        
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={`card animate-scale-in ${styles.loadingCard}`}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingIcon}>
              <Heart style={{ width: '24px', height: '24px' }} />
            </div>
            <h2 className={`heading-2 ${styles.loadingTitle}`}>Chargement...</h2>
            <p className={`text-body ${styles.loadingText}`}>
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
        <div className={`card animate-scale-in ${styles.errorCard}`}>
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>
              <HelpCircle style={{ width: '24px', height: '24px' }} />
            </div>
            <h1 className={`heading-2 ${styles.errorTitle}`}>Invitation non trouvée</h1>
            <p className={`text-body ${styles.errorText}`}>
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
          <div className={`card animate-scale-in ${styles.invitationCard}`}>
            {renderedInvitation ? (
              <div className="invitation-container">
                {/* Injecter le CSS du design */}
                <style dangerouslySetInnerHTML={{ __html: renderedInvitation.css }} />
                {/* Afficher l'HTML de l'invitation */}
                <div dangerouslySetInnerHTML={{ __html: renderedInvitation.html }} />
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

        {/* Colonne droite : Formulaire RSVP ou Réponse existante */}
        <div className={styles.formColumn}>
          <div className="card animate-scale-in">
            <div className={styles.formCard}>
              {showExistingResponse ? (
                // Afficher la réponse existante
                <div className={styles.responseContent}>
                  <h2 className={`heading-2 ${styles.responseTitle}`}>
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
                    <div className={`${styles.statusIcon} ${
                      rsvpStatus?.status === 'CONFIRMED' ? styles.statusIconConfirmed : styles.statusIconDeclined
                    }`}>
                      {rsvpStatus?.status === 'CONFIRMED' ? (
                        <CheckCircle style={{ width: '40px', height: '40px' }} />
                      ) : (
                        <XCircle style={{ width: '40px', height: '40px' }} />
                      )}
                    </div>
                    
                    <h3 className={styles.statusTitle}>
                      {rsvpStatus?.status === 'CONFIRMED' ? 
                        'Vous avez confirmé votre présence' : 
                        'Vous avez décliné l\'invitation'
                      }
                    </h3>
                    
                    {rsvpStatus?.status === 'CONFIRMED' && (
                      <div className={styles.detailsList}>
                        <div className={styles.detailItem}>
                          <Users style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
                          <span>{rsvpStatus?.guest?.plusOne ? '2 personnes' : '1 personne'}</span>
                        </div>
                        {rsvpStatus?.guest?.plusOne && rsvpStatus?.guest?.plusOneName && (
                          <div className={styles.detailItem}>
                            <Users style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
                            <span>Accompagnant: {rsvpStatus.guest.plusOneName}</span>
                          </div>
                        )}
                        {rsvpStatus?.attendingCeremony && (
                          <div className={styles.detailItem}>
                            <Heart style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
                            <span>Présent(e) à la cérémonie</span>
                          </div>
                        )}
                        {rsvpStatus?.attendingReception && (
                          <div className={styles.detailItem}>
                            <Wine style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
                            <span>Présent(e) à la réception</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {rsvpStatus?.message && (
                      <div className={styles.messageBox}>
                        <h4 className={styles.messageTitle}>
                          <MessageCircle style={{ width: '16px', height: '16px' }} />
                          Votre message:
                        </h4>
                        <p className={styles.messageText}>"{rsvpStatus.message}"</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className={`text-small ${styles.responseDate}`}>
                      Votre réponse a été enregistrée le {rsvpStatus?.respondedAt ? new Date(rsvpStatus.respondedAt).toLocaleDateString('fr-FR') : 'aujourd\'hui'}
                    </p>
                  </div>
                </div>
              ) : (
                // Afficher le formulaire
                <div>
                  <h2 className={`heading-2 ${styles.formTitle}`}>
                    Confirmer votre présence
                  </h2>
              
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formSection}>
                  <label className={styles.formLabel}>
                    Votre réponse
                  </label>
                  <div className={styles.responseButtons}>
                    <button
                      type="button"
                      className={`${formData.status === 'CONFIRMED' ? 'btn btn-primary' : 'btn btn-outline'} ${styles.responseButton}`}
                      onClick={() => setFormData(prev => ({ ...prev, status: 'CONFIRMED' }))}
                    >
                      <CheckCircle style={{ width: '16px', height: '16px' }} />
                      Je serai présent(e)
                    </button>
                    <button
                      type="button"
                      className={`${formData.status === 'DECLINED' ? 'btn btn-secondary' : 'btn btn-outline'} ${styles.responseButton}`}
                      onClick={() => setFormData(prev => ({ ...prev, status: 'DECLINED' }))}
                    >
                      <XCircle style={{ width: '16px', height: '16px' }} />
                      Je ne pourrai pas venir
                    </button>
                  </div>
                </div>

                {formData.status === 'CONFIRMED' && (
                  <>
                    <div className={styles.checkboxGroup}>
                      <div>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            name="attendingCeremony"
                            checked={formData.attendingCeremony}
                            onChange={handleInputChange}
                            className={styles.checkbox}
                          />
                          <span>
                            Je serai présent(e) à la cérémonie
                          </span>
                        </label>
                      </div>
                      <div>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            name="attendingReception"
                            checked={formData.attendingReception}
                            onChange={handleInputChange}
                            className={styles.checkbox}
                          />
                          <span>
                            Je serai présent(e) à la réception
                          </span>
                        </label>
                      </div>
                    </div>

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

                {/* Section photo de profil */}
                <div>
               
                  <GuestProfilePhotoUpload
                    currentPhotoUrl={formData.profilePhotoUrl || null}
                    onPhotoChange={(url) => setFormData(prev => ({ ...prev, profilePhotoUrl: url || '' }))}
                    disabled={submitting}
                  />
               
                
                </div>

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

                <button
                  type="submit"
                  disabled={submitting || formData.status === 'PENDING'}
                  className={`btn btn-primary ${styles.submitButton}`}
                >
                  {submitting ? 'Envoi en cours...' : 'Envoyer ma réponse'}
                </button>

                {rsvpStatus && !showExistingResponse && (
                  <p className={`text-small ${styles.updateNote}`}>
                    Vous avez déjà répondu à cette invitation. Vous pouvez modifier votre réponse ci-dessus.
                  </p>
                )}
              </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 