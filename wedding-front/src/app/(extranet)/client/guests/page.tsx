'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGuests } from '@/hooks/useGuests';
import { useInvitations } from '@/hooks/useInvitations';
import { Button } from '@/components/ui/button';
import { LimitsIndicator } from '@/components/LimitsIndicator/LimitsIndicator';
import { apiClient } from '@/lib/api/apiClient';
import { 
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  UserPlus,
  FileText,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Crown,
  Link2,
  Copy,
  RefreshCw,
  Share2,
  HelpCircle,
  AlertTriangle,
  Loader
} from 'lucide-react';
import styles from './guests.module.css';

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
      case 'success': return <CheckCircle className={styles.customModalIcon} style={{ color: '#22c55e' }} />;
      case 'error': return <XCircle className={styles.customModalIcon} style={{ color: '#dc3545' }} />;
      case 'warning': return <AlertTriangle className={styles.customModalIcon} style={{ color: '#f59e0b' }} />;
      default: return <HelpCircle className={styles.customModalIcon} style={{ color: '#3b82f6' }} />;
    }
  };

  return (
    <div className={styles.customModal} onClick={onClose}>
      <div className={styles.customModalContent} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.customModalHeader} ${styles[type]}`}>
          <h3 className={`${styles.customModalTitle} ${styles[type]}`}>
            {getIcon()} {title}
          </h3>
          <button
            onClick={onClose}
            className={styles.customModalCloseButton}
          >
            ×
          </button>
        </div>
        <div className={styles.customModalBody}>
          <p className={styles.customModalMessage}>{message}</p>
        </div>
        <div className={styles.customModalFooter}>
          {showConfirm ? (
            <>
              <Button
                onClick={() => {
                  onConfirm?.();
                  onClose();
                }}
                variant="primary"
                size="sm"
              >
                {confirmText}
              </Button>
              <Button onClick={onClose} variant="outline" size="sm">
                {cancelText}
              </Button>
            </>
          ) : (
            <Button onClick={onClose} variant="primary" size="sm">
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
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement des invitations...</p>
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className={styles.emptyStateContainer}>
        <div className={styles.emptyStateContent}>
          <Users className={styles.emptyStateIcon} />
          <h2 className={styles.emptyStateTitle}>
            Aucune invitation créée
          </h2>
          <p className={styles.emptyStateDescription}>
            Vous devez d'abord créer une invitation avant de pouvoir gérer vos invités.
          </p>
          <Link href="/client/invitations">
            <Button variant="primary" size="sm">
              Créer une invitation
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!selectedInvitationId || !selectedInvitation) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>
          <p>Sélection de l'invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.headerBadge}>
          <Users style={{ width: '16px', height: '16px' }} />
          Gestion des invités
        </div>

        <h1 className={styles.headerTitle}>
          Vos <span className={styles.headerTitleAccent}>invités</span>
        </h1>

        <p className={styles.headerSubtitle}>
          Gérez vos invités et suivez leurs réponses en temps réel
        </p>

        {/* Limits Indicator */}
        <LimitsIndicator invitationId={selectedInvitationId} />
      </div>

      {/* Sélecteur d'invitation si plusieurs */}
      {invitations.length > 1 && (
        <div className={styles.invitationSelectorContainer}>
          <div className={styles.invitationSelectorCard}>
            <h3 className={styles.invitationSelectorTitle}>
              <FileText style={{ width: '20px', height: '20px' }} />
              Sélectionner l'invitation à gérer
            </h3>
            <select
              value={selectedInvitationId}
              onChange={(e) => setSelectedInvitationId(e.target.value)}
              className={styles.invitationSelect}
            >
              {invitations.map(invitation => (
                <option key={invitation.id} value={invitation.id}>
                  {invitation.eventTitle}
                  {invitation.eventDate && ` - ${new Date(invitation.eventDate).toLocaleDateString('fr-FR')}`}
                  {invitation.status === 'PUBLISHED' ? ' ✅ Publiée' : ' 📝 Brouillon'}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Avertissement si l'invitation est en draft */}
      {selectedInvitation && selectedInvitation.status === 'DRAFT' && (
        <div className={styles.draftWarning}>
          <div className={styles.draftWarningContent}>
            <AlertTriangle style={{ width: '20px', height: '20px' }} />
            <div className={styles.draftWarningText}>
              <h3>Invitation en brouillon</h3>
              <p>Cette invitation n'est pas encore publiée. Publiez-la d'abord pour pouvoir gérer les invités et partager des liens.</p>
            </div>
            <Link href={`/client/invitations/${selectedInvitation.id}`}>
              <Button variant="primary" size="sm">
                Publier l'invitation
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Contenu principal - masqué si invitation en draft */}
      {selectedInvitation && selectedInvitation.status === 'PUBLISHED' && (
        <GuestsList invitationId={selectedInvitationId} invitation={selectedInvitation} />
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
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

  // Charger les statistiques du lien partageable existant
  useEffect(() => {
    const fetchShareableStats = async () => {
      try {
        const response = await apiClient.get(`/invitations/${invitationId}/shareable-stats`) as any;
        console.log('Shareable stats response:', response); // Debug

        // Le backend renvoie directement l'objet, pas dans response.data
        const stats = response;

        if (stats && stats.shareableEnabled && stats.shareableUrl) {
          setShareableLink({
            url: stats.shareableUrl,
            maxUses: stats.shareableMaxUses || 0,
            usedCount: stats.shareableUsedCount || 0,
            expiresAt: stats.shareableExpiresAt ? new Date(stats.shareableExpiresAt) : undefined,
            remainingGuests: stats.remainingGuests || 0
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        // L'endpoint n'existe peut-être pas, on continue sans erreur
      }
    };

    fetchShareableStats();
  }, [invitationId]);

  const generateShareableLink = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post(`/invitations/${invitationId}/generate-shareable-link`, {}) as any;

      console.log('Response from API:', response); // Debug

      // Le backend renvoie directement l'objet, pas dans response.data
      const backendResponse = response;
      setShareableLink({
        url: backendResponse.shareableUrl,
        maxUses: backendResponse.maxUses || 0,
        usedCount: backendResponse.usedCount || 0,
        expiresAt: backendResponse.expiresAt ? new Date(backendResponse.expiresAt) : undefined,
        remainingGuests: backendResponse.remainingGuests || 0
      });
    } catch (error) {
      console.error('Erreur lors de la génération du lien:', error);
      // Afficher une notification d'erreur à l'utilisateur
      alert('Erreur lors de la génération du lien partageable. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const regenerateShareableLink = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post(`/invitations/${invitationId}/generate-shareable-link`, {}) as any;

      console.log('Regenerate response:', response); // Debug

      // Le backend renvoie directement l'objet, pas dans response.data
      const backendResponse = response;
      const newLink = {
        url: backendResponse.shareableUrl,
        maxUses: backendResponse.maxUses || 0,
        usedCount: backendResponse.usedCount || 0,
        expiresAt: backendResponse.expiresAt ? new Date(backendResponse.expiresAt) : undefined,
        remainingGuests: backendResponse.remainingGuests || 0
      };
      setShareableLink(newLink);
      return newLink.url;
    } catch (error) {
      console.error('Erreur lors de la régénération du lien:', error);
      alert('Erreur lors de la régénération du lien partageable. Veuillez réessayer.');
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
    const message = `Vous êtes invité à notre événement ! Cliquez sur ce lien pour confirmer votre présence : ${url}`;

    // Utiliser l'API Web Share si disponible
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Invitation d\'événement',
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
      <div className={styles.shareableHeader}>
        <h2>🔗 Lien partageable</h2>
        <p>Partagez un lien unique à chaque invité</p>
      </div>

      {!shareableLink ? (
        <div className={styles.generateSection}>
          <p>Créez un lien unique que vous pouvez partager avec vos invités.</p>
          <Button
            onClick={generateShareableLink}
            variant="primary"
            size="sm"
            disabled={loading}
          >
            {loading ? <Loader className={styles.spinIcon} /> : <Link2 className={styles.buttonIcon} />} Générer un lien partageable
          </Button>
        </div>
      ) : (
        <div className={styles.shareableLinkInfo}>
          {/* Explication importante sur l'utilisation */}
          <div className={styles.importantNotice}>
            <div className={styles.noticeIcon}><HelpCircle className={styles.infoIcon} /></div>
            <div className={styles.noticeContent}>
              <strong>Partagez ce lien avec votre invité.</strong> Chaque lien est personnel et permet de répondre facilement à l'invitation.
              <br />
              <span className={styles.timeLimitNotice}>
                ⏰ <strong>Durée limitée :</strong> Chaque lien expire après 20 minutes. Si votre invité ne l'utilise pas à temps, vous devrez l'envoyer un nouveau.
              </span>
            </div>
          </div>

          <div className={styles.linkDisplay}>
            <input
              type="text"
              value={shareableLink.url}
              readOnly
              className={styles.linkInput}
              placeholder="Le lien partageable apparaîtra ici..."
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className={styles.copyButton}
            >
              <Copy className={styles.buttonIcon} /> Copier le lien
            </Button>
          </div>

          {/* <div className={styles.shareStats}>
            <div className={styles.usageStats}>
              <div className={styles.usageCount}>
                <span>Utilisé {shareableLink.usedCount} fois</span>
              </div>
              <div className={styles.remainingCount}>
                <span>{shareableLink.remainingGuests} invités restants</span>
              </div>
            </div>
          </div> */}

          <div className={styles.shareButtons}>
            <Button
              onClick={regenerateShareableLink}
              variant="primary"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={styles.buttonIcon} /> Générer un nouveau lien
            </Button>
            <Button
              onClick={() => shareLink(shareableLink.url)}
              variant="outline"
              size="sm"
            >
              <Share2 className={styles.buttonIcon} /> Partager
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function GuestsList({ invitationId, invitation }: { invitationId: string, invitation: any }) {
  const {
    guests,
    loading,
    error,
    createGuest,
    updateGuest,
    deleteGuest,
    fetchGuests
  } = useGuests(invitationId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [emailResults, setEmailResults] = useState<any>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [importPreview, setImportPreview] = useState<any>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Charger les invités au montage du composant
  useEffect(() => {
    if (invitationId) {
      fetchGuests();
    }
  }, [invitationId, fetchGuests]);

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
    isVIP: false
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
      const emailExists = guests.some(guest =>
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
        isVIP: false
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

  // Cette fonction n'est plus utilisée - remplacée par handleFilePreview
  // const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   // Logique remplacée par le système de prévisualisation
  // };

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
              failed: Array<{ guestId: string; guestName: string; error: string }>;
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
        errors: Array<{ line: number; error: string }>;
        preview: Array<{ firstName: string; lastName: string; email: string; isVIP?: boolean; plusOne?: boolean }>;
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
        errors: Array<{ line: number; error: string; data?: any }>;
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
  const downloadTemplate = (format: 'csv' | 'txt') => {
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'csv':
        content = 'firstName,lastName,email,phone,isVIP\n' +
          'Jean,Dupont,jean.dupont@email.com,0123456789,false\n' +
          'Sophie,Martin,sophie.martin@email.com,0987654321,true\n' +
          'Pierre,Blanc,pierre.blanc@email.com,0987654321,false';
        filename = 'template_invites.csv';
        mimeType = 'text/csv';
        break;

      case 'txt':
        content = 'Jean,Dupont,jean.dupont@email.com,0123456789,false\n' +
          'Sophie,Martin,sophie.martin@email.com,0987654321,true\n' +
          'Pierre,Blanc,pierre.blanc@email.com,0987654321,false';
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
              failed: Array<{ guestId: string; guestName: string; error: string }>;
              skipped: Array<{ guestId: string; guestName: string; reason: string }>;
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

  const getGuestStatus = (guest: any) => {
    if (guest.rsvp) {
      switch (guest.rsvp.status) {
        case 'CONFIRMED': return 'Confirmé';
        case 'DECLINED': return 'Refusé';
        default: return 'En attente';
      }
    }
    return 'Pas de réponse';
  };

  const getGuestStatusColor = (guest: any) => {
    if (guest.rsvp) {
      switch (guest.rsvp.status) {
        case 'CONFIRMED': return '#4CAF50';
        case 'DECLINED': return '#f44336';
        default: return '#ff9800';
      }
    }
    return '#9e9e9e';
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Une erreur est survenue</div>;
  }

  const canSendEmails = invitation?.status === 'PUBLISHED';
  const guestsWithEmails = guests.filter(g => g.email);

  // Filtrer les invités selon la recherche
  const filteredGuests = guests.filter(guest => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    const fullName = `${guest.firstName} ${guest.lastName}`.toLowerCase();
    const email = guest.email?.toLowerCase() || '';
    const phone = guest.phone?.toLowerCase() || '';

    return (
      fullName.includes(query) ||
      email.includes(query) ||
      phone.includes(query)
    );
  });

  return (
    <div className={styles.guestsPage}>
      <div className={styles.header}>
        <h1>Envoi par email</h1>
        <div className={styles.actions}>
          <Button
            onClick={() => setShowAddForm(true)}
            variant="primary"
            size="sm"
          >
            ➕ Ajouter un invité
          </Button>
          <Button
            onClick={() => setShowBulkImport(true)}
            variant="outline"
            size="sm"
          >
            📂 Import en masse
          </Button>
        </div>
      </div>

      
      {showAddForm && (
        <div className={styles.addFormContainer}>
          <div className={styles.addFormCard}>
            <div className={styles.formHeader}>
              <h2>➕ Ajouter un invité</h2>
              </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label>Prénom *</label>
                <input
                  type="text"
                  name="firstName"
                    placeholder="Prénom (min. 2 caractères)"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                    minLength={2}
                    className={styles.formInput}
                    />
                  </div>
                <div className={styles.formField}>
                  <label>Nom *</label>
                <input
                  type="text"
                  name="lastName"
                    placeholder="Nom (min. 2 caractères)"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                    minLength={2}
                    className={styles.formInput}
                    />
                  </div>
                <div className={styles.formField}>
                  <label>Email</label>
                <input
                  type="email"
                  name="email"
                    placeholder="Email (requis si pas de téléphone)"
                  value={formData.email}
                  onChange={handleInputChange}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formField}>
                  <label>Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                    placeholder="Téléphone (requis si pas d'email)"
                  value={formData.phone}
                  onChange={handleInputChange}
                    pattern="[\+]?[0-9\s\-\(\)]{8,}"
                    title="Minimum 8 caractères, chiffres/espaces/+/-/() autorisés"
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formField}>
                  <div className={styles.checkboxField}>
                    <input
                      type="checkbox"
                      name="isVIP"
                      checked={formData.isVIP}
                      onChange={handleInputChange}
                    />
                    <label>⭐ Invité VIP</label>
                </div>
              </div>
              </div>
              <div className={styles.formActions}>
                <Button type="submit" variant="primary" size="sm">
                  ✅ Ajouter l'invité
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Section lien partageable */}
      <ShareableLinkManager invitationId={invitationId} />

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
              <h2>📂 Import en masse d'invités</h2>
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
                  <h3>📋 1. Téléchargez un template</h3>
                  <div className={styles.templateButtons}>
                    <Button onClick={() => downloadTemplate('csv')} variant="outline" size="sm">
                      📄 Template CSV
                    </Button>
                    <Button onClick={() => downloadTemplate('txt')} variant="outline" size="sm">
                      📄 Template TXT
                    </Button>
                  </div>
                
                  <h3>📝 2. Remplissez le fichier</h3>
                  <div className={styles.formatInfo}>
                    <h4>📋 Règles de validation :</h4>
                    <ul>
                      <li><strong>Prénom et Nom :</strong> Obligatoires, minimum 2 caractères chacun</li>
                      <li><strong>Email :</strong> OBLIGATOIRE pour l'import en masse (les invitations seront envoyées par email)</li>
                      <li><strong>Téléphone :</strong> Optionnel, minimum 8 caractères, chiffres/espaces/+/-/() autorisés</li>
                      <li><strong>isVIP :</strong> true/false ou 1/0</li>
                    </ul>

                    <h4>💡 Format CSV (recommandé) :</h4>
                    <code>firstName,lastName,email,phone,isVIP</code>
                    <p><em>Note: La première ligne d'en-têtes est automatiquement ignorée</em></p>

                    <h4>📝 Format TXT :</h4>
                    <code>Prénom,Nom,email,téléphone,isVIP</code>
                    <p><em>Chaque ligne = un invité, valeurs séparées par des virgules</em></p>

                    <h4>⚠️ Exemples valides :</h4>
                    <ul>
                      <li>✅ Avec email seul : <code>Jean,Dupont,jean@email.com,,false</code></li>
                      <li>✅ Avec email et téléphone : <code>Paul,Durand,paul@email.com,+33612345678,false</code></li>
                      <li>✅ Invité VIP : <code>Sophie,Martin,sophie@email.com,0987654321,true</code></li>
                      <li>❌ Sans email : <code>Pierre,Blanc,,0987654321,false</code></li>
                    </ul>
                  </div>

                  <h3>📤 3. Uploadez votre fichier</h3>
                  <div className={styles.uploadArea}>
                  <input
                    type="file"
                      accept=".csv,.txt"
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
                      size="sm"
                    >
                      📤 Choisir un fichier
                    </Button>
                    <p>Formats supportés: CSV, TXT (max 5MB)</p>
                </div>
                </div>
              ) : (
                <div className={styles.previewStep}>
                  <h3>👀 Prévisualisation de l'import</h3>

                  <div className={styles.previewStats}>
                    <div className={styles.statItem}>
                      <span>✅ Invités valides</span>
                      <strong>{importPreview.validGuests || importPreview.totalGuests}</strong>
            </div>
                    <div className={styles.statItem}>
                      <span>❌ Erreurs</span>
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
            </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.previewActions}>
                    <Button
                      onClick={confirmImport}
                      variant="primary"
                      size="sm"
                      disabled={importing || (importPreview.validGuests || importPreview.totalGuests) === 0}
                    >
                      {importing ? '⏳ Import en cours...' : `✅ Confirmer l'import (${importPreview.validGuests || importPreview.totalGuests} invités)`}
                    </Button>
                    <Button
                      onClick={() => {
                        setImportPreview(null);
                        setImportFile(null);
                      }}
                      variant="outline"
                      size="sm"
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

      {!canSendEmails && (
        <div className={styles.warning}>
          <div className={styles.emptyState}>
            <h3>⚠️ Invitation non publiée</h3>
            <p>Vous devez publier votre invitation avant de pouvoir envoyer des emails aux invités.</p>
            <Link href="/client/invitations">
              <Button variant="primary" size="sm">Publier l'invitation</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Section de recherche moderne */}
      <div className={styles.searchSection}>
        <div className={styles.searchHeader}>
          <h2>🔍 Rechercher un invité</h2>
          <input
            type="text"
            placeholder="Nom, email, téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>


      <div className={styles.guestsList}>
        <div className={styles.guestsListHeader}>
          <h2>👥 Liste des invités ({searchQuery ? `${filteredGuests.length} sur ${guests.length}` : guests.length})</h2>
          {canSendEmails && (
            <div className={styles.bulkActions}>
              {(() => {
                const guestsWithoutInvitation = guests.filter(g => g.email && !g.invitationSentAt && !g.rsvp);
                return guestsWithoutInvitation.length > 0 && (
                  <Button
                    onClick={sendAllInvitations}
                    variant="primary"
                    size="sm"
                    disabled={sendingEmails}
                    className={styles.shakeButton}
                  >
                    {sendingEmails ? (
                      <>
                        <Loader className={styles.spinIcon} /> Envoi en cours...
                      </>
                    ) : (
                      <>
                        📧 Envoyer aux invités en attente ({guestsWithoutInvitation.length})
                      </>
                    )}
                  </Button>
                );
              })()}
            </div>
          )}
        </div>
        <div className={styles.guestsGrid}>
          {filteredGuests.map(guest => (
            <div key={guest.id} className={styles.guestCard}>
              <div className={styles.guestHeader}>
                <h3>
                  {guest.firstName} {guest.lastName}
                  {guest.isVIP && <span className={styles.vipBadge}>⭐ VIP</span>}
              </h3>
                <div
                  className={styles.statusBadge}
                  style={{ backgroundColor: getGuestStatusColor(guest) }}
                >
                  {getGuestStatus(guest)}
                </div>
              </div>

              <div className={styles.guestDetails}>
                {guest.profilePhotoUrl && (
                  <div className={styles.profilePhoto}>
                    <img 
                      src={guest.profilePhotoUrl} 
                      alt={`Photo de ${guest.firstName} ${guest.lastName}`}
                      className={styles.photoThumbnail}
                    />
                  </div>
                )}
                {guest.email && <p>📧 {guest.email}</p>}
                {guest.phone && <p>📞 {guest.phone}</p>}
                {guest.plusOne && guest.plusOneName && (
                  <p>👥 Accompagnant: {guest.plusOneName}</p>
                )}
                {guest.dietaryRestrictions && (
                  <p>🥗 Restrictions: {guest.dietaryRestrictions}</p>
                )}
                {guest.invitationSentAt && (
                  <p className={styles.sentDate}>
                    ✅ Invitation envoyée le {new Date(guest.invitationSentAt).toLocaleDateString('fr-FR')}
                  </p>
                )}
                {guest.usedAt && (
                  <p className={styles.usedDate}>
                    🔗 Lien utilisé le {new Date(guest.usedAt).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>

              <div className={styles.guestActions}>
                {canSendEmails && guest.email && (
                  <div className={styles.emailActions}>
                    {!guest.invitationSentAt && !guest.usedAt && !guest.rsvp && (
                      <Button
                        onClick={() => sendInvitationToGuest(guest.id)}
                        variant="primary"
                        size="sm"
                      >
                        📧 Envoyer invitation
                      </Button>
                    )}
                    {guest.invitationSentAt && !guest.usedAt && !guest.rsvp && (
                      <Button
                        onClick={() => sendReminderToGuest(guest.id)}
                        variant="outline"
                        size="sm"
                      >
                        🔔 Envoyer rappel
                      </Button>
                    )}
        </div>
                )}
                <Button
                  onClick={() => handleDeleteGuest(guest.id)}
                  variant="secondary"
                  size="sm"
                >
                  🗑️ Supprimer
                </Button>
      </div>
        </div>
          ))}

          {filteredGuests.length === 0 && guests.length > 0 && (
            <div className={styles.emptyState}>
              <h3>🔍 Aucun invité trouvé</h3>
              <p>Aucun invité ne correspond à votre recherche "{searchQuery}".</p>
              <Button onClick={() => setSearchQuery('')} variant="primary" size="sm">
                🔄 Effacer la recherche
              </Button>
        </div>
      )}

          {guests.length === 0 && (
            <div className={styles.emptyState}>
              <h3>👥 Aucun invité ajouté</h3>
              <p>Commencez par ajouter vos premiers invités pour pouvoir envoyer les invitations.</p>

            </div>
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
    </div>
  );
} 