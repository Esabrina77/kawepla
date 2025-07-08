/**
 * Composant pour afficher un message individuel
 */
import React from 'react';
import { Message } from '@/lib/api/messages';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSender?: boolean;
  showTime?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showSender = true,
  showTime = true
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
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

  return (
    <div className={`${styles.messageContainer} ${isOwn ? styles.own : styles.other}`}>
      {showSender && !isOwn && (
        <div className={styles.sender}>
          {message.sender.firstName} {message.sender.lastName}
          {message.sender.role === 'ADMIN' && (
            <span className={styles.adminBadge}>Admin</span>
          )}
        </div>
      )}
      
      <div className={`${styles.bubble} ${isOwn ? styles.ownBubble : styles.otherBubble}`}>
        <div className={styles.content}>
          {message.messageType === 'TEXT' && (
            <p className={styles.text}>{message.content}</p>
          )}
          
          {message.messageType === 'SYSTEM' && (
            <p className={styles.systemMessage}>{message.content}</p>
          )}
          
          {message.messageType === 'IMAGE' && (
            <div className={styles.imageMessage}>
              <img src={message.content} alt="Image" className={styles.image} />
            </div>
          )}
          
          {message.messageType === 'FILE' && (
            <div className={styles.fileMessage}>
              <div className={styles.fileIcon}>📎</div>
              <span className={styles.fileName}>{message.content}</span>
            </div>
          )}
        </div>
        
        {showTime && (
          <div className={styles.messageInfo}>
            <span className={styles.time}>{formatTime(message.createdAt)}</span>
            {isOwn && (
              <span className={`${styles.readStatus} ${message.isRead ? styles.read : styles.sent}`}>
                {message.isRead ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 