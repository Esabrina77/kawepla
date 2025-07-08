'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/apiClient';
import { renderTemplate, invitationToTemplateData } from '@/lib/templateEngine';
import styles from './invitation-design.module.css';

interface InvitationWithDesign {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  design: {
    id: string;
    name: string;
    template: any;
    styles: any;
    variables: any;
  };
  guests: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    invitationSentAt: string | null;
    createdAt: string;
    rsvp: {
      id: string;
      status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
      respondedAt: string | null;
    } | null;
  }>;
  _count: {
    guests: number;
    rsvps: number;
  };
}

export default function InvitationDesignPage() {
  const params = useParams();
  const router = useRouter();
  const invitationId = params.id as string;
  
  const [invitation, setInvitation] = useState<InvitationWithDesign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderedInvitation, setRenderedInvitation] = useState<string>('');

  const fetchInvitationWithDesign = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.get<InvitationWithDesign>(`/admin/invitations/${invitationId}/design`);
      setInvitation(data);

      // Rendre l'invitation avec le template engine
      if (data.design && data.design.template) {
        const templateData = invitationToTemplateData(data);
        const { html, css } = renderTemplate(
          {
            layout: data.design.template.layout,
            sections: data.design.template.sections,
            styles: data.design.styles,
            variables: data.design.variables
          },
          templateData,
          data.id
        );
        
        setRenderedInvitation(`<style>${css}</style>${html}`);
      }
    } catch (err) {
      console.error('Erreur lors du chargement de l\'invitation:', err);
      setError('Erreur lors du chargement de l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invitationId) {
      fetchInvitationWithDesign();
    }
  }, [invitationId]);

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
        <button onClick={fetchInvitationWithDesign} className={styles.retryButton}>
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          onClick={() => router.back()} 
          className={styles.backButton}
        >
          ← Retour
        </button>
        <div className={styles.headerInfo}>
          <h1>Design de l'invitation</h1>
          <div className={styles.invitationInfo}>
            <h2>{invitation.title}</h2>
            <span className={`${styles.status} ${getStatusColor(invitation.status)}`}>
              {getStatusLabel(invitation.status)}
            </span>
          </div>
          <p className={styles.creatorInfo}>
            Créée par {invitation.user.firstName} {invitation.user.lastName} ({invitation.user.email})
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.designSection}>
          <h3>Prévisualisation de l'invitation</h3>
          <div className={styles.designContainer}>
            {renderedInvitation ? (
              <div 
                className={styles.invitationPreview}
                dangerouslySetInnerHTML={{ __html: renderedInvitation }}
              />
            ) : (
              <div className={styles.noDesign}>
                <p>Aucun design associé à cette invitation</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.infoSection}>
          <h3>Informations du design</h3>
          <div className={styles.designInfo}>
            <div className={styles.infoCard}>
              <h4>Nom du design</h4>
              <p>{invitation.design?.name || 'Aucun nom'}</p>
            </div>
            <div className={styles.infoCard}>
              <h4>Nombre d'invités</h4>
              <p>{invitation._count.guests}</p>
            </div>
            <div className={styles.infoCard}>
              <h4>Nombre de RSVP</h4>
              <p>{invitation._count.rsvps}</p>
            </div>
            <div className={styles.infoCard}>
              <h4>Date de création</h4>
              <p>{new Date(invitation.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>

        <div className={styles.actionsSection}>
          <h3>Actions</h3>
          <div className={styles.actions}>
            <button 
              className={styles.actionButton}
              onClick={() => router.push(`/super-admin/invitations/${invitationId}`)}
            >
              Voir les détails
            </button>
            <button 
              className={styles.actionButton}
              onClick={() => router.push(`/rsvp/${invitationId}`)}
            >
              Voir la page publique
            </button>
            <button 
              className={styles.actionButton}
              onClick={() => {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>${invitation.title}</title>
                        <style>
                          body { margin: 0; padding: 20px; }
                          @media print {
                            body { padding: 0; }
                          }
                        </style>
                      </head>
                      <body>
                        ${renderedInvitation}
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.print();
                }
              }}
            >
              Imprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 