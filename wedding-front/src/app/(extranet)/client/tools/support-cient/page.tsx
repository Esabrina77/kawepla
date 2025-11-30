'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatBox } from '@/components/Messages/ChatBox';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { useInvitations } from '@/hooks/useInvitations';
import { 
  MessageSquare, 
  AlertCircle, 
  Plus, 
  RefreshCw, 
  Info,
  Users
} from 'lucide-react';
import styles from './discussions.module.css';

export default function ClientDiscussionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { invitations, loading: invitationsLoading } = useInvitations();
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);

  // Utiliser la première invitation par défaut
  useEffect(() => {
    if (invitations.length > 0 && !selectedInvitationId) {
      setSelectedInvitationId(invitations[0].id);
    }
  }, [invitations, selectedInvitationId]);

  const {
    conversation,
    messages,
    loading: messagesLoading,
    error,
    hasMore,
    unreadCount,
    typingUsers,
    connected,
    loadConversation,
    loadMoreMessages,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    loadUnreadCount
  } = useMessages(selectedInvitationId || undefined);

  // Charger le compteur de messages non lus
  useEffect(() => {
    loadUnreadCount();
  }, []);

  // Rediriger si pas authentifié
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Rediriger si pas un organisateur
  useEffect(() => {
    if (user && user.role !== 'HOST') {
      router.push('/');
    }
  }, [user, router]);

  if (authLoading || invitationsLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Chargement...</p>
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <MessageSquare className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>Aucune invitation trouvée</h2>
          <p className={styles.emptyText}>Vous devez créer une invitation pour pouvoir utiliser la messagerie.</p>
          <button 
            onClick={() => router.push('/client/invitations')}
            className={styles.createButton}
          >
            <Plus className={styles.buttonIcon} />
            Créer une invitation
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <AlertCircle className={styles.errorIcon} />
          <h2 className={styles.errorTitle}>Erreur de connexion</h2>
          <p className={styles.errorText}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            <RefreshCw className={styles.buttonIcon} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.badge}>
          <MessageSquare className={styles.badgeIcon} />
          Discussions
        </div>
        
        <h1 className={styles.title}>
          Support & <span className={styles.titleAccent}>Assistance</span>
        </h1>
        
        <p className={styles.subtitle}>
          Échangez avec notre équipe pour l'organisation de votre événement
        </p>
      </div>

      {/* Invitation Selector */}
      {invitations.length > 1 && (
        <div className={styles.invitationSelector}>
          <label htmlFor="invitation-select" className={styles.selectorLabel}>
            <Users className={styles.selectorIcon} />
            Sélectionner l'invitation :
          </label>
          <select
            id="invitation-select"
            value={selectedInvitationId || ''}
            onChange={(e) => setSelectedInvitationId(e.target.value)}
            className={styles.selector}
          >
            {invitations.map(invitation => (
              <option key={invitation.id} value={invitation.id}>
                {invitation.eventTitle || `Invitation ${invitation.id.slice(-8)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Chat Container */}
      <div className={styles.chatContainer}>
        {selectedInvitationId ? (
          <ChatBox
            messages={messages}
            currentUserId={user?.id || ''}
            loading={messagesLoading}
            hasMore={hasMore}
            typingUsers={typingUsers}
            connected={connected}
            onSendMessage={sendMessage}
            onLoadMore={loadMoreMessages}
            onStartTyping={startTyping}
            onStopTyping={stopTyping}
            onMarkAsRead={markAsRead}
          />
        ) : (
          <div className={styles.noConversation}>
            <MessageSquare className={styles.noConversationIcon} />
            <h3 className={styles.noConversationTitle}>Sélectionnez une invitation</h3>
            <p className={styles.noConversationText}>
              Choisissez une invitation pour commencer la conversation avec notre équipe.
            </p>
          </div>
        )}
      </div>

      {/* Help Info */}
      <div className={styles.helpInfo}>
        <Info className={styles.helpIcon} />
        <div className={styles.helpText}>
          <p className={styles.helpTitle}>
            <strong>Besoin d'aide ?</strong>
          </p>
          <p className={styles.helpDescription}>
            Notre équipe est là pour vous accompagner dans l'organisation de votre événement. 
            N'hésitez pas à nous poser toutes vos questions !
          </p>
        </div>
      </div>
    </div>
  );
}
