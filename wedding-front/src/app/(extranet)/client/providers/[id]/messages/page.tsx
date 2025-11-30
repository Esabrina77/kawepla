'use client';

import React, { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { HeaderMobile } from '@/components/HeaderMobile';
import { useProviderConversation, useProviderConversations } from '@/hooks/useProviderConversations';
import { useProviderDetail } from '@/hooks/useProviderDetail';
import { ProviderMessage } from '@/lib/api/providerConversations';
import { Send, ArrowLeft, Calendar, Users, MessageCircle } from 'lucide-react';
import styles from './messages.module.css';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';

// Composant Message mémorisé pour éviter les re-renders inutiles
const MessageItem = memo(({
  message,
  providerBusinessName,
  isSystemMessage
}: {
  message: ProviderMessage;
  providerBusinessName: string;
  isSystemMessage: (type: string) => boolean;
}) => {
  const isSystem = isSystemMessage(message.messageType);
  const isBookingMessage = message.messageType?.startsWith('BOOKING_');
  const isClient = message.sender?.role === 'HOST' || message.sender?.role === 'GUEST';

  return (
    <div
      className={`${styles.message} ${isSystem ? styles.systemMessage : ''} ${isBookingMessage ? styles.bookingMessage : ''} ${isClient ? styles.clientMessage : styles.providerMessage}`}
    >
      {!isSystem && (
        <div className={styles.messageAvatar}>
          {isClient
            ? (message.sender?.firstName?.[0] || 'C')
            : (providerBusinessName[0] || 'P')
          }
        </div>
      )}
      <div className={styles.messageContent}>
        {!isSystem && (
          <div className={styles.messageHeader}>
            <span className={styles.messageSender}>
              {isClient
                ? `${message.sender?.firstName || ''} ${message.sender?.lastName || ''}`.trim() || 'Vous'
                : providerBusinessName
              }
            </span>
            <span className={styles.messageTime}>
              {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}
        <div className={styles.messageText}>{message.content}</div>
      </div>
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

export default function ProviderMessagesPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const { provider, services, loading: providerLoading } = useProviderDetail(providerId);
  const { conversations, getOrCreateConversation, loading: conversationsLoading, error: conversationsError } = useProviderConversations('HOST');

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const isCreatingRef = React.useRef(false);

  const { conversation, messages, sendMessage, markAsRead, loading: messagesLoading, error: messagesError } = useProviderConversation(conversationId);

  const isSystemMessage = useCallback((messageType: string) => {
    return ['SYSTEM', 'BOOKING_CREATED', 'BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'BOOKING_COMPLETED'].includes(messageType);
  }, []);

  // Mémoriser la liste des messages pour éviter les re-renders inutiles
  const memoizedMessages = useMemo(() => {
    if (!provider) return [];
    return messages.map((message) => (
      <MessageItem
        key={message.id}
        message={message}
        providerBusinessName={provider.businessName}
        isSystemMessage={isSystemMessage}
      />
    ));
  }, [messages, provider?.businessName, isSystemMessage]);

  // Sélectionner le premier service par défaut
  useEffect(() => {
    if (services && services.length > 0 && !selectedService) {
      setSelectedService(services[0]);
    }
  }, [services, selectedService]);

  // Trouver ou créer la conversation (une seule fois)
  const conversationsRef = useRef(conversations);
  const getOrCreateConversationRef = useRef(getOrCreateConversation);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    getOrCreateConversationRef.current = getOrCreateConversation;
  }, [getOrCreateConversation]);

  useEffect(() => {
    // Ne rien faire si on a déjà un conversationId ou si on est en train de créer
    if (conversationId || isCreatingRef.current || !provider || conversationsLoading) {
      return;
    }

    // Chercher une conversation existante avec ce provider
    const existingConversation = conversationsRef.current.find(c => c.providerId === providerId && c.status === 'ACTIVE');

    if (existingConversation) {
      setConversationId(existingConversation.id);
    } else if (!isCreatingRef.current) {
      // Créer une nouvelle conversation (une seule fois)
      isCreatingRef.current = true;
      getOrCreateConversationRef.current({
        providerId,
        subject: `Discussion avec ${provider.businessName}`
      }).then(conv => {
        setConversationId(conv.id);
        isCreatingRef.current = false;
      }).catch(err => {
        console.error('Erreur lors de la création de la conversation:', err);
        isCreatingRef.current = false;
      });
    }
  }, [provider?.id, providerId, conversationsLoading, conversationId]); // Retirer conversations et getOrCreateConversation

  // Marquer comme lu quand on ouvre la conversation (une seule fois)
  const markAsReadRef = useRef(markAsRead);
  const hasMarkedAsReadRef = useRef<string | null>(null);

  useEffect(() => {
    markAsReadRef.current = markAsRead;
  }, [markAsRead]);

  useEffect(() => {
    if (conversationId && hasMarkedAsReadRef.current !== conversationId) {
      hasMarkedAsReadRef.current = conversationId;
      markAsReadRef.current();
    }
  }, [conversationId]); // SEULEMENT conversationId comme dépendance

  // Scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !conversationId || sending) return;

    try {
      setSending(true);
      await sendMessage({
        content: messageText.trim(),
        messageType: 'TEXT'
      });
      setMessageText('');
      // Le message est déjà ajouté par sendMessage, pas besoin de rafraîchir
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Erreur lors de l\'envoi du message'
      });
    } finally {
      setSending(false);
    }
  };

  if (providerLoading || conversationsLoading) {
    return (
      <div className={styles.messagesPage}>
        <HeaderMobile title="Messages" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className={styles.messagesPage}>
        <HeaderMobile title="Messages" />
        <div className={styles.errorContainer}>
          <p>Prestataire non trouvé</p>
          <Link href="/client/providers" className={styles.backButton}>
            <ArrowLeft size={16} />
            Retour aux prestataires
          </Link>
        </div>
      </div>
    );
  }

  if (conversationsError) {
    console.error('Erreur lors du chargement des conversations:', conversationsError);
  }

  return (
    <div className={styles.messagesPage}>
      <HeaderMobile
        title={provider.businessName}
      />

      <div className={styles.messagesContainer}>
        {/* Message d'erreur si problème de chargement */}
        {conversationsError && (
          <div className={styles.errorMessage}>
            <p>Erreur lors du chargement des conversations : {conversationsError}</p>
          </div>
        )}

        {/* Header de la conversation */}
        <div className={styles.conversationHeader}>
          <div className={styles.providerInfo}>
            {provider.profilePhoto && (
              <img
                src={provider.profilePhoto}
                alt={provider.businessName}
                className={styles.providerAvatar}
              />
            )}
            <div className={styles.providerDetails}>
              <h3>{provider.businessName}</h3>
              {provider.category && (
                <p className={styles.category}>{provider.category.name}</p>
              )}
            </div>
          </div>
          {conversation && (
            <Link
              href={`/client/providers/${providerId}/book?conversationId=${conversation.id}${selectedService ? `&serviceId=${selectedService.id}` : ''}`}
              className={styles.bookButton}
            >
              {selectedService ? 'Réserver' : 'Demander un devis'}
            </Link>
          )}
        </div>

        {/* Messages */}
        <div className={styles.messagesList}>
          {messagesLoading && messages.length === 0 ? (
            <div className={styles.loadingMessages}>
              <div className={styles.loadingSpinner}></div>
            </div>
          ) : messages.length === 0 ? (
            <div className={styles.emptyMessages}>
              <MessageCircle size={48} />
              <p>Commencez la conversation avec {provider.businessName}</p>
            </div>
          ) : (
            memoizedMessages
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulaire d'envoi */}
        {conversationId ? (
          <form onSubmit={handleSendMessage} className={styles.messageForm}>
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Tapez votre message..."
              className={styles.messageInput}
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!messageText.trim() || sending}
              className={styles.sendButton}
            >
              <Send size={20} />
            </button>
          </form>
        ) : (
          <div className={styles.messageForm}>
            <input
              type="text"
              placeholder="Chargement de la conversation..."
              className={styles.messageInput}
              disabled
            />
            <button
              type="button"
              disabled
              className={styles.sendButton}
            >
              <Send size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

