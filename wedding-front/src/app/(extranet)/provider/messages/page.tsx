'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useProviderProfile } from '@/hooks/useProviderProfile';
import { useProviderConversations, useProviderConversation } from '@/hooks/useProviderConversations';
import { ProviderMessage } from '@/lib/api/providerConversations';
import { HeaderMobile } from '@/components/HeaderMobile';
import { MessageCircle, Send, Search, User, Calendar, Briefcase } from 'lucide-react';
import styles from './messages.module.css';
import Link from 'next/link';

// Composant Message mémorisé pour éviter les re-renders inutiles
const MessageItem = memo(({ 
  message, 
  providerBusinessName, 
  clientName,
  isSystemMessage,
  isProvider,
  conversationId
}: { 
  message: ProviderMessage; 
  providerBusinessName?: string;
  clientName?: string;
  isSystemMessage: (type: string) => boolean;
  isProvider: boolean;
  conversationId?: string;
}) => {
  const isSystem = isSystemMessage(message.messageType);
  const isBookingMessage = message.messageType?.startsWith('BOOKING_');
  
  return (
    <div
      className={`${styles.message} ${isSystem ? styles.systemMessage : ''} ${isBookingMessage ? styles.bookingMessage : ''} ${isProvider ? styles.providerMessage : styles.clientMessage}`}
    >
      {!isSystem && (
        <div className={styles.messageAvatar}>
          {isProvider
            ? (providerBusinessName?.[0] || 'P')
            : (message.sender?.firstName?.[0] || 'C')}
        </div>
      )}
      <div className={styles.messageContent}>
        {!isSystem && (
          <div className={styles.messageHeader}>
            <span className={styles.messageSender}>
              {isProvider
                ? providerBusinessName || 'Vous'
                : clientName || `${message.sender?.firstName || ''} ${message.sender?.lastName || ''}`.trim() || 'Client'}
            </span>
            <span className={styles.messageTime}>
              {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}
        <div className={styles.messageText}>
          {message.content}
          {isBookingMessage && conversationId && isProvider && (
            <Link 
              href={`/provider/bookings?conversationId=${conversationId}`}
              className={styles.viewBookingButton}
            >
              Voir la réservation
            </Link>
          )}
        </div>
      </div>
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

export default function ProviderMessagesPage() {
  const router = useRouter();
  const { profile } = useProviderProfile();
  const { conversations, loading: conversationsLoading, refetch } = useProviderConversations('PROVIDER');
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { conversation, messages, sendMessage, markAsRead, loading: messagesLoading } = useProviderConversation(selectedConversationId);

  // Filtrer les conversations selon la recherche
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.client?.firstName?.toLowerCase().includes(query) ||
      conv.client?.lastName?.toLowerCase().includes(query) ||
      conv.client?.email?.toLowerCase().includes(query) ||
      conv.service?.name?.toLowerCase().includes(query) ||
      conv.subject?.toLowerCase().includes(query)
    );
  });

  // Sélectionner la première conversation par défaut
  useEffect(() => {
    if (filteredConversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(filteredConversations[0].id);
    }
  }, [filteredConversations, selectedConversationId]);

  // Marquer comme lu quand on sélectionne une conversation (une seule fois)
  const markAsReadRef = useRef(markAsRead);
  const hasMarkedAsReadRef = useRef<string | null>(null);
  
  useEffect(() => {
    markAsReadRef.current = markAsRead;
  }, [markAsRead]);

  useEffect(() => {
    if (selectedConversationId && hasMarkedAsReadRef.current !== selectedConversationId) {
      hasMarkedAsReadRef.current = selectedConversationId;
      markAsReadRef.current();
    }
  }, [selectedConversationId]); // SEULEMENT selectedConversationId comme dépendance

  // Scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversationId || sending) return;

    try {
      setSending(true);
      await sendMessage({
        content: messageText.trim(),
        messageType: 'TEXT'
      });
      setMessageText('');
      // Le message est déjà ajouté par sendMessage, et le polling rafraîchira automatiquement
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const isSystemMessage = (messageType: string) => {
    return ['SYSTEM', 'BOOKING_CREATED', 'BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'BOOKING_COMPLETED'].includes(messageType);
  };

  const getUnreadCount = (conv: any) => {
    if (!conv.messages || conv.messages.length === 0) return 0;
    return conv.messages.filter((m: any) => !m.isRead && m.senderId !== profile?.userId).length;
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hier';
    } else if (days < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  if (conversationsLoading) {
    return (
      <div className={styles.messagesPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.messagesPage}>
      {/* Header Sticky */}
      <HeaderMobile title="Messages" />

      <div className={styles.messagesLayout}>
        {/* Liste des conversations */}
        <aside className={styles.conversationsList}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {filteredConversations.length === 0 ? (
            <div className={styles.emptyConversations}>
              <MessageCircle size={48} />
              <p>Aucune conversation</p>
            </div>
          ) : (
            <div className={styles.conversations}>
              {filteredConversations.map((conv) => {
                const unreadCount = getUnreadCount(conv);
                const lastMessage = conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;
                const isSelected = selectedConversationId === conv.id;

                return (
                  <div
                    key={conv.id}
                    className={`${styles.conversationItem} ${isSelected ? styles.selected : ''}`}
                    onClick={() => setSelectedConversationId(conv.id)}
                  >
                    <div className={styles.conversationAvatar}>
                      {conv.client?.firstName?.[0] || 'C'}
                    </div>
                    <div className={styles.conversationContent}>
                      <div className={styles.conversationHeader}>
                        <h3 className={styles.conversationName}>
                          {conv.client ? `${conv.client.firstName} ${conv.client.lastName}` : 'Client'}
                        </h3>
                        {lastMessage && (
                          <span className={styles.conversationTime}>
                            {formatLastMessageTime(lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className={styles.conversationPreview}>
                        {lastMessage ? (
                          <p className={styles.lastMessage}>
                            {lastMessage.content.length > 50
                              ? `${lastMessage.content.substring(0, 50)}...`
                              : lastMessage.content}
                          </p>
                        ) : (
                          <p className={styles.noMessage}>Aucun message</p>
                        )}
                        {unreadCount > 0 && (
                          <span className={styles.unreadBadge}>{unreadCount}</span>
                        )}
                      </div>
                      {conv.service && (
                        <div className={styles.serviceBadge}>
                          <Briefcase size={12} />
                          {conv.service.name}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        {/* Zone de messages */}
        <main className={styles.messagesArea}>
          {!selectedConversationId ? (
            <div className={styles.noConversationSelected}>
              <MessageCircle size={64} />
              <p>Sélectionnez une conversation</p>
            </div>
          ) : !conversation ? (
            <div className={styles.loadingMessages}>
              <div className={styles.loadingSpinner}></div>
            </div>
          ) : (
            <>
              {/* Header de la conversation */}
              <div className={styles.conversationHeader}>
                <div className={styles.conversationInfo}>
                  <div className={styles.conversationAvatar}>
                    {conversation.client?.firstName?.[0] || 'C'}
                  </div>
                  <div className={styles.conversationDetails}>
                    <h3>
                      {conversation.client
                        ? `${conversation.client.firstName} ${conversation.client.lastName}`
                        : 'Client'}
                    </h3>
                    {conversation.service && (
                      <div className={styles.serviceInfo}>
                        <Briefcase size={14} />
                        <span>{conversation.service.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                {conversation.service && (
                  <Link
                    href={`/provider/bookings?conversationId=${conversation.id}`}
                    className={styles.viewBookingButton}
                  >
                    Voir la réservation
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
                    <p>Aucun message dans cette conversation</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isProviderMessage = Boolean(
                      message.sender?.role === 'PROVIDER' || 
                      (profile && message.senderId === profile.userId)
                    );
                    
                    return (
                      <MessageItem
                        key={message.id}
                        message={message}
                        providerBusinessName={profile?.businessName}
                        clientName={conversation?.client ? `${conversation.client.firstName} ${conversation.client.lastName}` : undefined}
                        isSystemMessage={isSystemMessage}
                        isProvider={isProviderMessage}
                        conversationId={selectedConversationId || undefined}
                      />
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Formulaire d'envoi */}
              <form onSubmit={handleSendMessage} className={styles.messageForm}>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Tapez votre message..."
                  className={styles.messageInput}
                  disabled={sending || !selectedConversationId}
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || sending || !selectedConversationId}
                  className={styles.sendButton}
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

