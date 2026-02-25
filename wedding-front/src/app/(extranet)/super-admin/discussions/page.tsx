'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatBox } from '@/components/Messages/ChatBox';
import { useAuth } from '@/hooks/useAuth';
import { HeaderMobile } from '@/components/HeaderMobile';
import { MessagesAPI, Conversation } from '@/lib/api/messages';
import { useSocket } from '@/hooks/useSocket';
import {
  MessageCircle,
  Search,
  Filter,
  RefreshCw,
  Archive,
  RotateCcw,
  User,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import styles from './discussions.module.css';

export default function AdminDiscussionsPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
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
        loadConversations();

        if (selectedConversation && data.conversationId === selectedConversation.id) {
          setMessages(prev => {
            const messageExists = prev.some(msg => msg.id === data.message.id);
            if (messageExists) return prev;
            return [...prev, data.message];
          });
        }
      },
      onNewMessage: (data) => {
        if (selectedConversation && data.conversationId === selectedConversation.id) {
          setMessages(prev => {
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
      socket.joinConversation(conversation.id);

      const messagesData = await MessagesAPI.getMessages(conversation.id);
      setMessages(messagesData.messages);

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
    if (statusFilter !== 'ALL' && conv.status !== statusFilter) {
      return false;
    }

    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      conv.user.firstName.toLowerCase().includes(query) ||
      conv.user.lastName.toLowerCase().includes(query) ||
      conv.user.email.toLowerCase().includes(query) ||
      conv.invitation?.organisateurName?.toLowerCase().includes(query) ||
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle style={{ width: '12px', height: '12px' }} />;
      case 'ARCHIVED':
        return <Archive style={{ width: '12px', height: '12px' }} />;
      case 'CLOSED':
        return <X style={{ width: '12px', height: '12px' }} />;
      default:
        return <AlertCircle style={{ width: '12px', height: '12px' }} />;
    }
  };

  if (authLoading) {
    return (
      <div className={styles.discussionsPage}>
        <HeaderMobile title="Discussions" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.discussionsPage}>
      <HeaderMobile title="Discussions" />

      <div className={styles.pageContent}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          {/* Sidebar Header */}
          <div className={styles.sidebarHeader}>
            <button onClick={loadConversations} className={styles.refreshButton}>
              <RefreshCw size={18} />
            </button>
          </div>

          {/* Filters */}
          <div className={styles.filtersContainer}>
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterContainer}>
              <Filter className={styles.filterIcon} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'ARCHIVED' | 'CLOSED')}
                className={styles.filterSelect}
              >
                <option value="ALL">Toutes les conversations</option>
                <option value="ACTIVE">Conversations actives</option>
                <option value="ARCHIVED">Conversations archivées</option>
                <option value="CLOSED">Conversations fermées</option>
              </select>
            </div>
          </div>

          {/* Conversations List */}
          <div className={styles.conversationsList}>
            {loading && (
              <div className={styles.loadingItem}>
                <div className={styles.loadingSpinner}></div>
                <span>Chargement des conversations...</span>
              </div>
            )}

            {!loading && filteredConversations.length === 0 && (
              <div className={styles.emptyConversations}>
                <MessageCircle style={{ width: '48px', height: '48px', marginBottom: 'var(--space-md)' }} />
                <h3>Aucune conversation trouvée</h3>
                <p>
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'Aucune conversation ne correspond à vos critères'
                    : 'Aucune conversation en cours'
                  }
                </p>
              </div>
            )}

            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`${styles.conversationItem} ${selectedConversation?.id === conversation.id ? styles.selected : ''
                  }`}
                onClick={() => selectConversation(conversation)}
              >
                {/* User Info */}
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    <div className={styles.avatarContent}>
                      {conversation.user.firstName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className={styles.userDetails}>
                    <h3 className={styles.userName}>
                      {conversation.user.firstName} {conversation.user.lastName}
                    </h3>
                    <div className={styles.userEmail}>
                      <Mail style={{ width: '12px', height: '12px' }} />
                      {conversation.user.email}
                    </div>
                  </div>
                </div>

                {/* Conversation Meta */}
                <div className={styles.conversationMeta}>
                  <div className={styles.metaRow}>
                    <div className={styles.timeInfo}>
                      <Clock style={{ width: '12px', height: '12px' }} />
                      <span>{formatTime(conversation.lastMessageAt)}</span>
                    </div>
                    <span className={`${styles.statusBadge} ${styles[`status${conversation.status}`]}`}>
                      {getStatusIcon(conversation.status)}
                      {getStatusLabel(conversation.status)}
                    </span>
                  </div>

                  {conversation._count && conversation._count.messages > 0 && (
                    <div className={styles.unreadBadge}>
                      {conversation._count.messages}
                    </div>
                  )}
                </div>

                {/* Invitation Info */}
                <div className={styles.invitationInfo}>
                  <div className={styles.invitationName}>
                    {conversation.invitation?.title || conversation.invitation?.organisateurName}
                  </div>
                  <div className={styles.lastMessage}>
                    {formatLastMessage(conversation)}
                  </div>
                </div>

                {/* Actions */}
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
                          <User style={{ width: '12px', height: '12px' }} />
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
                        <Archive style={{ width: '12px', height: '12px' }} />
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
                      <RotateCcw style={{ width: '12px', height: '12px' }} />
                      Restaurer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={styles.chatArea}>
          {selectedConversation ? (
            <div className={styles.chatContainer}>
              <div className={styles.chatHeader}>
                <div className={styles.chatUserInfo}>
                  <div className={styles.chatUserAvatar}>
                    <div className={styles.avatarContent}>
                      {selectedConversation.user.firstName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className={styles.chatUserDetails}>
                    <h3 className={styles.chatUserName}>
                      {selectedConversation.user.firstName} {selectedConversation.user.lastName}
                    </h3>
                    <div className={styles.chatUserEmail}>
                      <Mail style={{ width: '12px', height: '12px' }} />
                      {selectedConversation.user.email}
                    </div>
                    <div className={styles.chatInvitation}>
                      {selectedConversation.invitation?.title || selectedConversation.invitation?.organisateurName}
                    </div>
                  </div>
                </div>
                <div className={styles.chatActions}>
                  <button
                    onClick={() => archiveConversation(selectedConversation)}
                    className={styles.archiveButton}
                  >
                    <Archive style={{ width: '14px', height: '14px' }} />
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
              <MessageCircle style={{ width: '64px', height: '64px', marginBottom: 'var(--space-md)' }} />
              <h3>Sélectionnez une conversation</h3>
              <p>Choisissez une conversation dans la liste pour commencer à discuter avec un client.</p>
            </div>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className={styles.closeError}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
