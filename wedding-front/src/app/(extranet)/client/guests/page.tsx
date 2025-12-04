'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { HeaderMobile } from '@/components/HeaderMobile';
import { useGuests } from '@/hooks/useGuests';
import { useInvitations } from '@/hooks/useInvitations';
import { apiClient } from '@/lib/api/apiClient';
import { stripeApi } from '@/lib/api/stripe';
import { Guest } from '@/types';
import {
  Plus,
  Upload,
  Search,
  ChevronDown,
  Bell,
  Send,
  Trash2,
  User,
  X,
  FileText,
  Download,
  Copy,
  Share2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import styles from './guests.module.css';

// Modal pour ajouter un invité
function AddGuestModal({
  isOpen,
  onClose,
  onCreate,
  invitationId
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  invitationId: string;
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isVIP: false,
    plusOne: false,
    plusOneName: '',
    dietaryRestrictions: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiClient.post(`/invitations/${invitationId}/guests`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        isVIP: formData.isVIP,
        plusOne: formData.plusOne,
        plusOneName: formData.plusOneName || undefined,
        dietaryRestrictions: formData.dietaryRestrictions || undefined
      });

      onCreate();
      onClose();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        isVIP: false,
        plusOne: false,
        plusOneName: '',
        dietaryRestrictions: ''
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'invité');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Ajouter un invité</h2>
          <button onClick={onClose} className={styles.modalClose}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          {error && (
            <div className={styles.modalError}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <div className={styles.formGroup}>
            <label>Prénom *</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Nom *</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Téléphone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.isVIP}
                onChange={(e) => setFormData({ ...formData, isVIP: e.target.checked })}
              />
              Invité VIP
            </label>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.plusOne}
                onChange={(e) => setFormData({ ...formData, plusOne: e.target.checked })}
              />
              Accompagnant
            </label>
          </div>
          {formData.plusOne && (
            <div className={styles.formGroup}>
              <label>Nom de l'accompagnant</label>
              <input
                type="text"
                value={formData.plusOneName}
                onChange={(e) => setFormData({ ...formData, plusOneName: e.target.value })}
              />
            </div>
          )}
          <div className={styles.formGroup}>
            <label>Restrictions alimentaires</label>
            <textarea
              value={formData.dietaryRestrictions}
              onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
              rows={3}
            />
          </div>
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.modalButtonSecondary}>
              Annuler
            </button>
            <button type="submit" className={styles.modalButtonPrimary} disabled={loading}>
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal pour l'import en masse
function BulkImportModal({
  isOpen,
  onClose,
  onImport,
  invitationId,
  previewImport,
  bulkImport,
  downloadTemplate
}: {
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
  invitationId: string;
  previewImport: (file: File) => Promise<any>;
  bulkImport: (file: File) => Promise<any>;
  downloadTemplate: (format: 'csv' | 'txt') => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setPreview(null);

    try {
      setLoading(true);
      const previewData = await previewImport(selectedFile);
      setPreview(previewData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la prévisualisation');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setImporting(true);
      setError(null);
      const result = await bulkImport(file);
      onImport();
      onClose();
      setFile(null);
      setPreview(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'import');
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Import en masse</h2>
          <button onClick={onClose} className={styles.modalClose}>
            <X size={24} />
          </button>
        </div>
        <div className={styles.modalBody}>
          {error && (
            <div className={styles.modalError}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <div className={styles.formGroup}>
            <label>Télécharger un template</label>
            <div className={styles.templateButtons}>
              <button
                type="button"
                onClick={() => downloadTemplate('csv')}
                className={styles.templateButton}
              >
                <Download size={16} />
                Template CSV
              </button>
              <button
                type="button"
                onClick={() => downloadTemplate('txt')}
                className={styles.templateButton}
              >
                <Download size={16} />
                Template TXT
              </button>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Fichier à importer *</label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileSelect}
              disabled={loading}
            />
          </div>
          {loading && <p>Prévisualisation en cours...</p>}
          {preview && (
            <div className={styles.previewSection}>
              <h3>Prévisualisation</h3>
              <p>Total: {preview.totalRows || preview.totalGuests} lignes</p>
              <p>Valides: {preview.validRows || preview.validGuests?.length || 0}</p>
              {preview.errors && preview.errors.length > 0 && (
                <div className={styles.previewErrors}>
                  <p>Erreurs: {preview.errors.length}</p>
                  <ul>
                    {preview.errors.slice(0, 5).map((err: any, idx: number) => (
                      <li key={idx}>Ligne {err.row || err.line}: {err.error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.modalButtonSecondary}>
              Annuler
            </button>
            <button
              type="button"
              onClick={handleImport}
              className={styles.modalButtonPrimary}
              disabled={!file || !preview || importing}
            >
              {importing ? 'Import en cours...' : 'Importer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal pour l'export
function ExportModal({
  isOpen,
  onClose,
  onExportExcel,
  onExportPDF
}: {
  isOpen: boolean;
  onClose: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Exporter la liste</h2>
          <button onClick={onClose} className={styles.modalClose}>
            <X size={24} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            Choisissez le format d'export adapté à vos besoins :
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => { onExportExcel(); onClose(); }}
              className={styles.modalButtonSecondary}
              style={{ justifyContent: 'flex-start', padding: '1rem', height: 'auto' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <div style={{
                  background: '#107c41',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  display: 'flex'
                }}>
                  <FileSpreadsheet size={24} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Excel (Gestion)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Toutes les données (RSVP, régimes, contacts...) pour votre organisation.
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { onExportPDF(); onClose(); }}
              className={styles.modalButtonSecondary}
              style={{ justifyContent: 'flex-start', padding: '1rem', height: 'auto' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <div style={{
                  background: '#ea4335',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  display: 'flex'
                }}>
                  <Printer size={24} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>PDF (Jour J)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Liste de présence épurée à imprimer pour l'émargement à l'entrée.
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant pour gérer le lien partageable
function ShareableLinkManager({ invitationId }: { invitationId: string }) {
  const [shareableLink, setShareableLink] = useState<{
    url: string;
    maxUses: number;
    usedCount: number;
    expiresAt?: Date;
    remainingGuests: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShareableStats();
  }, [invitationId]);

  const fetchShareableStats = async () => {
    try {
      const response = await apiClient.get(`/invitations/${invitationId}/shareable-stats`) as any;
      if (response && response.shareableEnabled && response.shareableUrl) {
        setShareableLink({
          url: response.shareableUrl,
          maxUses: response.shareableMaxUses || 0,
          usedCount: response.shareableUsedCount || 0,
          expiresAt: response.shareableExpiresAt ? new Date(response.shareableExpiresAt) : undefined,
          remainingGuests: response.remainingGuests || 0
        });
      }
    } catch (error) {
      // L'endpoint n'existe peut-être pas, on continue sans erreur
    }
  };

  const generateShareableLink = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post(`/invitations/${invitationId}/generate-shareable-link`, {}) as any;
      setShareableLink({
        url: response.shareableUrl,
        maxUses: response.maxUses || 0,
        usedCount: response.usedCount || 0,
        expiresAt: response.expiresAt ? new Date(response.expiresAt) : undefined,
        remainingGuests: response.remainingGuests || 0
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la génération du lien');
    } finally {
      setLoading(false);
    }
  };

  const regenerateShareableLink = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post(`/invitations/${invitationId}/generate-shareable-link`, {}) as any;
      const newLink = {
        url: response.shareableUrl,
        maxUses: response.maxUses || 0,
        usedCount: response.usedCount || 0,
        expiresAt: response.expiresAt ? new Date(response.expiresAt) : undefined,
        remainingGuests: response.remainingGuests || 0
      };
      setShareableLink(newLink);
      return newLink.url;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la régénération du lien');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const newUrl = await regenerateShareableLink();
      if (newUrl) {
        await navigator.clipboard.writeText(newUrl);
        // Lien copié silencieusement sans alerte
      }
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const shareLink = async (url: string) => {
    const message = `Vous êtes invité à notre événement ! Cliquez sur ce lien pour confirmer votre présence : ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Invitation d\'événement',
          text: message,
          url: url
        });
        await regenerateShareableLink();
      } catch (err) {
        console.log('Partage annulé ou erreur:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(message);
        // Message copié silencieusement sans alerte
        await regenerateShareableLink();
      } catch (err) {
        console.error('Erreur lors de la copie:', err);
      }
    }
  };

  if (!shareableLink) {
    return (
      <div className={styles.shareableSection}>
        <p>Aucun lien partageable généré</p>
        <button
          onClick={generateShareableLink}
          className={styles.shareableButton}
          disabled={loading}
        >
          {loading ? 'Génération...' : 'Générer un lien partageable'}
        </button>
        {error && <p className={styles.shareableError}>{error}</p>}
      </div>
    );
  }

  return (
    <div className={styles.shareableSection}>
      <div className={styles.shareableInfo}>
        <p className={styles.shareableLabel}>Lien partageable</p>
        <div className={styles.shareableUrl}>
          <input type="text" value={shareableLink.url} readOnly />
          <button onClick={copyToClipboard} className={styles.shareableCopyButton}>
            <Copy size={16} />
          </button>
        </div>
        <div className={styles.shareableStats}>
          <p>Utilisé: {shareableLink.usedCount}/{shareableLink.maxUses}</p>
          <p>⏰ Le lien a une durée de 10 min avant d'être invalide</p>
        </div>
      </div>
      <div className={styles.shareableActions}>
        <button
          onClick={regenerateShareableLink}
          className={styles.shareableButton}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? 'Génération...' : 'Générer un nouveau lien'}
        </button>
        <button
          onClick={() => shareLink(shareableLink.url)}
          className={styles.shareableButtonSecondary}
        >
          <Share2 size={16} />
          Partager
        </button>
        <button
          onClick={copyToClipboard}
          className={styles.shareableButtonSecondary}
        >
          <Copy size={16} />
          Copier
        </button>
      </div>
    </div>
  );
}

export default function GuestsPage() {
  const router = useRouter();
  const { invitations, loading: loadingInvitations } = useInvitations();
  const [limits, setLimits] = useState<{ usage: any; limits: any } | null>(null);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>('');

  // Sélectionner automatiquement la première invitation publiée ou la première invitation
  useEffect(() => {
    if (invitations.length > 0 && !selectedInvitationId) {
      const publishedInvitation = invitations.find(inv => inv.status === 'PUBLISHED');
      setSelectedInvitationId(publishedInvitation?.id || invitations[0].id);
    }
  }, [invitations, selectedInvitationId]);

  const selectedInvitation = invitations.find(inv => inv.id === selectedInvitationId);

  const {
    guests,
    loading: loadingGuests,
    fetchGuests,
    deleteGuest,
    sendInvitation,
    sendReminder,
    sendBulkInvitations,
    previewImport,
    bulkImport,
    downloadTemplate
  } = useGuests(selectedInvitationId);

  const [invitationType, setInvitationType] = useState<'email' | 'shareable'>('email');
  const [searchQuery, setSearchQuery] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState<'all' | 'CONFIRMED' | 'PENDING' | 'DECLINED'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'PERSONAL' | 'SHAREABLE'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showRsvpFilter, setShowRsvpFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const rsvpFilterRef = useRef<HTMLDivElement>(null);
  const typeFilterRef = useRef<HTMLDivElement>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fermer les dropdowns quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rsvpFilterRef.current && !rsvpFilterRef.current.contains(event.target as Node)) {
        setShowRsvpFilter(false);
      }
      if (typeFilterRef.current && !typeFilterRef.current.contains(event.target as Node)) {
        setShowTypeFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Charger les limites
  useEffect(() => {
    const loadLimits = async () => {
      try {
        const limitsData = await stripeApi.getUserLimitsAndUsage();
        setLimits(limitsData);
      } catch (error) {
        console.error('Erreur chargement limites:', error);
      }
    };
    loadLimits();
  }, []);

  useEffect(() => {
    if (selectedInvitationId) {
      fetchGuests();
    }
  }, [selectedInvitationId, fetchGuests]);

  // Filtrer les invités
  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      // Recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = `${guest.firstName} ${guest.lastName}`.toLowerCase();
        const email = guest.email?.toLowerCase() || '';
        const phone = guest.phone?.toLowerCase() || '';

        if (!fullName.includes(query) && !email.includes(query) && !phone.includes(query)) {
          return false;
        }
      }

      // Filtre RSVP
      if (rsvpFilter !== 'all') {
        // Pour "PENDING", inclure les invités sans RSVP (considérés comme "pending")
        if (rsvpFilter === 'PENDING') {
          if (guest.rsvp && guest.rsvp.status !== 'PENDING') {
            return false;
          }
        } else {
          // Pour CONFIRMED et DECLINED, vérifier le statut exact
          if (guest.rsvp?.status !== rsvpFilter) {
            return false;
          }
        }
      }

      // Filtre Type
      if (typeFilter !== 'all') {
        if (guest.invitationType !== typeFilter) {
          return false;
        }
      }

      return true;
    });
  }, [guests, searchQuery, rsvpFilter, typeFilter]);

  // Calculer le nombre d'invités sans réponse
  const pendingGuestsCount = useMemo(() => {
    return guests.filter(guest => !guest.rsvp || guest.rsvp.status === 'PENDING').length;
  }, [guests]);

  const handleAddGuest = () => {
    setShowAddModal(true);
  };

  const handleBulkImport = () => {
    setShowImportModal(true);
  };

  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const handleSendInvitation = async (guestId: string) => {
    const success = await sendInvitation(guestId);
    if (success) {
      await fetchGuests();
    }
  };

  const handleSendReminder = async (guestId: string) => {
    const success = await sendReminder(guestId);
    if (success) {
      await fetchGuests();
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet invité ?')) {
      const success = await deleteGuest(guestId);
      if (success) {
        await fetchGuests();
      }
    }
  };

  // Envoyer les invitations à tous les invités sans réponse
  const handleSendInvitationsToPending = async () => {
    // Filtrer les invités qui n'ont pas encore répondu (pas de RSVP ou RSVP.status === 'PENDING')
    const pendingGuests = guests.filter(guest => {
      return !guest.rsvp || guest.rsvp.status === 'PENDING';
    });

    if (pendingGuests.length === 0) {
      showNotification('Tous les invités ont déjà répondu à l\'invitation.', 'error');
      return;
    }

    if (!confirm(`Envoyer l'invitation à ${pendingGuests.length} invité(s) sans réponse ?`)) {
      return;
    }

    try {
      const guestIds = pendingGuests.map(guest => guest.id);
      const result = await sendBulkInvitations(guestIds);

      if (result.failed && result.failed.length > 0) {
        showNotification(`Invitations envoyées : ${result.sent.length} - Échecs : ${result.failed.length}`, 'error');
      } else {
        showNotification(`Invitations envoyées avec succès à ${result.sent.length} invité(s).`, 'success');
      }

      await fetchGuests();
    } catch (error: any) {
      showNotification(`Erreur lors de l'envoi : ${error.message || 'Une erreur est survenue'}`, 'error');
    }
  };

  const getRSVPStatus = (guest: Guest) => {
    if (!guest.rsvp) return 'pending';
    switch (guest.rsvp.status) {
      case 'CONFIRMED':
        return 'confirmed';
      case 'DECLINED':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleExportExcel = () => {
    const data = guests.map(guest => ({
      'Prénom': guest.firstName,
      'Nom': guest.lastName,
      'Email': guest.email || '',
      'Téléphone': guest.phone || '',
      'Statut RSVP': guest.rsvp ? guest.rsvp.status : 'En attente',
      'Accompagnant': guest.plusOne ? 'Oui' : 'Non',
      'Nom Accompagnant': guest.plusOneName || '',
      'Restrictions Alimentaires': guest.dietaryRestrictions || '',
      'VIP': guest.isVIP ? 'Oui' : 'Non'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invités");

    // Téléchargement avec file-saver pour compatibilité maximale
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, "liste_invites.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    const img = new Image();
    img.src = '/images/logo.png';

    const generatePDF = (hasLogo: boolean) => {
      if (hasLogo) {
        doc.addImage(img, 'PNG', 15, 10, 50, 20);
      }

      doc.setFontSize(22);
      doc.setTextColor(40);
      doc.text("Liste de Présence", hasLogo ? 70 : 15, 25);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Événement: ${selectedInvitation?.eventTitle || 'Mariage'}`, hasLogo ? 70 : 15, 32);
      doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, hasLogo ? 70 : 15, 38);

      // Sort guests alphabetically
      const sortedGuests = [...guests].sort((a, b) => a.lastName.localeCompare(b.lastName));

      const tableData = sortedGuests.map(guest => [
        guest.lastName.toUpperCase(),
        guest.firstName,
        guest.isVIP ? 'VIP' : '',
        guest.plusOne ? (guest.plusOneName || 'Oui') : '-',
        guest.dietaryRestrictions || '',
        ''
      ]);

      autoTable(doc, {
        startY: 50,
        head: [['Nom', 'Prénom', 'VIP', 'Accompagnant', 'Restrictions', 'Présent']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [66, 66, 66] },
        styles: { fontSize: 10, cellPadding: 3, valign: 'middle', overflow: 'linebreak' },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 35 },
          1: { cellWidth: 35 },
          2: { halign: 'center', cellWidth: 15, textColor: [220, 38, 38], fontStyle: 'bold' },
          3: { cellWidth: 40 },
          4: { cellWidth: 'auto' },
          5: { cellWidth: 20 }
        },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 5) {
            const dim = 6;
            const x = data.cell.x + (data.cell.width - dim) / 2;
            const y = data.cell.y + (data.cell.height - dim) / 2;
            doc.setDrawColor(100);
            doc.rect(x, y, dim, dim);
          }
        }
      });

      // Téléchargement avec file-saver pour compatibilité maximale
      const blob = doc.output('blob');
      saveAs(blob, "liste_presence.pdf");
    };

    img.onload = () => generatePDF(true);
    img.onerror = () => generatePDF(false);
  };

  if (loadingInvitations) {
    return (
      <div className={styles.guestsPage}>
        <HeaderMobile title="Vos invités" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingSpinner}></div>
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedInvitationId || !selectedInvitation) {
    return (
      <div className={styles.guestsPage}>
        <HeaderMobile title="Vos invités" />
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <h2>Aucune invitation</h2>
            <p>Créez d'abord une invitation pour gérer vos invités.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.guestsPage}>
      <HeaderMobile title="Vos invités" />

      <main className={styles.main}>
        {/* Sélecteur d'invitation */}
        {invitations.length > 0 && (
          <div className={styles.invitationSection}>
            <label className={styles.invitationLabel}>
              <p className={styles.invitationLabelText}>Invitation</p>
              <select
                value={selectedInvitationId}
                onChange={(e) => setSelectedInvitationId(e.target.value)}
                className={styles.invitationSelect}
              >
                {invitations.map(invitation => (
                  <option key={invitation.id} value={invitation.id}>
                    {invitation.eventTitle}{invitation.eventDate ? ` - ${formatDate(invitation.eventDate)}` : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        {selectedInvitation.status === 'DRAFT' ? (
          <div className={styles.errorContainer} style={{ marginTop: '2rem' }}>
            <div className={styles.errorContent}>
              <AlertCircle size={48} className={styles.errorIcon} />
              <h2>Invitation en brouillon</h2>
              <p>Vous devez publier votre invitation avant de pouvoir gérer la liste des invités.</p>
              <button
                className={styles.modalButtonPrimary}
                onClick={() => router.push(`/client/invitations/${selectedInvitationId}`)}
                style={{ marginTop: '1rem' }}
              >
                Aller à l'invitation
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.invitationTypeSection}>
              <div className={styles.invitationTypeToggle}>
                <label className={styles.toggleOption}>
                  <input
                    type="radio"
                    name="invitationType"
                    value="email"
                    checked={invitationType === 'email'}
                    onChange={() => setInvitationType('email')}
                  />
                  <span>Email</span>
                </label>
                <label className={styles.toggleOption}>
                  <input
                    type="radio"
                    name="invitationType"
                    value="shareable"
                    checked={invitationType === 'shareable'}
                    onChange={() => setInvitationType('shareable')}
                  />
                  <span>Lien partageable</span>
                </label>
              </div>
            </div>

            {/* Shareable Link Manager */}
            {
              invitationType === 'shareable' && selectedInvitation && (
                <ShareableLinkManager invitationId={selectedInvitation.id} />
              )
            }

            {/* Actions Section */}
            <div className={styles.actionsSection}>
              <div className={styles.actionsRow}>
                <button
                  className={`${styles.actionButton} ${styles.primary}`}
                  onClick={handleAddGuest}
                >
                  <Plus size={20} />
                  <span>Ajouter un invité</span>
                </button>
                <button
                  className={`${styles.actionButton} ${styles.secondary}`}
                  onClick={handleBulkImport}
                >
                  <Download size={20} />
                  <span>Import en masse</span>
                </button>
                <button
                  className={`${styles.actionButton} ${styles.export}`}
                  onClick={handleExportClick}
                  title="Exporter la liste"
                >
                  <Upload size={20} />
                  <span>Exporter la liste</span>
                </button>
              </div>
              {/* Bouton pour envoyer à tous les invités sans réponse */}
              {pendingGuestsCount > 0 && (
                <div className={styles.bulkSendSection}>
                  <button
                    className={`${styles.actionButton} ${styles.bulkSend}`}
                    onClick={handleSendInvitationsToPending}
                    disabled={loadingGuests}
                  >
                    <Send size={20} />
                    <span>
                      Envoyer à tous les invités sans réponse ({pendingGuestsCount})
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Search and Filters */}
            <div className={styles.searchFiltersSection}>
              <div className={styles.searchContainer}>
                <div className={styles.searchWrapper}>
                  <Search size={20} className={styles.searchIcon} />
                  <input
                    type="search"
                    className={styles.searchInput}
                    placeholder="Rechercher un invité..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.filtersRow}>
                <div className={styles.filterDropdown} ref={rsvpFilterRef}>
                  <button
                    className={`${styles.filterButton} ${rsvpFilter !== 'all' ? styles.filterActive : ''}`}
                    onClick={() => {
                      setShowRsvpFilter(!showRsvpFilter);
                      setShowTypeFilter(false);
                    }}
                  >
                    <span>Statut RSVP</span>
                    <ChevronDown size={16} className={showRsvpFilter ? styles.chevronUp : ''} />
                  </button>
                  {showRsvpFilter && (
                    <div className={styles.filterDropdownMenu}>
                      <button
                        className={`${styles.filterOption} ${rsvpFilter === 'all' ? styles.filterOptionActive : ''}`}
                        onClick={() => {
                          setRsvpFilter('all');
                          setShowRsvpFilter(false);
                        }}
                      >
                        Tous
                      </button>
                      <button
                        className={`${styles.filterOption} ${rsvpFilter === 'CONFIRMED' ? styles.filterOptionActive : ''}`}
                        onClick={() => {
                          setRsvpFilter('CONFIRMED');
                          setShowRsvpFilter(false);
                        }}
                      >
                        Confirmé
                      </button>
                      <button
                        className={`${styles.filterOption} ${rsvpFilter === 'PENDING' ? styles.filterOptionActive : ''}`}
                        onClick={() => {
                          setRsvpFilter('PENDING');
                          setShowRsvpFilter(false);
                        }}
                      >
                        En attente
                      </button>
                      <button
                        className={`${styles.filterOption} ${rsvpFilter === 'DECLINED' ? styles.filterOptionActive : ''}`}
                        onClick={() => {
                          setRsvpFilter('DECLINED');
                          setShowRsvpFilter(false);
                        }}
                      >
                        Refusé
                      </button>
                    </div>
                  )}
                </div>
                <div className={styles.filterDropdown} ref={typeFilterRef}>
                  <button
                    className={`${styles.filterButton} ${typeFilter !== 'all' ? styles.filterActive : ''}`}
                    onClick={() => {
                      setShowTypeFilter(!showTypeFilter);
                      setShowRsvpFilter(false);
                    }}
                  >
                    <span>Type</span>
                    <ChevronDown size={16} className={showTypeFilter ? styles.chevronUp : ''} />
                  </button>
                  {showTypeFilter && (
                    <div className={styles.filterDropdownMenu}>
                      <button
                        className={`${styles.filterOption} ${typeFilter === 'all' ? styles.filterOptionActive : ''}`}
                        onClick={() => {
                          setTypeFilter('all');
                          setShowTypeFilter(false);
                        }}
                      >
                        Tous
                      </button>
                      <button
                        className={`${styles.filterOption} ${typeFilter === 'PERSONAL' ? styles.filterOptionActive : ''}`}
                        onClick={() => {
                          setTypeFilter('PERSONAL');
                          setShowTypeFilter(false);
                        }}
                      >
                        Email
                      </button>
                      <button
                        className={`${styles.filterOption} ${typeFilter === 'SHAREABLE' ? styles.filterOptionActive : ''}`}
                        onClick={() => {
                          setTypeFilter('SHAREABLE');
                          setShowTypeFilter(false);
                        }}
                      >
                        Lien partageable
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Guests List */}
            <div className={styles.guestsList}>
              {loadingGuests ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.loadingSpinner}></div>
                </div>
              ) : filteredGuests.length === 0 ? (
                <div className={styles.emptyState}>
                  <User size={48} />
                  <h3>Aucun invité trouvé</h3>
                  <p>
                    {searchQuery || rsvpFilter !== 'all' || typeFilter !== 'all'
                      ? 'Aucun invité ne correspond à vos critères de recherche.'
                      : 'Commencez par ajouter vos premiers invités.'}
                  </p>
                </div>
              ) : (
                filteredGuests.map((guest) => {
                  const rsvpStatus = getRSVPStatus(guest);
                  const hasRSVP = !!guest.rsvp;

                  return (
                    <div key={guest.id} className={styles.guestCard}>
                      <div className={styles.guestHeader}>
                        <div className={styles.guestInfo}>
                          <div className={styles.guestNameRow}>
                            <p className={styles.guestName}>
                              {guest.firstName} {guest.lastName}
                            </p>
                            {guest.isVIP && (
                              <span className={styles.vipBadge}>VIP</span>
                            )}
                          </div>
                          <span className={`${styles.rsvpStatus} ${styles[rsvpStatus]}`}>
                            {rsvpStatus === 'confirmed' && 'Confirmé'}
                            {rsvpStatus === 'pending' && 'En attente'}
                            {rsvpStatus === 'rejected' && 'Refusé'}
                          </span>
                          {guest.email && (
                            <p className={styles.guestContact}>{guest.email}</p>
                          )}
                          {guest.phone && (
                            <p className={styles.guestContact}>{guest.phone}</p>
                          )}
                        </div>
                        {guest.profilePhotoUrl ? (
                          <img
                            src={guest.profilePhotoUrl}
                            alt={`${guest.firstName} ${guest.lastName}`}
                            className={styles.guestAvatar}
                          />
                        ) : (
                          <div className={styles.guestAvatar}>
                            <User size={24} />
                          </div>
                        )}
                      </div>

                      {(guest.plusOneName || guest.dietaryRestrictions || guest.invitationSentAt) && (
                        <div className={styles.guestDetails}>
                          {guest.plusOneName && (
                            <p className={styles.guestDetailItem}>
                              Accompagnant : {guest.plusOneName}
                            </p>
                          )}
                          {guest.dietaryRestrictions && (
                            <p className={styles.guestDetailItem}>
                              Restrictions : {guest.dietaryRestrictions}
                            </p>
                          )}
                          {guest.invitationSentAt && (
                            <p className={styles.guestDate}>
                              Invitation envoyée le {formatDate(guest.invitationSentAt)}
                            </p>
                          )}
                        </div>
                      )}

                      <div className={styles.guestActions}>
                        {/* Bouton Rappel uniquement pour les invités en attente qui ont déjà reçu une invitation */}
                        {rsvpStatus === 'pending' && guest.invitationSentAt ? (
                          <button
                            className={`${styles.guestActionButton} ${styles.reminder}`}
                            onClick={() => handleSendReminder(guest.id)}
                          >
                            <Bell size={18} />
                            <span>Rappel</span>
                          </button>
                        ) : /* Bouton Envoyer l'invitation pour les invités sans réponse */
                          !hasRSVP || rsvpStatus === 'pending' ? (
                            <button
                              className={`${styles.guestActionButton} ${styles.send}`}
                              onClick={() => handleSendInvitation(guest.id)}
                            >
                              <Send size={18} />
                              <span>Envoyer l'invitation</span>
                            </button>
                          ) : /* Pas de bouton d'action pour les invités qui ont déjà répondu (confirmé ou décliné) */
                            null}
                        <button
                          className={`${styles.guestActionButton} ${styles.delete}`}
                          onClick={() => handleDeleteGuest(guest.id)}
                        >
                          Retirer
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

      </main >

      {/* Modals */}
      < AddGuestModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreate={fetchGuests}
        invitationId={selectedInvitationId}
      />
      <BulkImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={fetchGuests}
        invitationId={selectedInvitationId}
        previewImport={previewImport}
        bulkImport={bulkImport}
        downloadTemplate={downloadTemplate}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
      />

      {notification && (
        <div className={`${styles.notificationToast} ${styles[notification.type]}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}
    </div >
  );
}
