'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatBox } from '@/components/Messages/ChatBox';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { useInvitations } from '@/hooks/useInvitations';
import styles from './discussions.module.css';

export default function ClientDiscussionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
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

  // Rediriger si pas un couple
  useEffect(() => {
    if (user && user.role !== 'COUPLE') {
      router.push('/');
    }
  }, [user, router]);

  if (authLoading || invitationsLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💬</div>
          <h2>Aucune invitation trouvée</h2>
          <p>Vous devez créer une invitation pour pouvoir utiliser la messagerie.</p>
          <button 
            onClick={() => router.push('/client/invitations')}
            className={styles.createButton}
          >
            Créer une invitation
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Erreur de connexion</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Discussions</h1>
          <div className={styles.headerInfo}>
            <span className={styles.invitationName}>
              {(() => {
                const currentInvitation = invitations.find(inv => inv.id === selectedInvitationId);
                return currentInvitation?.title || currentInvitation?.coupleName || 'Support';
              })()}
            </span>
            {unreadCount > 0 && (
              <span className={styles.unreadBadge}>
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Sélecteur d'invitation si plusieurs */}
        {invitations.length > 1 && (
          <div className={styles.invitationSelector}>
            <label htmlFor="invitation-select">Invitation :</label>
            <select
              id="invitation-select"
              value={selectedInvitationId || ''}
              onChange={(e) => setSelectedInvitationId(e.target.value)}
              className={styles.select}
            >
              {invitations.map(invitation => (
                <option key={invitation.id} value={invitation.id}>
                  {invitation.title || invitation.coupleName || `Invitation ${invitation.id.slice(-8)}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

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
            <div className={styles.noConversationIcon}>💬</div>
            <h3>Sélectionnez une invitation</h3>
            <p>Choisissez une invitation pour commencer la conversation avec notre équipe.</p>
          </div>
        )}
      </div>

      {/* Informations d'aide */}
      <div className={styles.helpInfo}>
        <div className={styles.helpIcon}>ℹ️</div>
        <div className={styles.helpText}>
          <p><strong>Besoin d'aide ?</strong></p>
          <p>Notre équipe est là pour vous accompagner dans l'organisation de votre mariage. N'hésitez pas à nous poser toutes vos questions !</p>
        </div>
      </div>
    </div>
  );
}
