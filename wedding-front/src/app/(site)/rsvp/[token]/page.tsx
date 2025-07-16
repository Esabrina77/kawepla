'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';
import { rsvpApi } from '@/lib/api/rsvp';
import { renderTemplate, invitationToTemplateData, DesignTemplate } from '@/lib/templateEngine';
import GuestProfilePhotoUpload from '@/components/GuestProfilePhotoUpload/GuestProfilePhotoUpload';
import PhotoModal from '@/components/PhotoModal/PhotoModal';

interface Invitation {
  id: string;
  title?: string;
  coupleName: string;
  weddingDate: string;
  ceremonyTime?: string;
  receptionTime?: string;
  venueName: string;
  venueAddress: string;
  venueCoordinates?: string;
  invitationText?: string;
  message?: string;
  blessingText?: string;
  welcomeMessage?: string;
  dressCode?: string;
  contact?: string;
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
}

interface RSVPStatus {
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
  numberOfGuests?: number;
  message?: string;
  attendingCeremony?: boolean;
  attendingReception?: boolean;
  profilePhotoUrl?: string;
  updatedAt?: string; // Added for display
}

export default function RSVPPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [renderedInvitation, setRenderedInvitation] = useState<{ html: string; css: string } | null>(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; alt: string } | null>(null);
  
  const [formData, setFormData] = useState({
    status: 'PENDING' as 'PENDING' | 'CONFIRMED' | 'DECLINED',
    numberOfGuests: 1,
    message: '',
    attendingCeremony: true,
    attendingReception: true,
    profilePhotoUrl: '' as string
  });

  useEffect(() => {
    loadInvitationData();
  }, [token]);

  useEffect(() => {
    if (invitation && invitation.design) {
      renderInvitationTemplate();
    }
  }, [invitation]);

  const loadInvitationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les détails de l'invitation avec le design
      const invitationData = await rsvpApi.getInvitation(token);
      setInvitation(invitationData);
      
      // Charger le statut RSVP s'il existe
      try {
        const statusData = await rsvpApi.getStatus(token);
        if (statusData) {
          setRsvpStatus(statusData);
          setFormData({
            status: statusData.status,
            numberOfGuests: statusData.numberOfGuests || 1,
            message: statusData.message || '',
            attendingCeremony: statusData.attendingCeremony ?? true,
            attendingReception: statusData.attendingReception ?? true,
            profilePhotoUrl: statusData.profilePhotoUrl || ''
          });
        }
      } catch (statusError) {
        // Pas de statut RSVP existant, c'est normal
        console.log('Pas de statut RSVP existant');
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Invitation non trouvée ou expirée');
    } finally {
      setLoading(false);
    }
  };

  const renderInvitationTemplate = () => {
    if (!invitation || !invitation.design) return;

    try {
      // Créer le template à partir du design
      const template: DesignTemplate = {
        layout: invitation.design.template.layout,
        sections: invitation.design.template.sections,
        styles: invitation.design.styles,
        variables: invitation.design.variables,
        components: invitation.design.components,
        version: invitation.design.version
      };

      // Convertir les données d'invitation en données de template
      const templateData = invitationToTemplateData(invitation);

      // Rendre le template
      const rendered = renderTemplate(template, templateData, invitation.design.id);
      setRenderedInvitation(rendered);
    } catch (error) {
      console.error('Erreur lors du rendu du template:', error);
      // En cas d'erreur, on affichera la version simple
      setRenderedInvitation(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Empêcher la modification si une réponse existe déjà
    if (rsvpStatus) {
      setError('Vous avez déjà répondu à cette invitation. Il n\'est plus possible de modifier votre réponse.');
      return;
    }

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
      if (rsvpStatus) {
        // Mettre à jour la réponse existante
        await rsvpApi.update(token, formData);
      } else {
        // Créer une nouvelle réponse
        await rsvpApi.respond(token, formData);
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
      [name]: type === 'checkbox' ? checked : value
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
      <div className="container mx-auto px-4 py-8" style={{ marginTop: '70px' }}>
        <Card className="max-w-4xl mx-auto">
          <div className="text-center p-8">
            <p>Chargement de votre invitation...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="container mx-auto px-4 py-8" style={{ marginTop: '70px' }}>
        <Card className="max-w-4xl mx-auto">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Invitation non trouvée</h1>
            <p className="text-gray-600">{error || 'Cette invitation n\'existe pas ou a expiré.'}</p>
            <Button
              variant="primary"
              className="mt-6"
              onClick={() => window.location.reload()}
            >
              🔄 Rafraîchir
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ marginTop: '70px' }}>
      {/* Styles CSS personnalisés pour forcer le layout */}
      <style jsx>{`
        .rsvp-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        
        @media (min-width: 1024px) {
          .rsvp-layout {
            grid-template-columns: 2fr 1fr;
          }
        }
      `}</style>

      {/* Afficher un message si la réponse a déjà été soumise */}
      {rsvpStatus && (
        <Card className="max-w-4xl mx-auto mb-8">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Réponse déjà enregistrée</h2>
            <p className="text-gray-600 mb-4">
              Vous avez déjà répondu à cette invitation le {new Date(rsvpStatus.updatedAt!).toLocaleDateString('fr-FR')}.
              Il n'est plus possible de modifier votre réponse.
            </p>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold mb-2">Votre réponse :</h3>
              <p>
                Status : {rsvpStatus.status === 'CONFIRMED' ? '✅ Présent(e)' : '❌ Absent(e)'}
              </p>
              {rsvpStatus.status === 'CONFIRMED' && (
                <>
                  <p>Nombre d'invités : {rsvpStatus.numberOfGuests}</p>
                  <p>Cérémonie : {rsvpStatus.attendingCeremony ? '✓' : '✗'}</p>
                  <p>Réception : {rsvpStatus.attendingReception ? '✓' : '✗'}</p>
                </>
              )}
              {rsvpStatus.message && (
                <div className="mt-4">
                  <h4 className="font-bold">Votre message :</h4>
                  <p className="italic">{rsvpStatus.message}</p>
                </div>
              )}
            </div>
            <p className="mt-6 text-sm text-gray-500">
              Si vous devez modifier votre réponse, veuillez contacter directement les mariés.
            </p>
          </div>
        </Card>
      )}

      {/* Formulaire RSVP (caché si déjà répondu) */}
      {!rsvpStatus && (
        <div className="rsvp-layout">
        
        {/* Colonne gauche : Invitation avec son design visuel */}
        <div className="invitation-column">
          <Card className="overflow-hidden">
            {renderedInvitation ? (
              <div className="invitation-container">
                {/* Injecter le CSS du design */}
                <style dangerouslySetInnerHTML={{ __html: renderedInvitation.css }} />
                {/* Afficher l'HTML de l'invitation */}
                <div dangerouslySetInnerHTML={{ __html: renderedInvitation.html }} />
              </div>
            ) : (
              // Version de fallback si le rendu échoue
              <div className="text-center p-8">
                <h1 className="text-3xl font-serif mb-6">
                  {invitation.title || `Mariage de ${invitation.coupleName}`}
                </h1>
                
                <div className="my-8">
                  <p className="text-2xl mb-2">
                    {new Date(invitation.weddingDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  {invitation.ceremonyTime && (
                    <p className="text-xl mb-2">
                      Cérémonie à {invitation.ceremonyTime}
                    </p>
                  )}
                  {invitation.receptionTime && (
                    <p className="text-xl mb-2">
                      Réception à {invitation.receptionTime}
                    </p>
                  )}
                  <p className="text-xl">
                    à {invitation.venueName}
                    <br />
                    {invitation.venueAddress}
                  </p>
                </div>

                {invitation.invitationText && (
                  <div className="my-6">
                    <p className="text-lg italic">{invitation.invitationText}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Colonne droite : Formulaire RSVP */}
        <div className="form-column">
          <Card>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-center mb-6">Confirmer votre présence</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Votre réponse
                  </label>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                      type="button"
                      variant={formData.status === 'CONFIRMED' ? 'primary' : 'outline'}
                      onClick={() => setFormData(prev => ({ ...prev, status: 'CONFIRMED' }))}
                      className="flex-1 sm:flex-none"
                    >
                      ✅ Je serai présent(e)
                    </Button>
                    <Button
                      type="button"
                      variant={formData.status === 'DECLINED' ? 'danger' : 'outline'}
                      onClick={() => setFormData(prev => ({ ...prev, status: 'DECLINED' }))}
                      className="flex-1 sm:flex-none"
                    >
                      ❌ Je ne pourrai pas venir
                    </Button>
                  </div>
                </div>

                {formData.status === 'CONFIRMED' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de personnes
                      </label>
                      <input
                        type="number"
                        name="numberOfGuests"
                        min="1"
                        max="2"
                        value={formData.numberOfGuests}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name="attendingCeremony"
                            checked={formData.attendingCeremony}
                            onChange={handleInputChange}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2">Je serai présent(e) à la cérémonie</span>
                        </label>
                      </div>
                      <div>
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name="attendingReception"
                            checked={formData.attendingReception}
                            onChange={handleInputChange}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2">Je serai présent(e) à la réception</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre photo (optionnel)
                  </label>
                  <GuestProfilePhotoUpload
                    currentPhotoUrl={formData.profilePhotoUrl || null}
                    onPhotoChange={(url) => setFormData(prev => ({ ...prev, profilePhotoUrl: url || '' }))}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message pour les mariés
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Votre message pour les mariés..."
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                    {error}
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => window.location.reload()}
                      >
                        🔄 Rafraîchir
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting || formData.status === 'PENDING'}
                  className="w-full py-3 text-lg"
                >
                  {submitting ? 'Envoi en cours...' : (rsvpStatus ? 'Modifier ma réponse' : 'Envoyer ma réponse')}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
      )}
      
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