'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';
import PhoneInput from '@/components/PhoneInput/PhoneInput';
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
  guests?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    rsvp?: {
      status: 'CONFIRMED' | 'DECLINED' | 'PENDING';
      numberOfGuests: number;
      message?: string;
    };
  }>;
}

export default function SharedRSVPPage() {
  const params = useParams();
  const router = useRouter();
  const shareableToken = params.shareableToken as string;
  
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
    numberOfGuests: 1,
    message: '',
    attendingCeremony: true,
    attendingReception: true,
    profilePhotoUrl: ''
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
            <h1 className="text-2xl font-bold mb-4">Lien d'invitation invalide</h1>
            <p className="text-gray-600">{error || "Ce lien d'invitation n'existe pas ou a expiré."}</p>
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
            grid-template-columns: 1fr 1fr;
            max-width: 1400px;
            margin: 0 auto;
          }
          
          .invitation-column {
            position: sticky;
            top: 120px;
            height: fit-content;
          }
        }
        
        @media (min-width: 1280px) {
          .rsvp-layout {
            grid-template-columns: 1.2fr 0.8fr;
          }
        }
      `}</style>
      
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

        {/* Colonne droite : Formulaire RSVP étendu */}
        <div className="form-column">
          {/* Section des invités qui ont déjà répondu */}
          {/* Ainsi, la liste des invités ne s'affichera plus jamais sur cette page. */}

          <Card>
            <div className="p-8">
              {checkingExistingResponse ? (
                <div className="text-center">
                  <p>Vérification de votre réponse...</p>
                </div>
              ) : existingResponse ? (
                // Afficher la réponse existante
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-6">Votre réponse</h2>
                  
                  <div className="mb-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      existingResponse.rsvp.status === 'CONFIRMED' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <span className="text-4xl">
                        {existingResponse.rsvp.status === 'CONFIRMED' ? '🎉' : '😔'}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2">
                      {existingResponse.guest.firstName} {existingResponse.guest.lastName}
                    </h3>
                    
                    {existingResponse.rsvp.profilePhotoUrl && (
                      <div className="mb-4">
                        <img 
                          src={existingResponse.rsvp.profilePhotoUrl} 
                          alt={`Photo de ${existingResponse.guest.firstName} ${existingResponse.guest.lastName}`}
                          className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handlePhotoClick(existingResponse.rsvp.profilePhotoUrl, `Photo de ${existingResponse.guest.firstName} ${existingResponse.guest.lastName}`)}
                        />
                      </div>
                    )}
                    
                    <p className={`text-lg font-medium ${
                      existingResponse.rsvp.status === 'CONFIRMED' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {existingResponse.rsvp.status === 'CONFIRMED' ? 
                        'Vous avez confirmé votre présence ✅' : 
                        'Vous avez décliné l\'invitation ❌'
                      }
                    </p>
                    
                    {existingResponse.rsvp.status === 'CONFIRMED' && (
                      <div className="mt-4 space-y-2">
                        <p className="text-gray-600">
                          👥 {existingResponse.rsvp.numberOfGuests} personne{existingResponse.rsvp.numberOfGuests > 1 ? 's' : ''}
                        </p>
                        {existingResponse.rsvp.attendingCeremony && (
                          <p className="text-gray-600">💒 Présent(e) à la cérémonie</p>
                        )}
                        {existingResponse.rsvp.attendingReception && (
                          <p className="text-gray-600">🥂 Présent(e) à la réception</p>
                        )}
                      </div>
                    )}
                    
                    {existingResponse.rsvp.message && (
                      <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-left">
                        <h4 className="font-semibold text-gray-800 mb-2">💌 Votre message:</h4>
                        <p className="italic text-gray-700">"{existingResponse.rsvp.message}"</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 text-sm text-gray-500">
                    <p>Votre réponse a été enregistrée le {new Date(existingResponse.rsvp.respondedAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              ) : (
                // Afficher le formulaire
                <div>
                  <h2 className="text-2xl font-bold text-center mb-6">Confirmer votre présence</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                {/* NOUVEAU: Section informations personnelles */}
                <div className="personal-info-section">
                  <h3 className="text-lg font-semibold mb-4">Vos informations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email (optionnel)
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="votre.email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <PhoneInput
                        value={formData.phone}
                        onChange={(value: string) => setFormData(prev => ({ ...prev, phone: value }))}
                        placeholder="Entrez votre numéro de téléphone"
                        name="phone"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Section photo de profil */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Votre photo (optionnel)
                    </label>
                    <GuestProfilePhotoUpload
                      currentPhotoUrl={formData.profilePhotoUrl || null}
                      onPhotoChange={(url) => setFormData(prev => ({ ...prev, profilePhotoUrl: url || '' }))}
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Formulaire RSVP classique */}
                <div className="rsvp-section">
                  <h3 className="text-lg font-semibold mb-4">Votre réponse</h3>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
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

                  {formData.status === 'CONFIRMED' && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de personnes
                        </label>
                        <input
                          type="number"
                          name="numberOfGuests"
                          value={formData.numberOfGuests}
                          onChange={handleInputChange}
                          min="1"
                          max="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-3 mb-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="attendingCeremony"
                            checked={formData.attendingCeremony}
                            onChange={handleInputChange}
                            className="mr-2"
                          />
                          Je serai présent(e) à la cérémonie
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="attendingReception"
                            checked={formData.attendingReception}
                            onChange={handleInputChange}
                            className="mr-2"
                          />
                          Je serai présent(e) à la réception
                        </label>
                      </div>
                    </>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message pour les mariés
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Un petit message pour les mariés..."
                    />
                  </div>
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
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? 'Envoi en cours...' : 'Envoyer ma réponse'}
                </Button>
              </form>
                </div>
              )}
            </div>
          </Card>
          <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: '#64748b', gap: '0.5rem' }}>
  <span style={{ fontSize: '1.1em' }}>🔒</span>
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