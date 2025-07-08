'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatBox } from '@/components/Messages/ChatBox';
import { useAuth } from '@/hooks/useAuth';
import { MessagesAPI, Conversation } from '@/lib/api/messages';
import { useSocket } from '@/hooks/useSocket';
import styles from './discussions.module.css';

export default function AdminDiscussionsPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED' | 'CLOSED'>('ACTIVE');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const socket = useSocket({ token: token || undefined, enabled: !!token });

  // Rediriger si pas authentifié ou pas admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Charger les conversations
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadConversations();
    }
  }, [user, statusFilter]);

  // Configurer les événements WebSocket
  useEffect(() => {
    if (!socket.connected) return;

    socket.on({
      onNewClientMessage: (data) => {
        // Mettre à jour la liste des conversations
        loadConversations();
        
        // Si c'est la conversation sélectionnée, ajouter le message
        if (selectedConversation && data.conversationId === selectedConversation.id) {
          setMessages(prev => {
            // Éviter les doublons en vérifiant si le message existe déjà
            const messageExists = prev.some(msg => msg.id === data.message.id);
            if (messageExists) return prev;
            return [...prev, data.message];
          });
        }
      },
      onNewMessage: (data) => {
        if (selectedConversation && data.conversationId === selectedConversation.id) {
          setMessages(prev => {
            // Éviter les doublons en vérifiant si le message existe déjà
            const messageExists = prev.some(msg => msg.id === data.message.id);
            if (messageExists) return prev;
            return [...prev, data.message];
          });
        }
      },
      onUserTyping: (data) => {
        if (selectedConversation && data.conversationId === selectedConversation.id) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (data.isTyping) {
              newSet.add(data.userId);
            } else {
              newSet.delete(data.userId);
            }
            return newSet;
          });
        }
      },
      onError: (error) => {
        setError(error.message);
      }
    });
  }, [socket.connected, selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MessagesAPI.getAdminConversations(statusFilter === 'ALL' ? undefined : statusFilter);
      setConversations(data);
    } catch (err) {
      setError('Erreur lors du chargement des conversations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
    setTypingUsers(new Set());

    try {
      // Rejoindre la conversation WebSocket
      socket.joinConversation(conversation.id);
      
      // Charger les messages
      const messagesData = await MessagesAPI.getMessages(conversation.id);
      setMessages(messagesData.messages);
      
      // Marquer comme lu
      await MessagesAPI.markAsRead(conversation.id);
      
    } catch (err) {
      setError('Erreur lors du chargement des messages');
      console.error(err);
    }
  };

  const sendMessage = async (content: string) => {
    if (!selectedConversation) return;

    try {
      socket.sendMessage(selectedConversation.id, content);
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
      console.error(err);
    }
  };

  const assignToMe = async (conversation: Conversation) => {
    if (!user) return;

    try {
      await MessagesAPI.assignAdmin(conversation.id, user.id);
      loadConversations();
    } catch (err) {
      setError('Erreur lors de l\'assignation');
      console.error(err);
    }
  };

  const archiveConversation = async (conversation: Conversation) => {
    try {
      await MessagesAPI.archiveConversation(conversation.id);
      loadConversations();
      if (selectedConversation?.id === conversation.id) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (err) {
      setError('Erreur lors de l\'archivage');
      console.error(err);
    }
  };

  const restoreConversation = async (conversation: Conversation) => {
    try {
      await MessagesAPI.restoreConversation(conversation.id);
      loadConversations();
    } catch (err) {
      setError('Erreur lors de la restauration');
      console.error(err);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    // Filtre par statut
    if (statusFilter !== 'ALL' && conv.status !== statusFilter) {
      return false;
    }
    
    // Filtre par recherche
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      conv.user.firstName.toLowerCase().includes(query) ||
      conv.user.lastName.toLowerCase().includes(query) ||
      conv.user.email.toLowerCase().includes(query) ||
      conv.invitation?.coupleName?.toLowerCase().includes(query) ||
      conv.invitation?.title?.toLowerCase().includes(query)
    );
  });

  const formatLastMessage = (conversation: Conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return 'Aucun message';
    }
    
    const lastMessage = conversation.messages[0];
    const isOwn = lastMessage.senderId === user?.id;
    const prefix = isOwn ? 'Vous: ' : '';
    
    return `${prefix}${lastMessage.content.substring(0, 50)}${lastMessage.content.length > 50 ? '...' : ''}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'ARCHIVED':
        return 'Archivée';
      case 'CLOSED':
        return 'Fermée';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return styles.statusActive;
      case 'ARCHIVED':
        return styles.statusArchived;
      case 'CLOSED':
        return styles.statusClosed;
      default:
        return '';
    }
  };

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Discussions</h2>
          <button onClick={loadConversations} className={styles.refreshButton}>
            🔄
          </button>
        </div>

        <div className={styles.filtersContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.statusFilter}>
            <label htmlFor="status-filter">Statut :</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'ARCHIVED' | 'CLOSED')}
              className={styles.statusSelect}
            >
              <option value="ALL">Toutes</option>
              <option value="ACTIVE">Actives</option>
              <option value="ARCHIVED">Archivées</option>
              <option value="CLOSED">Fermées</option>
            </select>
          </div>
        </div>

        <div className={styles.conversationsList}>
          {loading && (
            <div className={styles.loadingItem}>
              <div className={styles.spinner}></div>
              <span>Chargement...</span>
            </div>
          )}

          {!loading && filteredConversations.length === 0 && (
            <div className={styles.emptyConversations}>
              <p>Aucune conversation trouvée</p>
            </div>
          )}

          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`${styles.conversationItem} ${
                selectedConversation?.id === conversation.id ? styles.selected : ''
              }`}
              onClick={() => selectConversation(conversation)}
            >
              <div className={styles.conversationHeader}>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>
                    {conversation.user.firstName} {conversation.user.lastName}
                  </span>
                  <span className={styles.userEmail}>{conversation.user.email}</span>
                </div>
                <div className={styles.conversationMeta}>
                  <span className={styles.time}>
                    {formatTime(conversation.lastMessageAt)}
                  </span>
                  <span className={`${styles.statusBadge} ${getStatusColor(conversation.status)}`}>
                    {getStatusLabel(conversation.status)}
                  </span>
                  {conversation._count && conversation._count.messages > 0 && (
                    <span className={styles.unreadCount}>
                      {conversation._count.messages}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.conversationPreview}>
                <div className={styles.invitationInfo}>
                  <span className={styles.invitationName}>
                    {conversation.invitation?.title || conversation.invitation?.coupleName}
                  </span>
                </div>
                <div className={styles.lastMessage}>
                  {formatLastMessage(conversation)}
                </div>
              </div>

              <div className={styles.conversationActions}>
                {conversation.status === 'ACTIVE' && (
                  <>
                    {!conversation.adminId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          assignToMe(conversation);
                        }}
                        className={styles.assignButton}
                      >
                        M'assigner
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        archiveConversation(conversation);
                      }}
                      className={styles.archiveButton}
                    >
                      Archiver
                    </button>
                  </>
                )}
                {conversation.status === 'ARCHIVED' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      restoreConversation(conversation);
                    }}
                    className={styles.restoreButton}
                  >
                    Restaurer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.chatArea}>
        {selectedConversation ? (
          <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
              <div className={styles.chatUserInfo}>
                <h3>
                  {selectedConversation.user.firstName} {selectedConversation.user.lastName}
                </h3>
                <span className={styles.chatUserEmail}>
                  {selectedConversation.user.email}
                </span>
                <span className={styles.chatInvitation}>
                  {selectedConversation.invitation?.title || selectedConversation.invitation?.coupleName}
                </span>
              </div>
              <div className={styles.chatActions}>
                <button
                  onClick={() => archiveConversation(selectedConversation)}
                  className={styles.archiveButton}
                >
                  Archiver
                </button>
              </div>
            </div>

            <ChatBox
              messages={messages}
              currentUserId={user?.id || ''}
              typingUsers={typingUsers}
              connected={socket.connected}
              onSendMessage={sendMessage}
              onStartTyping={() => socket.startTyping(selectedConversation.id)}
              onStopTyping={() => socket.stopTyping(selectedConversation.id)}
              onMarkAsRead={() => socket.markAsRead(selectedConversation.id)}
            />
          </div>
        ) : (
          <div className={styles.noChatSelected}>
            <div className={styles.noChatIcon}>💬</div>
            <h3>Sélectionnez une conversation</h3>
            <p>Choisissez une conversation dans la liste pour commencer à discuter avec un client.</p>
          </div>
        )}
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <button onClick={() => setError(null)} className={styles.closeError}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
