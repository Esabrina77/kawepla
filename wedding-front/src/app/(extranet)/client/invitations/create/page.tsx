'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { HeaderMobile } from '@/components/HeaderMobile';
import { InvitationEventFormModal, EventFormData } from '@/components/InvitationEventFormModal';
import { useDesigns } from '@/hooks/useDesigns';
import { useAuth } from '@/hooks/useAuth';
import { invitationsApi, CreateInvitationDto } from '@/lib/api/invitations';
import { convertFabricToKawepla, loadKaweplaDesignToFabric } from '@/utils/fabricToKaweplaAdapter';
import { uploadToFirebase } from '@/lib/firebase';
import * as fabric from 'fabric';
import { useToast } from '@/components/ui/toast';

// Importer dynamiquement les composants de l'éditeur Canva
const Canvas = dynamic(() => import('@/components/CanvaEditor/Canvas'), {
  ssr: false,
  loading: () => <div>Chargement de l'éditeur...</div>
});

const Toolbar = dynamic(() => import('@/components/CanvaEditor/Toolbar'), {
  ssr: false
});

const PropertiesPanel = dynamic(() => import('@/components/CanvaEditor/PropertiesPanel'), {
  ssr: false
});

const ContextToolbar = dynamic(() => import('@/components/CanvaEditor/ContextToolbar'), {
  ssr: false
});

const Navbar = dynamic(() => import('@/components/CanvaEditor/Navbar'), {
  ssr: false
});

export default function CreateInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { getDesignById, createPersonalizedDesign } = useDesigns();
  const { addToast } = useToast();

  const [designId, setDesignId] = useState<string | null>(null);
  const [design, setDesign] = useState<any>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventFormData, setEventFormData] = useState<EventFormData | null>(null);
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'select' | 'form' | 'edit' | 'saved'>('select');

  // Récupérer le designId depuis l'URL
  useEffect(() => {
    const designIdParam = searchParams.get('designId');
    if (designIdParam) {
      setDesignId(designIdParam);
      setStep('form');
      setShowEventForm(true);
    }
  }, [searchParams]);

  // Charger le design
  useEffect(() => {
    if (designId) {
      const loadDesign = async () => {
        try {
          setLoading(true);
          const loadedDesign = await getDesignById(designId);
          if (loadedDesign) {
            setDesign(loadedDesign);
          } else {
            addToast({
              type: 'error',
              title: 'Erreur',
              message: 'Design introuvable'
            });
            router.push('/designs');
          }
        } catch (error) {
          console.error('Erreur lors du chargement du design:', error);
          addToast({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors du chargement du design'
          });
          router.push('/designs');
        } finally {
          setLoading(false);
        }
      };
      loadDesign();
    }
  }, [designId, getDesignById, router]);

  // Charger le design dans le canvas après validation du formulaire
  useEffect(() => {
    if (canvas && design && eventFormData && step === 'edit') {
      loadKaweplaDesignToFabric(design, canvas);
    }
  }, [canvas, design, eventFormData, step]);

  const handleCanvasReady = (fabricCanvas: fabric.Canvas) => {
    setCanvas(fabricCanvas);
  };

  const handleEventFormSubmit = async (data: EventFormData) => {
    if (!design || !user) return;

    try {
      setSaving(true);

      // Créer l'invitation avec les données événement
      const invitationData: CreateInvitationDto = {
        eventTitle: data.eventTitle,
        eventDate: new Date(data.eventDate).toISOString(),
        eventTime: data.eventTime || undefined,
        location: data.location,
        eventType: data.eventType,
        customText: data.customText || undefined,
        moreInfo: data.moreInfo || undefined,
        description: data.description || undefined,
        designId: design.id,
        status: 'DRAFT',
        languages: ['fr'],
        photos: [],
      };

      const invitation = await invitationsApi.createInvitation(invitationData);
      setInvitationId(invitation.id);
      setEventFormData(data);
      setShowEventForm(false);
      setStep('edit');
    } catch (error) {
      console.error('Erreur lors de la création de l\'invitation:', error);
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Erreur lors de la création de l\'invitation'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePersonalizedDesign = async () => {
    if (!canvas || !design || !invitationId || !user) return;

    try {
      setSaving(true);

      // 1. Générer la miniature
      canvas.discardActiveObject();
      canvas.requestRenderAll();

      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 0.8,
        multiplier: 0.5,
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const fileName = `design-personal-${Date.now()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      const thumbnailUrl = await uploadToFirebase(file, `designs/preview/${fileName}`);

      // Convertir le canvas vers Fabric.js JSON
      const converted = convertFabricToKawepla(canvas);

      // Créer un design personnalisé
      const personalizedDesign = await createPersonalizedDesign(
        design.id,
        converted.fabricData,
        `${design.name} - Personnalisé`,
        thumbnailUrl,
        thumbnailUrl
      );

      // Mettre à jour l'invitation avec le design personnalisé
      await invitationsApi.updateInvitation(invitationId, {
        customDesignId: personalizedDesign.id,
        customFabricData: converted.fabricData,
        customCanvasWidth: converted.canvasWidth,
        customCanvasHeight: converted.canvasHeight,
        status: 'DRAFT',
      });

      addToast({
        type: 'success',
        title: 'Succès',
        message: 'Design personnalisé sauvegardé avec succès !'
      });
      setStep('saved');
      router.push(`/invitations/${invitationId}`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Erreur lors de la sauvegarde du design personnalisé'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Chargement du design...</p>
      </div>
    );
  }

  if (step === 'select') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Veuillez sélectionner un modèle depuis la galerie.</p>
        <button onClick={() => router.push('/client/designs')}>
          Voir la galerie
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <HeaderMobile
        title={design?.name || 'Personnaliser le design'}
        onBack={() => router.push('/client/designs')}
      />

      {/* Formulaire modal pour les données événement */}
      <InvitationEventFormModal
        isOpen={showEventForm}
        onClose={() => {
          if (step === 'form') {
            router.push('/client/designs');
          } else {
            setShowEventForm(false);
          }
        }}
        onSubmit={handleEventFormSubmit}
        loading={saving}
      />

      {/* Éditeur Canva */}
      {step === 'edit' && (
        <>
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <Toolbar />
            <div style={{ flex: 1, position: 'relative' }}>
              <Navbar
                onSave={handleSavePersonalizedDesign}
                saving={saving}
              />
              <ContextToolbar />
              <Canvas onCanvasReady={handleCanvasReady} />
            </div>
            <PropertiesPanel />
          </div>
        </>
      )}

      {step === 'saved' && (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Design sauvegardé avec succès !</p>
          <button onClick={() => router.push(`/client/invitations/${invitationId}`)}>
            Voir l'invitation
          </button>
        </div>
      )}
    </div>
  );
}

