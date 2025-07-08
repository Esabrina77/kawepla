/**
 * Composant principal de chat
 */
import React, { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Message } from '@/lib/api/messages';
import styles from './ChatBox.module.css';

interface ChatBoxProps {
  messages: Message[];
  currentUserId: string;
  loading?: boolean;
  hasMore?: boolean;
  typingUsers?: Set<string>;
  connected?: boolean;
  onSendMessage: (content: string) => void;
  onLoadMore?: () => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  onMarkAsRead: () => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  currentUserId,
  loading = false,
  hasMore = false,
  typingUsers = new Set(),
  connected = false,
  onSendMessage,
  onLoadMore,
  onStartTyping,
  onStopTyping,
  onMarkAsRead
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Auto-scroll vers le bas pour les nouveaux messages
  useEffect(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldScrollToBottom]);

  // Marquer comme lu quand on arrive en bas
  useEffect(() => {
    if (isNearBottom && messages.length > 0) {
      onMarkAsRead();
    }
  }, [isNearBottom, messages.length, onMarkAsRead]);

  // Gérer le scroll
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Considérer qu'on est "près du bas" si on est à moins de 100px
    const nearBottom = distanceFromBottom < 100;
    setIsNearBottom(nearBottom);
    setShouldScrollToBottom(nearBottom);

    // Charger plus de messages si on est en haut
    if (scrollTop === 0 && hasMore && onLoadMore && !loading) {
      onLoadMore();
    }
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const dateKey = new Date(message.createdAt).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) return null;

    const typingUsersList = Array.from(typingUsers);
    return (
      <div className={styles.typingIndicator}>
        <div className={styles.typingBubble}>
          <div className={styles.typingDots}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <span className={styles.typingText}>
          {typingUsersList.length === 1 ? 'En train d\'écrire...' : 'Plusieurs personnes écrivent...'}
        </span>
      </div>
    );
  };

  return (
    <div className={styles.chatBox}>
      {/* Header de connexion */}
      <div className={`${styles.connectionStatus} ${connected ? styles.connected : styles.disconnected}`}>
        <div className={styles.statusIndicator}></div>
        <span>{connected ? 'Connecté' : 'Déconnecté'}</span>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className={styles.messagesContainer}
        onScroll={handleScroll}
      >
        {loading && hasMore && (
          <div className={styles.loadingMore}>
            <div className={styles.spinner}></div>
            <span>Chargement des messages...</span>
          </div>
        )}

        {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
          <div key={dateKey} className={styles.messageGroup}>
            <div className={styles.dateHeader}>
              <span className={styles.dateLabel}>
                {formatMessageDate(dateMessages[0].createdAt)}
              </span>
            </div>
            
            {dateMessages.map((message, index) => {
              const isOwn = message.senderId === currentUserId;
              const prevMessage = index > 0 ? dateMessages[index - 1] : null;
              const nextMessage = index < dateMessages.length - 1 ? dateMessages[index + 1] : null;
              
              const showSender = !isOwn && (!prevMessage || prevMessage.senderId !== message.senderId);
              const showTime = !nextMessage || 
                nextMessage.senderId !== message.senderId ||
                new Date(nextMessage.createdAt).getTime() - new Date(message.createdAt).getTime() > 300000; // 5 minutes

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showSender={showSender}
                  showTime={showTime}
                />
              );
            })}
          </div>
        ))}

        {renderTypingIndicator()}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        onStartTyping={onStartTyping}
        onStopTyping={onStopTyping}
        disabled={!connected}
        placeholder={connected ? "Tapez votre message..." : "Connexion en cours..."}
      />
    </div>
  );
}; 