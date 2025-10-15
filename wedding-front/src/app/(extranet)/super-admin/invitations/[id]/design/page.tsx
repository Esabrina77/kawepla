'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/apiClient';
import { TemplateEngine } from '@/lib/templateEngine';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import styles from './design.module.css';

interface InvitationDesign {
  id: string;
  eventTitle?: string;
  eventDate?: string | Date;
  eventType?: string;
  eventTime?: string;
  location?: string;
  customText?: string;
  moreInfo?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  design?: {
    id: string;
    name: string;
    category: string;
    template: any;
    styles: any;
    variables: any;
  } | null;
}

export default function InvitationDesignPage() {
  const params = useParams();
  const router = useRouter();
  const invitationId = params.id as string;
  
  const [invitation, setInvitation] = useState<InvitationDesign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderedInvitation, setRenderedInvitation] = useState<string>('');

  const fetchInvitationDesign = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.get<InvitationDesign>(`/admin/invitations/${invitationId}`);
      
      console.log('═══════════════════════════════════════════');
      console.log('📊 DONNÉES REÇUES DE L\'API:');
      console.log('═══════════════════════════════════════════');
      console.log('ID Invitation:', data.id);
      console.log('Titre:', data.eventTitle);
      console.log('Design présent?', !!data.design);
      
      if (data.design) {
        console.log('🎨 DESIGN TROUVÉ:');
        console.log('  - ID:', data.design.id);
        console.log('  - Nom:', data.design.name);
        console.log('  - Catégorie:', data.design.category);
        console.log('  - Template présent?', !!data.design.template);
        console.log('  - Template type:', typeof data.design.template);
        console.log('  - Styles présent?', !!data.design.styles);
        console.log('  - Styles type:', typeof data.design.styles);
        console.log('  - Variables présent?', !!data.design.variables);
        console.log('  - Variables type:', typeof data.design.variables);
        
        if (data.design.template) {
          console.log('  - Template keys:', Object.keys(data.design.template));
        }
      } else {
        console.log('❌ AUCUN DESIGN TROUVÉ DANS LA RÉPONSE');
      }
      console.log('═══════════════════════════════════════════');
      
      setInvitation(data);
    } catch (err) {
      console.error('❌ Erreur lors du chargement de l\'invitation:', err);
      setError('Erreur lors du chargement de l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invitationId) {
      fetchInvitationDesign();
    }
  }, [invitationId]);

  useEffect(() => {
    if (invitation && invitation.design) {
      renderInvitationTemplate();
    }
  }, [invitation]);

  const renderInvitationTemplate = () => {
    if (!invitation || !invitation.design) {
      console.log('❌ Pas de design à rendre');
      return;
    }

    console.log('🎨 Début du rendu du template...');
    console.log('📋 Design disponible:', {
      id: invitation.design.id,
      name: invitation.design.name,
      hasTemplate: !!invitation.design.template,
      hasStyles: !!invitation.design.styles,
      hasVariables: !!invitation.design.variables
    });

    try {
      const templateEngine = new TemplateEngine();
      
      // Utiliser la MÊME logique que RSVP pour le rendu
      const invitationData = {
        eventTitle: invitation.eventTitle || '',
        eventDate: invitation.eventDate ? new Date(invitation.eventDate) : new Date(),
        eventTime: invitation.eventTime || '',
        location: invitation.location || '',
        eventType: invitation.eventType || 'event',
        customText: invitation.customText || '',
        moreInfo: invitation.moreInfo || ''
      };

      console.log('📝 Données pour le rendu:', invitationData);

      // Rendre le template
      const renderedHtml = templateEngine.render(invitation.design, invitationData);
      console.log('✅ Template rendu avec succès, longueur HTML:', renderedHtml.length);
      setRenderedInvitation(renderedHtml);
    } catch (error) {
      console.error('❌ Erreur lors du rendu du template:', error);
      setRenderedInvitation('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return styles.statusPublished;
      case 'DRAFT':
        return styles.statusDraft;
      case 'ARCHIVED':
        return styles.statusArchived;
      default:
        return styles.statusDefault;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'Publiée';
      case 'DRAFT':
        return 'Brouillon';
      case 'ARCHIVED':
        return 'Archivée';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Chargement de l'invitation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <button onClick={fetchInvitationDesign} className={styles.retryButton}>
          Réessayer
        </button>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Invitation non trouvée</div>
      </div>
    );
  }

  // Vérifier si le design existe (pas besoin de vérifier renderedInvitation car il sera rempli par useEffect)
  const hasDesign = !!(invitation.design && invitation.design.template);

  return (
    <div className={styles.container}>
      {/* Header simple avec retour et statut */}
      <div className={styles.header}>
        <button 
          onClick={() => router.push(`/super-admin/invitations/${invitationId}`)} 
          className={styles.backButton}
        >
          <ArrowLeft className={styles.backIcon} />
          Retour
        </button>
        
        <h1 className={styles.title}>
          {invitation.eventTitle || 'Invitation'}
          <span className={styles.subtitle}>- Aperçu comme vu par les invités</span>
        </h1>
        
        <span className={`${styles.status} ${getStatusColor(invitation.status)}`}>
          {getStatusLabel(invitation.status)}
        </span>
      </div>

      {/* Rendu de l'invitation comme vue par les invités */}
      <div className={styles.content}>
        {hasDesign ? (
          <div className={styles.section}>
            {renderedInvitation ? (
              <div 
                className={styles.invitationRender}
                dangerouslySetInnerHTML={{
                  __html: renderedInvitation
                }}
              />
            ) : (
              <div className={styles.loading}>Rendu de l'invitation en cours...</div>
            )}
          </div>
        ) : (
          <div className={styles.section}>
            <div className={styles.noDesign}>
              <AlertTriangle className={styles.noDesignIcon} />
              <h3>Aucun design sélectionné</h3>
              <p>L'utilisateur n'a pas encore choisi de design pour cette invitation.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

