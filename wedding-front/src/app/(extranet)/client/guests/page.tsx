'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGuests } from '@/hooks/useGuests';
import { useInvitations } from '@/hooks/useInvitations';
import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { SubscriptionLimits } from '@/components/SubscriptionLimits/SubscriptionLimits';
import { apiClient } from '@/lib/api/apiClient';
import { guestsApi } from '@/lib/api/guests';
import PhoneInput from '@/components/PhoneInput/PhoneInput';
import { ConditionalTutorial } from '@/components/Tutorial/ConditionalTutorial';
import { guestsTutorialConfig } from '@/components/Tutorial/tutorialConfig';
import { Users, Plus, FolderOpen, Search, User, Star, UserPlus, Mail, Phone, Utensils, Trash2, CheckCircle, Clock, XCircle, Link2, Send, Bell, Edit3, ClipboardList, Copy, RefreshCw, Share2, AlertTriangle, Info, FileText, Upload, Loader, HelpCircle, FileUp } from 'lucide-react';
import styles from './guests.module.css';
import { Guest } from '@/types';
import PhotoModal from '@/components/PhotoModal/PhotoModal';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';

// Composant Modal personnalisé
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  showConfirm?: boolean;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

function CustomModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info',
  showConfirm = false,
  onConfirm,
  confirmText = 'Confirmer',
  cancelText = 'Annuler'
}: ModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className={styles.modalIcon} />;
      case 'error': return <XCircle className={styles.modalIcon} />;
      case 'warning': return <AlertTriangle className={styles.modalIcon} />;
      default: return <Info className={styles.modalIcon} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      default: return '#2196F3';
    }
  };

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader} style={{ borderBottom: `3px solid ${getColor()}` }}>
          <h3 style={{ color: getColor() }}>
            {getIcon()} {title}
          </h3>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>
          <p>{message}</p>
        </div>
        <div className={styles.modalFooter}>
          {showConfirm ? (
            <>
              <Button 
                onClick={() => {
                  onConfirm?.();
                  onClose();
                }}
                variant="primary"
              >
                {confirmText}
              </Button>
              <Button onClick={onClose} variant="outline">
                {cancelText}
              </Button>
            </>
          ) : (
            <Button onClick={onClose} variant="primary">
              OK
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook pour récupérer les invitations et permettre la sélection
function useInvitationSelection() {
  const { invitations, loading } = useInvitations();
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);
  
  // Sélectionner automatiquement la première invitation publiée, sinon la première
  useEffect(() => {
    if (invitations.length > 0 && !selectedInvitationId) {
      const publishedInvitation = invitations.find(inv => inv.status === 'PUBLISHED');
      const defaultInvitation = publishedInvitation || invitations[0];
      setSelectedInvitationId(defaultInvitation.id);
    }
  }, [invitations, selectedInvitationId]);

  const selectedInvitation = invitations.find(inv => inv.id === selectedInvitationId);

  return { 
    invitations,
    selectedInvitationId, 
    setSelectedInvitationId,
    selectedInvitation,
    loading 
  };
}

export default function GuestsPage() {
  const { 
    invitations, 
    selectedInvitationId, 
    setSelectedInvitationId, 
    selectedInvitation, 
    loading: loadingInvitations 
  } = useInvitationSelection();
  
  if (loadingInvitations) {
    return <div>Chargement des invitations...</div>;
  }

  if (invitations.length === 0) {
    return (
      <div className={styles.noInvitation}>
        <Card>
          <h2>Aucune invitation créée</h2>
          <p>Vous devez d'abord créer une invitation avant de pouvoir gérer vos invités.</p>
          <Link href="/client/invitations" className="inline-block">
            <Button variant="primary">
              Créer une invitation
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!selectedInvitationId || !selectedInvitation) {
    return <div>Sélection de l'invitation...</div>;
  }

  return (
    <div className={styles.guestsPage}>
      <ConditionalTutorial 
        config={guestsTutorialConfig} 
        condition={() => {
          // Vérifier que l'utilisateur a au moins une invitation
          return invitations.length > 0;
        }}
        delay={1500}
      />
      {/* Affichage des limites d'abonnement */}
      <div data-tutorial="subscription-limits">
      <SubscriptionLimits invitationId={selectedInvitationId} />
      </div>
      
      {/* Sélecteur d'invitation si plusieurs */}
      {invitations.length > 1 && (
        <div className={styles.invitationSelector}>
          <label htmlFor="invitation-select" className={styles.selectorLabel}>
            <ClipboardList className={styles.headerIcon} /> Sélectionner l'invitation à gérer
          </label>
          <div className={styles.invitationSelect}>
            <select 
              id="invitation-select"
              value={selectedInvitationId || ''} 
              onChange={(e) => setSelectedInvitationId(e.target.value)}
            >
              {invitations.map(invitation => (
                <option key={invitation.id} value={invitation.id}>
                  {invitation.coupleName || invitation.title} 
                  {invitation.weddingDate && ` - ${new Date(invitation.weddingDate).toLocaleDateString('fr-FR')}`}
                  {` • ${invitation.status === 'PUBLISHED' ? 'Publiée' : 'Brouillon'}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      {/* Gestion directe des invitations */}
      <InvitationManagement invitationId={selectedInvitationId} invitation={selectedInvitation} />


      
    </div>
  );
}

// Composant pour gérer les liens partageables
function ShareableLinkManager({ invitationId }: { invitationId: string }) {
  const [shareableLink, setShareableLink] = useState<{
    url: string;
    maxUses: number;
    usedCount: number;
    expiresAt?: Date;
    remainingGuests: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const { limits, usage, remaining } = useSubscriptionLimits();

  // Charger les statistiques du lien partageable existant
  useEffect(() => {
    const fetchShareableStats = async () => {
      try {
        const response = await apiClient.get(`/invitations/${invitationId}/shareable-stats`);
        const stats = response as any;
        
        if (stats.shareableEnabled && stats.shareableUrl) {
          setShareableLink({
            url: stats.shareableUrl,
            maxUses: stats.shareableMaxUses,
            usedCount: stats.shareableUsedCount,
            expiresAt: stats.shareableExpiresAt ? new Date(stats.shareableExpiresAt) : undefined,
            remainingGuests: remaining?.guests || 0
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      }
    };

    fetchShareableStats();
  }, [invitationId, remaining?.guests]);

  const generateShareableLink = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post(`/invitations/${invitationId}/generate-shareable-link`, {
        // Pas d'expiration - on n'envoie pas expiresAt
      });
      
      // Adapter la réponse du backend au format attendu par le frontend
      if (response) {
        const backendResponse = response as any;
        setShareableLink({
          url: backendResponse.shareableUrl,
          maxUses: backendResponse.maxUses,
          usedCount: backendResponse.usedCount,
          expiresAt: backendResponse.expiresAt ? new Date(backendResponse.expiresAt) : undefined,
          remainingGuests: remaining?.guests || 0
        });
      }
    } catch (error) {
      console.error('Erreur lors de la génération du lien:', error);
    } finally {
      setLoading(false);
    }
  };

  const regenerateShareableLink = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post(`/invitations/${invitationId}/generate-shareable-link`, {});
      
      if (response) {
        const backendResponse = response as any;
        const newLink = {
          url: backendResponse.shareableUrl,
          maxUses: backendResponse.maxUses,
          usedCount: backendResponse.usedCount,
          expiresAt: backendResponse.expiresAt ? new Date(backendResponse.expiresAt) : undefined,
          remainingGuests: remaining?.guests || 0
        };
        setShareableLink(newLink);
        return newLink.url;
      }
    } catch (error) {
      console.error('Erreur lors de la régénération du lien:', error);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const copyToClipboard = async () => {
    try {
      const newUrl = await regenerateShareableLink();
      if (newUrl) {
        await navigator.clipboard.writeText(newUrl);
        // On pourrait ajouter une notification de succès ici
      }
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const shareLink = async (url: string) => {
    const message = `Vous êtes invité à notre mariage ! Cliquez sur ce lien pour confirmer votre présence : ${url}`;
    
    // Utiliser l'API Web Share si disponible
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Invitation de mariage',
          text: message,
          url: url
        });
        await regenerateShareableLink();
      } catch (error) {
        console.log('Partage annulé ou erreur:', error);
      }
    } else {
      // Fallback : copier dans le presse-papier
      try {
        await navigator.clipboard.writeText(message);
        alert('Le message d\'invitation a été copié dans le presse-papier !');
        await regenerateShareableLink();
      } catch (error) {
        console.error('Erreur lors de la copie:', error);
      }
    }
  };

  return (
    <div className={styles.shareableContent}>
      {!shareableLink ? (
        <div className={styles.generateSection}>
          <p>Créez un lien unique que vous pouvez partager avec vos invités.</p>
          <Button 
            onClick={generateShareableLink} 
            variant="primary"
            disabled={loading || (remaining?.guests || 0) <= 0}
          >
            {loading ? <Loader className={styles.spinIcon} /> : <Link2 className={styles.buttonIcon} />} Générer un lien partageable
            {(remaining?.guests || 0) <= 0 && <span className={styles.limitReached}> (Limite atteinte)</span>}
          </Button>
          {(remaining?.guests || 0) <= 0 && (
            <p className={styles.warningText}>
              <AlertTriangle className={styles.warningIcon} /> Vous avez atteint la limite d'invités de votre forfait
            </p>
          )}
        </div>
      ) : (
        <div className={styles.shareableLinkInfo}>
          {/* Explication importante sur l'utilisation */}
          <div className={styles.importantNotice}>
            <div className={styles.noticeIcon}><HelpCircle className={styles.infoIcon} /></div>
            <div className={styles.noticeContent}>
              Partagez ce lien avec votre invité. Chaque lien est personnel et permet de répondre facilement à l'invitation.
            </div>
          </div>
          
          <div className={styles.linkDisplay}>
            <input 
              type="text" 
              value={shareableLink.url} 
              readOnly 
              className={styles.linkInput}
            />
            <Button 
              onClick={copyToClipboard}
              variant="outline"
              className={styles.copyButton}
            >
              <Copy className={styles.buttonIcon} /> Copier le lien
            </Button>
          </div>
          
          <div className={styles.shareStats}>
            <div className={styles.usageStats}>
              <div className={styles.usageCount}>
                <span>Utilisé {shareableLink.usedCount} fois</span>
              </div>
              <div className={styles.remainingCount}>
                <span>{remaining?.guests || 0} invités restants sur {limits?.guests || 0}</span>
              </div>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ 
                  width: `${((usage?.guests || 0) / (limits?.guests || 1)) * 100}%`,
                  backgroundColor: (remaining?.guests || 0) <= 10 ? '#ff4444' : '#4CAF50'
                }}
              />
            </div>
          </div>
          
          <div className={styles.shareButtons}>
            <Button 
              onClick={regenerateShareableLink} 
              variant="primary"
              disabled={loading || (remaining?.guests || 0) <= 0}
            >
              <RefreshCw className={styles.buttonIcon} /> Générer un nouveau lien
            </Button>
            <Button 
              onClick={() => shareLink(shareableLink.url)} 
              variant="outline"
              disabled={(remaining?.guests || 0) <= 0}
            >
              <Share2 className={styles.buttonIcon} /> Partager
            </Button>
          </div>

          {(remaining?.guests || 0) <= 10 && (
            <div className={styles.warningText}>
              <AlertTriangle className={styles.warningIcon} /> Il ne vous reste que {remaining?.guests} invités disponibles
          </div>
          )}
        </div>
      )}
    </div>
  );
}

type GuestHookProps = ReturnType<typeof useGuests>;

function GuestsList({ invitationId, invitation, ...guestProps }: { invitationId: string, invitation: any } & GuestHookProps) {
  const {
    guests,
    statistics,
    loading,
    error,
    createGuest,
    updateGuest,
    deleteGuest,
    importGuests,
    loadGuests
  } = guestProps;

  const [showAddForm, setShowAddForm] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [emailResults, setEmailResults] = useState<any>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [importPreview, setImportPreview] = useState<any>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; alt: string } | null>(null);
  
  // États pour les modals
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    showConfirm?: boolean;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Fonctions utilitaires pour les modals
  const showModal = (
    title: string, 
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    options?: {
      showConfirm?: boolean;
      onConfirm?: () => void;
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      ...options
    });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isVIP: false,
    dietaryRestrictions: '',
    plusOne: false,
    plusOneName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client selon les règles du backend
    if (!formData.firstName || formData.firstName.trim().length < 2) {
      showModal('Erreur de validation', 'Le prénom est requis (minimum 2 caractères)', 'error');
      return;
    }
    if (!formData.lastName || formData.lastName.trim().length < 2) {
      showModal('Erreur de validation', 'Le nom est requis (minimum 2 caractères)', 'error');
      return;
    }
    
    // Au moins un moyen de contact requis
    const hasEmail = formData.email && formData.email.trim();
    const hasPhone = formData.phone && formData.phone.trim();
    if (!hasEmail && !hasPhone) {
      showModal('Erreur de validation', 'Au moins un email ou un téléphone est requis', 'error');
      return;
    }
    
    // Validation email si fourni
    if (hasEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        showModal('Erreur de validation', 'Format d\'email invalide', 'error');
        return;
      }
      
      // Vérifier l'unicité de l'email
      const emailExists = guests.some((guest) => 
        guest.email && guest.email.toLowerCase() === formData.email.trim().toLowerCase()
      );
      if (emailExists) {
        showModal('Erreur de validation', 'Cet email est déjà utilisé par un autre invité', 'error');
        return;
      }
    }
    
    // Validation téléphone si fourni
    if (hasPhone) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        showModal('Erreur de validation', 'Format de téléphone invalide (minimum 8 caractères, chiffres/espaces/+/-/() autorisés)', 'error');
        return;
      }
    }
    
    try {
      await createGuest(formData);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        isVIP: false,
        dietaryRestrictions: '',
        plusOne: false,
        plusOneName: ''
      });
      setShowAddForm(false);
      showModal('Succès', 'Invité ajouté avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de la création de l\'invité:', error);
      // Vérifier si l'erreur vient d'un email dupliqué
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création de l\'invité';
      if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('unique')) {
        showModal('Erreur', 'Cet email est déjà utilisé par un autre invité', 'error');
      } else {
        showModal('Erreur', errorMessage, 'error');
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await importGuests(file);
      console.log(`${result.imported} invités importés`);
      if (result.errors.length > 0) {
        console.error('Erreurs lors de l\'import:', result.errors);
      }
    } catch (error) {
      console.error('Erreur lors de l\'import du fichier:', error);
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    showModal(
      'Confirmation de suppression',
      'Êtes-vous sûr de vouloir supprimer cet invité ?',
      'warning',
      {
        showConfirm: true,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        onConfirm: async () => {
          try {
            await deleteGuest(guestId);
            showModal('Succès', 'Invité supprimé avec succès', 'success');
          } catch (error) {
            console.error('Erreur lors de la suppression de l\'invité:', error);
            showModal('Erreur', 'Erreur lors de la suppression de l\'invité', 'error');
          }
        }
      }
    );
  };

  // Envoyer une invitation à un invité spécifique
  const sendInvitationToGuest = async (guestId: string) => {
    try {
      await apiClient.post(`/guests/${guestId}/send-invitation`);
      showModal('Succès', 'Invitation envoyée avec succès !', 'success');
      // Recharger la liste des invités pour mettre à jour les statuts
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'invitation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi de l\'invitation';
      
      // Messages d'erreur plus spécifiques
      if (errorMessage.toLowerCase().includes('email')) {
        showModal('Erreur d\'email', 'Problème avec l\'adresse email de cet invité', 'error');
      } else if (errorMessage.toLowerCase().includes('published')) {
        showModal('Erreur', 'L\'invitation doit être publiée avant d\'envoyer les emails', 'error');
      } else {
        showModal('Erreur', errorMessage, 'error');
      }
    }
  };

  // Envoyer un rappel à un invité
  const sendReminderToGuest = async (guestId: string) => {
    try {
      await apiClient.post(`/guests/${guestId}/send-reminder`);
      showModal('Succès', 'Rappel envoyé avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du rappel:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi du rappel';
      
      // Messages d'erreur plus spécifiques
      if (errorMessage.toLowerCase().includes('email')) {
        showModal('Erreur d\'email', 'Problème avec l\'adresse email de cet invité', 'error');
      } else if (errorMessage.toLowerCase().includes('répondu')) {
        showModal('Information', 'Cet invité a déjà répondu à l\'invitation', 'info');
      } else {
        showModal('Erreur', errorMessage, 'error');
      }
    }
  };

  // Envoyer toutes les invitations
  const sendAllInvitations = async () => {
    showModal(
      'Confirmation d\'envoi',
      'Êtes-vous sûr de vouloir envoyer toutes les invitations par email ?',
      'warning',
      {
        showConfirm: true,
        confirmText: 'Envoyer',
        cancelText: 'Annuler',
        onConfirm: async () => {
          setSendingEmails(true);
          try {
            const response = await apiClient.post<{
              sent: number;
              failed: Array<{guestId: string; guestName: string; error: string}>;
            }>(`/invitations/${invitationId}/guests/send-all`);
            setEmailResults(response);
            
            let message = '';
            let type: 'success' | 'warning' | 'error' = 'success';
            
            if (response.sent > 0) {
              message = `✅ ${response.sent} invitation(s) envoyée(s) avec succès !`;
            }
            
            if (response.failed.length > 0) {
              message += `\n❌ ${response.failed.length} échec(s) d'envoi:`;
              
              // Regrouper les erreurs par type
              const errorsByType = response.failed.reduce((acc, failure) => {
                const errorType = failure.error.toLowerCase().includes('email') ? 'email' : 'autre';
                if (!acc[errorType]) acc[errorType] = [];
                acc[errorType].push(failure);
                return acc;
              }, {} as Record<string, typeof response.failed>);
              
              // Afficher les erreurs d'email
              if (errorsByType.email) {
                message += '\n\n📧 Problèmes d\'email:';
                errorsByType.email.forEach(failure => {
                  message += `\n• ${failure.guestName}: ${failure.error}`;
                });
              }
              
              // Afficher les autres erreurs
              if (errorsByType.autre) {
                message += '\n\n⚠️ Autres erreurs:';
                errorsByType.autre.forEach(failure => {
                  message += `\n• ${failure.guestName}: ${failure.error}`;
                });
              }
              
              type = response.sent > 0 ? 'warning' : 'error';
            }
            
            showModal(
              response.sent > 0 ? 'Envoi terminé' : 'Échec de l\'envoi',
              message,
              type
            );
            
            // Recharger la liste des invités
            window.location.reload();
          } catch (error) {
            console.error('Erreur lors de l\'envoi des invitations:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi des invitations';
            showModal('Erreur', errorMessage, 'error');
          } finally {
            setSendingEmails(false);
          }
        }
      }
    );
  };

  // Prévisualiser un fichier d'import
  const handleFilePreview = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.postFormData<{
        totalGuests: number;
        validGuests: number;
        errors: Array<{line: number; error: string}>;
        preview: Array<{firstName: string; lastName: string; email: string; isVIP?: boolean; plusOne?: boolean}>;
      }>(`/invitations/${invitationId}/guests/preview-import`, formData);
      
      setImportPreview(response);
      setImportFile(file);
      
      // Afficher les erreurs de prévisualisation si présentes
      if (response.errors && response.errors.length > 0) {
        const duplicateEmails = response.errors.filter(err => 
          err.error.toLowerCase().includes('email') && 
          (err.error.toLowerCase().includes('déjà utilisé') || err.error.toLowerCase().includes('plusieurs fois'))
        );
        
        const otherErrors = response.errors.filter(err => 
          !err.error.toLowerCase().includes('email') || 
          (!err.error.toLowerCase().includes('déjà utilisé') && !err.error.toLowerCase().includes('plusieurs fois'))
        );
        
        let errorMessage = `${response.errors.length} erreur(s) détectée(s) dans le fichier:\n\n`;
        
        if (duplicateEmails.length > 0) {
          errorMessage += '📧 Emails en doublon:\n';
          duplicateEmails.forEach(err => {
            errorMessage += `• Ligne ${err.line}: ${err.error}\n`;
          });
        }
        
        if (otherErrors.length > 0) {
          errorMessage += '\n⚠️ Autres erreurs:\n';
          otherErrors.forEach(err => {
            errorMessage += `• Ligne ${err.line}: ${err.error}\n`;
          });
        }
        
        errorMessage += `\nSeuls ${response.validGuests} invité(s) sur ${response.totalGuests} pourront être importés.`;
        
        showModal(
          'Erreurs détectées dans le fichier',
          errorMessage,
          'warning'
        );
      }
    } catch (error) {
      console.error('Erreur lors de la prévisualisation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la prévisualisation du fichier';
      showModal('Erreur', errorMessage, 'error');
    }
  };

  // Confirmer l'import
  const confirmImport = async () => {
    if (!importFile) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const response = await apiClient.postFormData<{
        imported: number;
        failed: number;
        errors: Array<{line: number; error: string; data?: any}>;
      }>(`/invitations/${invitationId}/guests/bulk-import`, formData);

      // Préparer le message de résultat
      let message = '';
      let type: 'success' | 'warning' | 'error' = 'success';
      
      if (response.imported > 0) {
        message = `✅ ${response.imported} invité(s) importé(s) avec succès !`;
      }
      
      if (response.failed > 0) {
        message += `\n❌ ${response.failed} invité(s) n'ont pas pu être importés.`;
        type = response.imported > 0 ? 'warning' : 'error';
      }
      
      // Afficher les erreurs détaillées
      if (response.errors && response.errors.length > 0) {
        const duplicateEmails = response.errors.filter(err => 
          err.error.toLowerCase().includes('email') && 
          (err.error.toLowerCase().includes('déjà utilisé') || err.error.toLowerCase().includes('plusieurs fois'))
        );
        
        const otherErrors = response.errors.filter(err => 
          !err.error.toLowerCase().includes('email') || 
          (!err.error.toLowerCase().includes('déjà utilisé') && !err.error.toLowerCase().includes('plusieurs fois'))
        );
        
        let errorDetails = '';
        
        if (duplicateEmails.length > 0) {
          errorDetails += '\n\n📧 Emails en doublon:\n';
          duplicateEmails.forEach(err => {
            errorDetails += `• Ligne ${err.line}: ${err.error}\n`;
          });
        }
        
        if (otherErrors.length > 0) {
          errorDetails += '\n\n⚠️ Autres erreurs:\n';
          otherErrors.forEach(err => {
            errorDetails += `• Ligne ${err.line}: ${err.error}\n`;
          });
        }
        
        message += errorDetails;
      }
      
      showModal(
        response.imported > 0 ? 'Import terminé' : 'Échec de l\'import',
        message,
        type
      );

      // Réinitialiser et recharger seulement si au moins un invité a été importé
      if (response.imported > 0) {
        setImportPreview(null);
        setImportFile(null);
        setShowBulkImport(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'import';
      showModal('Erreur', errorMessage, 'error');
    } finally {
      setImporting(false);
    }
  };

  // Télécharger un template
  const downloadTemplate = (format: 'csv' | 'json' | 'txt') => {
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'csv':
        content = 'firstName,lastName,email,phone,isVIP,dietaryRestrictions,plusOne,plusOneName\n' +
                 'Sabrina,Eloundou,sabrinaeloundou33@gmail.com,0123456789,false,Végétarien,true,Marie Antana\n' +
                 'Pamela,Simo,pamelasimo77@gmail.com,0987654321,true,Aucune,false,\n' +
                 'Jean,Dupont,jean.dupont@email.com,+33612345678,false,,false,\n' +
                 'Marie,Martin,,0987654321,true,Sans gluten,true,Pierre Martin';
        filename = 'template_invites.csv';
        mimeType = 'text/csv';
        break;
        
      case 'json':
        content = JSON.stringify([
          {
            "firstName": "Sabrina",
            "lastName": "Eloundou", 
            "email": "sabrinaeloundou33@gmail.com",
            "phone": "0123456789",
            "isVIP": false,
            "dietaryRestrictions": "Végétarien",
            "plusOne": true,
            "plusOneName": "Marie Antana"
          },
          {
            "firstName": "Pamela",
            "lastName": "Simo",
            "email": "pamelasimo77@gmail.com", 
            "phone": "0987654321",
            "isVIP": true,
            "dietaryRestrictions": "Aucune",
            "plusOne": false,
            "plusOneName": ""
          },
          {
            "firstName": "Jean",
            "lastName": "Dupont",
            "email": "jean.dupont@email.com",
            "phone": "+33612345678",
            "isVIP": false,
            "dietaryRestrictions": "",
            "plusOne": false,
            "plusOneName": ""
          },
          {
            "firstName": "Marie",
            "lastName": "Martin",
            "email": "",
            "phone": "0987654321",
            "isVIP": true,
            "dietaryRestrictions": "Sans gluten",
            "plusOne": true,
            "plusOneName": "Pierre Martin"
          }
        ], null, 2);
        filename = 'template_invites.json';
        mimeType = 'application/json';
        break;
        
      case 'txt':
        content = 'Sabrina,Eloundou,sabrinaeloundou33@gmail.com,0123456789,false,Végétarien,true,Marie Antana\n' +
                 'Pamela,Simo,pamelasimo77@gmail.com,0987654321,true,Aucune,false,\n' +
                 'Jean,Dupont,jean.dupont@email.com,+33612345678,false,,false,\n' +
                 'Marie,Martin,,0987654321,true,Sans gluten,true,Pierre Martin';
        filename = 'template_invites.txt';
        mimeType = 'text/plain';
        break;
    }

    // Créer un blob avec le contenu
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Nettoyer
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Envoi en masse après import
  const bulkSendAfterImport = async (guestIds?: string[]) => {
    showModal(
      'Confirmation d\'envoi en masse',
      'Envoyer les invitations à tous les invités importés ?',
      'warning',
      {
        showConfirm: true,
        confirmText: 'Envoyer',
        cancelText: 'Annuler',
        onConfirm: async () => {
          setSendingEmails(true);
          try {
            const response = await apiClient.post<{
              sent: number;
              failed: Array<{guestId: string; guestName: string; error: string}>;
              skipped: Array<{guestId: string; guestName: string; reason: string}>;
            }>(`/invitations/${invitationId}/guests/bulk-send`, {
              guestIds
            });
            
            let message = '';
            let type: 'success' | 'warning' | 'error' = 'success';
            
            if (response.sent > 0) {
              message = `✅ ${response.sent} invitation(s) envoyée(s) avec succès !`;
            }
            
            if (response.skipped && response.skipped.length > 0) {
              message += `\n⏭️ ${response.skipped.length} invité(s) ignoré(s):`;
              response.skipped.forEach(skip => {
                message += `\n• ${skip.guestName}: ${skip.reason}`;
              });
            }
            
            if (response.failed && response.failed.length > 0) {
              message += `\n❌ ${response.failed.length} échec(s) d'envoi:`;
              response.failed.forEach(failure => {
                message += `\n• ${failure.guestName}: ${failure.error}`;
              });
              type = response.sent > 0 ? 'warning' : 'error';
            }
            
            showModal(
              response.sent > 0 ? 'Envoi terminé' : 'Échec de l\'envoi',
              message,
              type
            );
            
            window.location.reload();
          } catch (error) {
            console.error('Erreur lors de l\'envoi en masse:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi';
            showModal('Erreur', errorMessage, 'error');
          } finally {
            setSendingEmails(false);
          }
        }
      }
    );
  };

  const getGuestCount = (guest: Guest) => {
    return guest.rsvp?.numberOfGuests || (guest.rsvp as any)?.attendees || 1;
  };

  const getGuestStatus = (guest: Guest) => {
    if (!guest.rsvp) return 'En attente';
      switch (guest.rsvp.status) {
        case 'CONFIRMED': return 'Confirmé';
      case 'DECLINED': return 'Décliné';
        default: return 'En attente';
      }
  };

  const getGuestStatusColor = (guest: Guest) => {
    if (!guest.rsvp) return '#f59e0b';
      switch (guest.rsvp.status) {
      case 'CONFIRMED': return '#10b981';
      case 'DECLINED': return '#ef4444';
      default: return '#f59e0b';
    }
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
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Une erreur est survenue</div>;
  }

  const canSendEmails = invitation?.status === 'PUBLISHED';
  const guestsWithEmails = guests.filter((g) => g.email);

  // Filtrer les invités selon la recherche
  const filteredGuests = guests.filter((guest) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    const fullName = `${guest.firstName} ${guest.lastName}`.toLowerCase();
    const email = guest.email?.toLowerCase() || '';
    const phone = guest.phone?.toLowerCase() || '';
    const restrictions = guest.dietaryRestrictions?.toLowerCase() || '';
    const plusOneName = guest.plusOneName?.toLowerCase() || '';
    
    return (
      fullName.includes(query) ||
      email.includes(query) ||
      phone.includes(query) ||
      restrictions.includes(query) ||
      plusOneName.includes(query)
    );
  });

  const { limits, usage, remaining } = useSubscriptionLimits();

  // Vérifier si on peut ajouter des invités
  const canAddGuests = (remaining?.guests || 0) > 0;

  return (
    <div className={styles.guestsPage}>
      <div className={styles.header}>
        <h1>Gestion des invités</h1>
        {invitation?.status === 'PUBLISHED' && (
          <div className={styles.actions}>
            <Button 
              onClick={() => setShowAddForm(true)} 
              variant="primary" 
              data-tutorial="add-guest"
              disabled={!canAddGuests}
            >
              <Plus className={styles.buttonIcon} /> Ajouter un invité
              {!canAddGuests && <span className={styles.limitReached}> (Limite atteinte)</span>}
            </Button>
            <Button 
              onClick={() => setShowBulkImport(true)} 
              variant="outline" 
              data-tutorial="import-guests"
              disabled={!canAddGuests}
            >
              <FolderOpen className={styles.buttonIcon} /> Import en masse
              {!canAddGuests && <span className={styles.limitReached}> (Limite atteinte)</span>}
            </Button>
          </div>
        )}
      </div>

      {invitation?.status !== 'PUBLISHED' && (
        <div className={styles.restrictedAccess}>
          <div className={styles.restrictedIcon}>
            <AlertTriangle className={styles.warningIcon} />
          </div>
          <h3>Invitation non publiée</h3>
          <p>Vous devez d'abord publier votre invitation pour pouvoir ajouter des invités et envoyer des invitations par email.</p>
          <div className={styles.restrictedActions}>
            <Button 
              onClick={() => window.location.href = '/client/invitations'} 
              variant="primary"
            >
              Publier mon invitation
            </Button>
          </div>
        </div>
      )}

      {/* Modal d'import en masse */}
      {showBulkImport && (
        <div 
          className={styles.modal}
          onClick={(e) => {
            // Fermer le modal si on clique sur l'overlay (pas sur le contenu)
            if (e.target === e.currentTarget) {
              setShowBulkImport(false);
              setImportPreview(null);
              setImportFile(null);
            }
          }}
        >
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2><FolderOpen className={styles.headerIcon} /> Import en masse d'invités</h2>
              <button 
                className={styles.closeButton}
                onClick={() => {
                  setShowBulkImport(false);
                  setImportPreview(null);
                  setImportFile(null);
                }}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {!importPreview ? (
                <div className={styles.importStep}>
                  <h3><FileText className={styles.headerIcon} /> 1. Téléchargez un template</h3>
                  <div className={styles.templateButtons}>
                    <Button onClick={() => downloadTemplate('csv')} variant="outline">
                      <FileText className={styles.buttonIcon} /> Template CSV
                    </Button>
                    <Button onClick={() => downloadTemplate('json')} variant="outline">
                      <FileText className={styles.buttonIcon} /> Template JSON
                    </Button>
                    <Button onClick={() => downloadTemplate('txt')} variant="outline">
                      <FileText className={styles.buttonIcon} /> Template TXT
                    </Button>
                  </div>

                  <h3><FileText className={styles.headerIcon} /> 2. Remplissez le fichier</h3>
                  <div className={styles.formatInfo}>
                    <h4>📋 Règles de validation :</h4>
                    <ul>
                      <li><strong>Prénom et Nom :</strong> Obligatoires, minimum 2 caractères chacun</li>
                      <li><strong>Contact :</strong> Au moins un email OU un téléphone requis</li>
                      <li><strong>Email :</strong> Format valide (ex: nom@domaine.com) si fourni</li>
                      <li><strong>Téléphone :</strong> Minimum 8 caractères, chiffres/espaces/+/-/() autorisés</li>
                      <li><strong>isVIP :</strong> true/false ou 1/0</li>
                      <li><strong>plusOne :</strong> true/false ou 1/0</li>
                    </ul>
                    
                    <h4>💡 Format CSV (recommandé) :</h4>
                    <code>firstName,lastName,email,phone,isVIP,dietaryRestrictions,plusOne,plusOneName</code>
                    <p><em>Note: La première ligne d'en-têtes est automatiquement ignorée</em></p>
                    
                    <h4>📝 Format TXT :</h4>
                    <code>Prénom,Nom,email,téléphone,isVIP,restrictions,plusOne,nomAccompagnant</code>
                    <p><em>Chaque ligne = un invité, valeurs séparées par des virgules</em></p>
                    
                    <h4>🔧 Format JSON :</h4>
                    <pre>{`[
  {
    "firstName": "Sabrina",
    "lastName": "Eloundou",
    "email": "sabrina@gmail.com",
    "phone": "0123456789",
    "isVIP": false,
    "dietaryRestrictions": "Végétarien",
    "plusOne": true,
    "plusOneName": "Marie"
  }
]`}</pre>
                    
                    <h4>⚠️ Exemples valides :</h4>
                    <ul>
                      <li>✅ Avec email seul : <code>Jean,Dupont,jean@email.com,,false,,false,</code></li>
                      <li>✅ Avec téléphone seul : <code>Marie,Martin,,0123456789,true,,false,</code></li>
                      <li>✅ Avec les deux : <code>Paul,Durand,paul@email.com,+33612345678,false,,true,Sophie</code></li>
                      <li>❌ Sans contact : <code>Pierre,Blanc,,,false,,false,</code></li>
                    </ul>
                  </div>

                  <h3><Upload className={styles.headerIcon} /> 3. Uploadez votre fichier</h3>
                  <div className={styles.uploadArea}>
            <input
              type="file"
                      accept=".csv,.json,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFilePreview(file);
                      }}
              style={{ display: 'none' }}
                      id="bulkUpload"
                    />
                    <Button 
                      onClick={() => document.getElementById('bulkUpload')?.click()}
                      variant="primary"
                    >
                      <FileUp className={styles.buttonIcon} /> Choisir un fichier
                    </Button>
                    <p>Formats supportés: CSV, JSON, TXT (max 5MB)</p>
                  </div>
                </div>
              ) : (
                <div className={styles.previewStep}>
                  <h3>👀 Prévisualisation de l'import</h3>
                  
                  <div className={styles.previewStats}>
                    <div className={styles.statItem}>
                      <span><CheckCircle className={styles.statIcon} /> Invités valides</span>
                      <strong>{importPreview.validGuests || importPreview.totalGuests}</strong>
                    </div>
                    <div className={styles.statItem}>
                      <span><AlertTriangle className={styles.statIcon} /> Erreurs</span>
                      <strong>{importPreview.errors.length}</strong>
                    </div>
                  </div>

                  {importPreview.errors.length > 0 && (
                    <div className={styles.errors}>
                      <h4>❌ Erreurs détectées :</h4>
                      <div className={styles.errorList}>
                        {importPreview.errors.slice(0, 5).map((error: any, index: number) => (
                          <div key={index} className={styles.errorItem}>
                            <strong>Ligne {error.line}:</strong> {error.error}
                          </div>
                        ))}
                        {importPreview.errors.length > 5 && (
                          <p>... et {importPreview.errors.length - 5} autres erreurs</p>
                        )}
                      </div>
                    </div>
                  )}

                  {importPreview.preview.length > 0 && (
                    <div className={styles.preview}>
                      <h4>👥 Aperçu des invités (10 premiers) :</h4>
                      <div className={styles.previewList}>
                        {importPreview.preview.map((guest: any, index: number) => (
                          <div key={index} className={styles.previewItem}>
                            <strong>{guest.firstName} {guest.lastName}</strong>
                            <span>{guest.email}</span>
                            {guest.isVIP && <span className={styles.vipBadge}>⭐ VIP</span>}
                            {guest.plusOne && <span className={styles.plusOneBadge}>👥 +1</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.previewActions}>
                    <Button 
                      onClick={confirmImport}
                      variant="primary"
                      disabled={importing || (importPreview.validGuests || importPreview.totalGuests) === 0}
                    >
                      {importing ? (
                        <>
                          <Loader className={styles.spinIcon} /> Import en cours...
                        </>
                      ) : (
                        <>
                          <CheckCircle className={styles.buttonIcon} /> Confirmer l'import ({importPreview.validGuests || importPreview.totalGuests} invités)
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={() => {
                        setImportPreview(null);
                        setImportFile(null);
                      }}
                      variant="outline"
                    >
                      🔄 Choisir un autre fichier
            </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Barre de recherche */}
      <div className={styles.searchSection}>
        <Card>
          <div className={styles.searchContainer}>
            <div className={styles.searchInputWrapper}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Rechercher un invité (nom, email, téléphone...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={styles.clearSearch}
                  title="Effacer la recherche"
                >
                  <XCircle size={16} />
                </button>
              )}
            </div>
            {searchQuery && (
              <div className={styles.searchResults}>
                {filteredGuests.length} invité(s) trouvé(s) sur {guests.length}
              </div>
            )}
          </div>
        </Card>
      </div>



      {showAddForm && (
        <div className={styles.addForm}>
          <Card>
            <h2><UserPlus className={styles.headerIcon} /> Ajouter un invité</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Prénom *"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  minLength={2}
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Nom *"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  minLength={2}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <PhoneInput
                  value={formData.phone}
                  onChange={(value: string) => setFormData(prev => ({ ...prev, phone: value }))}
                  placeholder="Téléphone"
                  name="phone"
                  required={!formData.email}
                />
                <div className={styles.checkboxGroup}>
                  <label>
                    <input
                      type="checkbox"
                      name="isVIP"
                      checked={formData.isVIP}
                      onChange={handleInputChange}
                    />
                    <Star className={styles.checkboxIcon} /> Invité VIP
                  </label>
                <label>
                  <input
                    type="checkbox"
                      name="plusOne"
                      checked={formData.plusOne}
                      onChange={handleInputChange}
                    />
                    <Users className={styles.checkboxIcon} /> Accompagné
                  </label>
                </div>
                {formData.plusOne && (
                  <input
                    type="text"
                    name="plusOneName"
                    placeholder="Nom de l'accompagnant"
                    value={formData.plusOneName}
                    onChange={handleInputChange}
                  />
                )}
                <textarea
                  name="dietaryRestrictions"
                  placeholder="Restrictions alimentaires (optionnel)"
                  value={formData.dietaryRestrictions}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>
              <div className={styles.formActions}>
                <Button type="submit" variant="primary" disabled={!canAddGuests}>
                  <UserPlus className={styles.buttonIcon} /> Ajouter l'invité
                  {!canAddGuests && <span className={styles.limitReached}> (Limite atteinte)</span>}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  <XCircle className={styles.buttonIcon} /> Annuler
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <div className={styles.guestsList} data-tutorial="guests-list">
        <h2><Users className={styles.headerIcon} /> Liste des invités ({searchQuery ? `${filteredGuests.length} sur ${guests.length}` : guests.length})</h2>
        <div className={styles.guestsGrid}>
          {filteredGuests.map((guest) => (
          <Card key={guest.id} className={styles.guestCard}>
            <div className={styles.guestInfo}>
                <div className={styles.guestHeader}>
                  {(guest.profilePhotoUrl || (guest as any).rsvp?.profilePhotoUrl) && (
                    <div className={styles.guestPhotoSection}>
                      <img 
                        src={guest.profilePhotoUrl || (guest as any).rsvp?.profilePhotoUrl} 
                        alt={`Photo de ${guest.firstName} ${guest.lastName}`} 
                        className={`${styles.guestPhoto} cursor-pointer hover:opacity-80 transition-opacity`}
                        onClick={() => handlePhotoClick(guest.profilePhotoUrl || (guest as any).rsvp?.profilePhotoUrl, `Photo de ${guest.firstName} ${guest.lastName}`)}
                      />
                    </div>
                  )}
                  <div className={styles.guestNameSection}>
                  <h3>
                    {guest.firstName} {guest.lastName}
                      {guest.isVIP && <span className={styles.vipBadge}><Star className={styles.badgeIcon} /> VIP</span>}
                      {guest.rsvp?.status === 'CONFIRMED' && getGuestCount(guest) > 2 && (
                        <span className={styles.groupBadge}><Users className={styles.badgeIcon} /> Groupe ({getGuestCount(guest)})</span>
                      )}
                      {guest.rsvp?.status === 'CONFIRMED' && getGuestCount(guest) === 2 && (
                        <span className={styles.plusOneBadge}><Users className={styles.badgeIcon} /> +1</span>
                      )}
                  </h3>
                  <div 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getGuestStatusColor(guest) }}
                  >
                    {getGuestStatus(guest)}
                    </div>
                  </div>
                </div>
                
                <div className={styles.guestDetails}>
                  {guest.email && <p><Mail className={styles.detailIcon} /> {guest.email}</p>}
                  {guest.phone && <p><Phone className={styles.detailIcon} /> {guest.phone}</p>}
              {guest.dietaryRestrictions && (
                    <p className={styles.dietaryRestrictions}>
                      <Utensils className={styles.detailIcon} /> {guest.dietaryRestrictions}
                    </p>
                  )}
                  {guest.invitationSentAt && (
                    <p className={styles.sentDate}>
                      <CheckCircle className={styles.detailIcon} /> Envoyée le {new Date(guest.invitationSentAt).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                  {guest.usedAt && (
                    <p className={styles.usedDate}>
                      <Clock className={styles.detailIcon} /> Répondu le {new Date(guest.usedAt).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
              </div>
              
            <div className={styles.guestActions}>
                {canSendEmails && guest.email && (guest as any).invitationType !== 'SHAREABLE' && (
                  <div className={styles.emailActions}>
                    {!guest.invitationSentAt && (
                      <Button
                        onClick={() => sendInvitationToGuest(guest.id)}
                        variant="primary"
                        size="small"
                      >
                        <Send className={styles.actionIcon} /> Envoyer invitation
                      </Button>
                    )}
                    {guest.invitationSentAt && !guest.rsvp && (
                      <Button
                        onClick={() => sendReminderToGuest(guest.id)}
                        variant="outline"
                        size="small"
                      >
                        <Bell className={styles.actionIcon} /> Envoyer rappel
                      </Button>
                    )}
                  </div>
                )}
                {(guest as any).invitationType === 'SHAREABLE' && (
                  <div className={styles.shareableInfo}>
                    <span className={styles.shareableBadge}><Link2 className={styles.badgeIcon} /> Via lien partageable</span>
                  </div>
                )}
              <Button
                variant="danger"
                onClick={() => handleDeleteGuest(guest.id)}
                size="small"
              >
                  <Trash2 className={styles.actionIcon} /> Supprimer
              </Button>
            </div>
          </Card>
        ))}
          
          {filteredGuests.length === 0 && guests.length > 0 && (
            <Card className={styles.emptyState}>
              <h3>Aucun invité trouvé</h3>
              <p>Aucun invité ne correspond à votre recherche "{searchQuery}".</p>
              <Button onClick={() => setSearchQuery('')} variant="primary">
                <RefreshCw className={styles.buttonIcon} /> Effacer la recherche
              </Button>
            </Card>
          )}
          
          {guests.length === 0 && (
            <Card className={styles.emptyState}>
              <h3>Aucun invité ajouté</h3>
              <p>Commencez par ajouter vos premiers invités pour pouvoir envoyer les invitations.</p>
              <Button onClick={() => setShowAddForm(true)} variant="primary">
                <UserPlus className={styles.buttonIcon} /> Ajouter le premier invité
              </Button>
            </Card>
          )}
        </div>
      </div>
      
      {/* Modal personnalisé */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        showConfirm={modal.showConfirm}
        onConfirm={modal.onConfirm}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
      />
      
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



// Nouveau composant pour gérer les invitations avec une UX épurée
function InvitationManagement({ invitationId, invitation }: { invitationId: string, invitation: any }) {
  const [activeTab, setActiveTab] = useState<'guests' | 'shareable' | 'email'>('guests');
  const guestHookProps = useGuests(invitationId);

  if (guestHookProps.loading) {
    return <div>Chargement des invités...</div>;
  }

  if (guestHookProps.error) {
    return <div>Une erreur est survenue lors du chargement des invités.</div>;
  }

  return (
    <div className={styles.invitationManagement}>
      {/* Onglets de navigation */}
      <div className={styles.tabsContainer} data-tutorial="guest-tabs">
        <Card>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'guests' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('guests')}
            >
              <Users className={styles.tabIcon} />
              <span className={styles.tabLabel}>Invités</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'shareable' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('shareable')}
            >
              <Link2 className={styles.tabIcon} />
              <span className={styles.tabLabel}>Lien Partageable</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'email' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('email')}
            >
              <Mail className={styles.tabIcon} />
              <span className={styles.tabLabel}>Invitations Email</span>
            </button>
          </div>
        </Card>
      </div>

      {/* Contenu des onglets */}
      <div className={styles.tabContent}>
        {activeTab === 'guests' && (
          <GuestsTab
            invitationId={invitationId}
            invitation={invitation}
            {...guestHookProps}
          />
        )}
        {activeTab === 'email' && (
          <EmailInvitationsTab
            invitationId={invitationId}
            invitation={invitation}
            {...guestHookProps}
          />
        )}
        {activeTab === 'shareable' && (
          <ShareableInvitationsTab invitationId={invitationId} invitation={invitation} />
        )}
      </div>
    </div>
  );
}

// Onglet pour tous les invités (email + lien partageable)
function GuestsTab({ invitationId, invitation, ...guestProps }: { invitationId: string, invitation: any } & GuestHookProps) {
  return (
    <div className={styles.guestsTab}>
      <div className={styles.tabHeader}>
        <h2><Users className={styles.headerIcon} /> Tous les Invités</h2>
        <p>Vue d'ensemble de tous vos invités, qu'ils aient été ajoutés manuellement ou via le lien partageable</p>
      </div>
      <GuestsList invitationId={invitationId} invitation={invitation} {...guestProps} />
    </div>
  );
}

// Onglet pour les invitations email
function EmailInvitationsTab({ invitationId, invitation, ...guestProps }: { invitationId: string, invitation: any } & GuestHookProps) {
  const { guests } = guestProps;
  const emailGuests = guests.filter(g => (g as any).invitationType !== 'SHAREABLE');
  const canSendEmails = invitation?.status === 'PUBLISHED';
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  
  return (
    <div className={styles.emailInvitationsTab}>
      <div className={styles.tabHeader}>
        <h2><Mail className={styles.headerIcon} /> Invitations Email</h2>
        <p>Gestion des invitations par email</p>
      </div>
      
      <div className={styles.emailManagement}>
        <Card>
          {/* Affichage conditionnel des actions selon le statut de l'invitation */}
          {invitation?.status === 'PUBLISHED' ? (
            <div className={styles.header}>
              <h2>Gestion des invités</h2>
              <div className={styles.actions}>
                <Button onClick={() => setShowAddForm(true)} variant="primary" data-tutorial="add-guest">
                  <Plus className={styles.buttonIcon} /> Ajouter un invité
                </Button>
                <Button onClick={() => setShowBulkImport(true)} variant="outline" data-tutorial="import-guests">
                  <FolderOpen className={styles.buttonIcon} /> Import en masse
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.restrictedAccess}>
              <div className={styles.restrictedIcon}>
                <AlertTriangle className={styles.warningIcon} />
              </div>
              <h3>Invitation non publiée</h3>
              <p>Vous devez d'abord publier votre invitation pour pouvoir ajouter des invités et envoyer des invitations par email.</p>
              <div className={styles.restrictedActions}>
                <Button 
                  onClick={() => window.location.href = '/client/invitations'} 
                  variant="primary"
                >
                  Publier mon invitation
                </Button>
              </div>
            </div>
          )}

          <div className={styles.emailStats}>
            <div className={styles.statItem}>
              <span><Mail className={styles.statIcon} /> Invités par email</span>
              <strong>{emailGuests.length}</strong>
            </div>
            <div className={styles.statItem}>
              <span><Send className={styles.statIcon} /> Emails envoyés</span>
              <strong>{emailGuests.filter(g => g.invitationSentAt).length}</strong>
            </div>
            <div className={styles.statItem}>
              <span><CheckCircle className={styles.statIcon} /> Confirmés</span>
              <strong>{emailGuests.filter(g => g.rsvp?.status === 'CONFIRMED').length}</strong>
            </div>
          </div>
          
          <div className={styles.emailActions}>
            {canSendEmails && emailGuests.length > 0 && (
              <div className={styles.bulkActions}>
                <Button
                  onClick={() => {
                    // Fonction d'envoi en masse depuis GuestsList
                    const event = new CustomEvent('sendAllInvitations');
                    document.dispatchEvent(event);
                  }}
                  variant="primary"
                >
                  <Send className={styles.buttonIcon} /> Envoyer toutes les invitations
                </Button>
              </div>
            )}
            
            <div className={styles.managementActions}>
              <p><HelpCircle className={styles.infoIcon} /> <strong>Conseil :</strong> Utilisez l'onglet "Invités" pour ajouter, modifier ou voir tous vos invités.</p>
            </div>
          </div>
        </Card>
      </div>

      

    </div>
  );
}

// Onglet pour les liens partageables
function ShareableInvitationsTab({ invitationId, invitation }: { invitationId: string, invitation: any }) {
  const { guests } = useGuests(invitationId);
  const shareableGuests = guests.filter(g => (g as any).invitationType === 'SHAREABLE');
  
  return (
    <div className={styles.shareableInvitationsTab}>
      <div className={styles.tabHeader}>
        <h2><Link2 className={styles.headerIcon} /> Lien Partageable</h2>
        <p>Partagez un lien unique sur vos réseaux sociaux, WhatsApp ou SMS</p>
      </div>
      
      <div className={styles.shareableContent} data-tutorial="shareable-links">
        {invitation?.status === 'PUBLISHED' ? (
          <>
            <ShareableLinkManager invitationId={invitationId} />
            
            {/* Statistiques rapides */}
            <Card>
              <div className={styles.shareableStats}>
                <div className={styles.statItem}>
                  <span><Link2 className={styles.statIcon} /> Réponses via lien</span>
                  <strong>{shareableGuests.length}</strong>
                </div>
                <div className={styles.statItem}>
                  <span><CheckCircle className={styles.statIcon} /> Confirmés</span>
                  <strong>{shareableGuests.filter(g => g.rsvp?.status === 'CONFIRMED').length}</strong>
                </div>
                <div className={styles.statItem}>
                  <span><XCircle className={styles.statIcon} /> Refusés</span>
                  <strong>{shareableGuests.filter(g => g.rsvp?.status === 'DECLINED').length}</strong>
                </div>
              </div>
              
              <div className={styles.shareableNote}>
                <p><HelpCircle className={styles.infoIcon} /> <strong>Conseil :</strong> Consultez l'onglet "Invités" pour voir tous les détails des réponses via lien partageable.</p>
              </div>
            </Card>
          </>
        ) : (
          <div className={styles.restrictedAccess}>
            <div className={styles.restrictedIcon}>
              <AlertTriangle className={styles.warningIcon} />
            </div>
            <h3>Invitation non publiée</h3>
            <p>Vous devez d'abord publier votre invitation pour pouvoir générer des liens partageables.</p>
            <div className={styles.restrictedActions}>
              <Button 
                onClick={() => window.location.href = '/client/invitations'} 
                variant="primary"
              >
                Publier mon invitation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



 

 