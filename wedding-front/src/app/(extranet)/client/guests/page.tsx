'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGuests } from '@/hooks/useGuests';
import { useInvitations } from '@/hooks/useInvitations';
import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { SubscriptionLimits } from '@/components/SubscriptionLimits/SubscriptionLimits';
import { apiClient } from '@/lib/api/apiClient';
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
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
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
      {/* Affichage des limites d'abonnement */}
      <SubscriptionLimits invitationId={selectedInvitationId} />
      
      {/* Sélecteur d'invitation si plusieurs */}
      {invitations.length > 1 && (
        <div className={styles.invitationSelector}>
          <Card>
            <h3>📋 Sélectionner l'invitation à gérer</h3>
            <select 
              value={selectedInvitationId} 
              onChange={(e) => setSelectedInvitationId(e.target.value)}
              className={styles.invitationSelect}
            >
              {invitations.map(invitation => (
                <option key={invitation.id} value={invitation.id}>
                  {invitation.coupleName || invitation.title} 
                  {invitation.weddingDate && ` - ${new Date(invitation.weddingDate).toLocaleDateString('fr-FR')}`}
                  {invitation.status === 'PUBLISHED' ? ' ✅ Publiée' : ' 📝 Brouillon'}
                </option>
              ))}
            </select>
          </Card>
        </div>
      )}
      
      <GuestsList invitationId={selectedInvitationId} invitation={selectedInvitation} />
    </div>
  );
}

function GuestsList({ invitationId, invitation }: { invitationId: string, invitation: any }) {
  const {
    guests,
    statistics,
    loading,
    error,
    createGuest,
    updateGuest,
    deleteGuest,
    importGuests
  } = useGuests(invitationId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [emailResults, setEmailResults] = useState<any>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [importPreview, setImportPreview] = useState<any>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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

  return (
    <div className={styles.guestsPage}>
      <div className={styles.header}>
        <h1>Gestion des invités</h1>
        <div className={styles.actions}>
          <Button onClick={() => setShowAddForm(true)} variant="primary">
            ➕ Ajouter un invité
          </Button>
          <Button onClick={() => setShowBulkImport(true)} variant="outline">
            📂 Import en masse
          </Button>
        </div>
      </div>

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
                    <Button onClick={() => downloadTemplate('csv')} variant="outline">
                      📄 Template CSV
                    </Button>
                    <Button onClick={() => downloadTemplate('json')} variant="outline">
                      📄 Template JSON
                    </Button>
                    <Button onClick={() => downloadTemplate('txt')} variant="outline">
                      📄 Template TXT
                    </Button>
                  </div>

                  <h3>📝 2. Remplissez le fichier</h3>
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

                  <h3>📤 3. Uploadez votre fichier</h3>
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
                      📤 Choisir un fichier
                    </Button>
                    <p>Formats supportés: CSV, JSON, TXT (max 5MB)</p>
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
                      {importing ? '⏳ Import en cours...' : `✅ Confirmer l'import (${importPreview.validGuests || importPreview.totalGuests} invités)`}
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

      {!canSendEmails && (
        <div className={styles.warning}>
          <Card>
            <h3>⚠️ Invitation non publiée</h3>
            <p>Vous devez publier votre invitation avant de pouvoir envoyer des emails aux invités.</p>
            <Link href="/client/invitations">
              <Button variant="primary">Publier l'invitation</Button>
            </Link>
          </Card>
      </div>
      )}



      {statistics && (
        <div className={styles.statistics}>
          <Card>
            <h2>📊 Statistiques</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span>Total invités</span>
                <strong>{guests.length}</strong>
              </div>
              <div className={styles.statItem}>
                <span>Avec email</span>
                <strong>{guestsWithEmails.length}</strong>
              </div>
              <div className={styles.statItem}>
                <span>Invitations envoyées</span>
                <strong>{guests.filter(g => g.invitationSentAt).length}</strong>
              </div>
              <div className={styles.statItem}>
                <span>Confirmés</span>
                <strong>{guests.filter(g => g.rsvp?.status === 'CONFIRMED').length}</strong>
              </div>
              <div className={styles.statItem}>
                <span>Refusés</span>
                <strong>{guests.filter(g => g.rsvp?.status === 'DECLINED').length}</strong>
              </div>
              <div className={styles.statItem}>
                <span>En attente</span>
                <strong>{guests.filter(g => !g.rsvp || g.rsvp?.status === 'PENDING').length}</strong>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Barre de recherche */}
      <div className={styles.searchSection}>
        <Card>
          <div className={styles.searchContainer}>
            <div className={styles.searchInputWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Rechercher un invité (nom, email, téléphone, restrictions...)"
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
                  ✕
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
            <h2>➕ Ajouter un invité</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Prénom * (min. 2 caractères)"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  minLength={2}
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Nom * (min. 2 caractères)"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  minLength={2}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email (requis si pas de téléphone)"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Téléphone (requis si pas d'email)"
                  value={formData.phone}
                  onChange={handleInputChange}
                  pattern="[\+]?[0-9\s\-\(\)]{8,}"
                  title="Minimum 8 caractères, chiffres/espaces/+/-/() autorisés"
                />
                <textarea
                  name="dietaryRestrictions"
                  placeholder="Restrictions alimentaires (optionnel)"
                  value={formData.dietaryRestrictions}
                  onChange={handleInputChange}
                  rows={2}
                />
                <div className={styles.checkboxGroup}>
                  <label>
                    <input
                      type="checkbox"
                      name="isVIP"
                      checked={formData.isVIP}
                      onChange={handleInputChange}
                    />
                    ⭐ Invité VIP
                  </label>
                <label>
                  <input
                    type="checkbox"
                      name="plusOne"
                      checked={formData.plusOne}
                      onChange={handleInputChange}
                    />
                    👥 Autorisé à venir accompagné
                  </label>
                </div>
                {formData.plusOne && (
                  <input
                    type="text"
                    name="plusOneName"
                    placeholder="Nom de l'accompagnant (optionnel)"
                    value={formData.plusOneName}
                    onChange={handleInputChange}
                  />
                )}
              </div>
              <div className={styles.formActions}>
                <Button type="submit" variant="primary">
                  Ajouter l'invité
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <div className={styles.guestsList}>
        <h2>👥 Liste des invités ({searchQuery ? `${filteredGuests.length} sur ${guests.length}` : guests.length})</h2>
        <div className={styles.guestsGrid}>
          {filteredGuests.map(guest => (
            <Card key={guest.id} className={styles.guestCard}>
              <div className={styles.guestInfo}>
                <div className={styles.guestHeader}>
                  <h3>
                    {guest.firstName} {guest.lastName}
                    {guest.isVIP && <span className={styles.vipBadge}>⭐ VIP</span>}
                    {guest.plusOne && <span className={styles.plusOneBadge}>👥 +1</span>}
                  </h3>
                  <div 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getGuestStatusColor(guest) }}
                  >
                    {getGuestStatus(guest)}
                  </div>
                </div>
                
                <div className={styles.guestDetails}>
                  <p>📧 {guest.email}</p>
                  {guest.phone && <p>📞 {guest.phone}</p>}
                  {guest.dietaryRestrictions && (
                    <p>🥗 Restrictions : {guest.dietaryRestrictions}</p>
                  )}
                  {guest.plusOne && guest.plusOneName && (
                    <p>👥 Accompagnant : {guest.plusOneName}</p>
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
              </div>
              
              <div className={styles.guestActions}>
                {canSendEmails && guest.email && (
                  <div className={styles.emailActions}>
                    {!guest.invitationSentAt && (
                      <Button
                        onClick={() => sendInvitationToGuest(guest.id)}
                        variant="primary"
                        size="small"
                      >
                        📧 Envoyer invitation
                      </Button>
                    )}
                    {guest.invitationSentAt && !guest.rsvp && (
                      <Button
                        onClick={() => sendReminderToGuest(guest.id)}
                        variant="outline"
                        size="small"
                      >
                        🔔 Envoyer rappel
                      </Button>
                    )}
                  </div>
                )}
                <Button
                  variant="danger"
                  onClick={() => handleDeleteGuest(guest.id)}
                  size="small"
                >
                  🗑️ Supprimer
                </Button>
              </div>
            </Card>
          ))}
          
          {filteredGuests.length === 0 && guests.length > 0 && (
            <Card className={styles.emptyState}>
              <h3>Aucun invité trouvé</h3>
              <p>Aucun invité ne correspond à votre recherche "{searchQuery}".</p>
              <Button onClick={() => setSearchQuery('')} variant="primary">
                🔄 Effacer la recherche
              </Button>
            </Card>
          )}
          
          {guests.length === 0 && (
            <Card className={styles.emptyState}>
              <h3>Aucun invité ajouté</h3>
              <p>Commencez par ajouter vos premiers invités pour pouvoir envoyer les invitations.</p>
              <Button onClick={() => setShowAddForm(true)} variant="primary">
                ➕ Ajouter le premier invité
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
    </div>
  );
} 