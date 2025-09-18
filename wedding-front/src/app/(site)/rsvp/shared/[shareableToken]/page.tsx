'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TemplateEngine } from '@/lib/templateEngine';
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
      attendingCeremony?: boolean;
      attendingReception?: boolean;
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
  const [renderedInvitation, setRenderedInvitation] = useState<{ html: string; css: string } | null>(null);
  const [existingResponse, setExistingResponse] = useState<any>(null);
  const [checkingExistingResponse, setCheckingExistingResponse] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; alt: string } | null>(null);
  
  const [formData, setFormData] = useState({
    // Infos personnelles (NOUVEAU)
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // RSVP classique
    status: 'PENDING' as 'PENDING' | 'CONFIRMED' | 'DECLINED',
    message: '',
    attendingCeremony: true,
    attendingReception: true,
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
      renderInvitationTemplate();
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
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Lien d\'invitation invalide ou expiré');
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Obliger le choix du status
    if (formData.status !== 'CONFIRMED' && formData.status !== 'DECLINED') {
      setError('Veuillez indiquer si vous serez présent(e) ou non.');
      return;
    }

    // 2. Si présent, obliger au moins cérémonie ou réception
    if (formData.status === 'CONFIRMED' && !formData.attendingCeremony && !formData.attendingReception) {
      setError('Veuillez indiquer si vous serez présent(e) à la cérémonie ou à la réception.');
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
                  <div className={`${styles.statusIcon} ${
                    existingResponse.rsvp.status === 'CONFIRMED' ? styles.statusConfirmed : styles.statusDeclined
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
                  
                  <p className={`${styles.statusMessage} ${
                    existingResponse.rsvp.status === 'CONFIRMED' ? styles.statusMessageConfirmed : styles.statusMessageDeclined
                  }`}>
                    {existingResponse.rsvp.status === 'CONFIRMED' ? 
                      'Vous avez confirmé votre présence' : 
                      'Vous avez décliné l\'invitation'
                    }
                  </p>
                  
                  {existingResponse.rsvp.status === 'CONFIRMED' && (
                    <div className={styles.detailList}>
                      <div className={styles.detailItem}>
                        <Users style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
                        <span>{existingResponse.rsvp.plusOne ? '2 personnes' : '1 personne'}</span>
                      </div>
                      {existingResponse.rsvp.plusOne && existingResponse.rsvp.plusOneName && (
                        <div className={styles.detailItem}>
                          <Users style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
                          <span>Accompagnant: {existingResponse.rsvp.plusOneName}</span>
                        </div>
                      )}
                      {existingResponse.rsvp.attendingCeremony && (
                        <div className={styles.detailItem}>
                          <Church style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
                          <span>Présent(e) à la cérémonie</span>
                        </div>
                      )}
                      {existingResponse.rsvp.attendingReception && (
                        <div className={styles.detailItem}>
                          <Wine style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
                          <span>Présent(e) à la réception</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {existingResponse.rsvp.message && (
                    <div className={styles.messageBox}>
                      <h4 className={styles.messageHeader}>
                        <MessageCircle style={{ width: '16px', height: '16px' }} />
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
                
                <form onSubmit={handleSubmit} className={styles.form}>
                  {/* Section informations personnelles */}
                  <div className={styles.formSection}>
                    <div>
                      <label className={styles.sectionLabel}>
                        Vos informations
                      </label>
                      <div className={styles.inputGrid}>
                        <div>
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
                        <div>
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
                      <div className={`${styles.inputGrid} mt-4`}>
                        <div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email (optionnel)"
                            className={styles.textInput}
                          />
                        </div>
                        <div>
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
                      <div className="mt-4">
                      
                        <GuestProfilePhotoUpload
                          currentPhotoUrl={formData.profilePhotoUrl || null}
                          onPhotoChange={(url) => setFormData(prev => ({ ...prev, profilePhotoUrl: url || '' }))}
                          disabled={submitting}
                        />
 
                      </div>
                    </div>

                    {/* Formulaire RSVP classique */}
                    <div className={styles.formSection}>
                      <label className={styles.sectionLabel}>
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
                          <label className={styles.sectionLabel}>
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
                      <label className={styles.sectionLabel}>
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
                  </div>

                  {error && (
                    <div className={styles.errorMessage}>
                      {error}
                      <div className="mt-2">
                        <button
                          className="btn btn-outline"
                          onClick={() => window.location.reload()}
                        >
                          <RefreshCw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                          Rafraîchir
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || formData.status === 'PENDING'}
                    className={`btn btn-primary ${styles.submitButton}`}
                  >
                    {submitting ? 'Envoi en cours...' : 'Envoyer ma réponse'}
                  </button>
                </form>
              </div>
            )}
          </div>
          
          {/* Notice de sécurité */}
          <div className={styles.securityNotice}>
            <Shield style={{ width: '16px', height: '16px' }} />
            <span>Ce lien est personnel. Merci de ne pas le partager avec d'autres personnes.</span>
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
    </div>
  );
} 