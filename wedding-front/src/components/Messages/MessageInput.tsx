/**
 * Composant pour la saisie de messages
 */
import React, { useState, useRef, useEffect } from 'react';
import styles from './MessageInput.module.css';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
  placeholder?: string;
}

// Liste d'émojis populaires organisés par catégories
const EMOJI_CATEGORIES = {
  smileys: {
    name: '😊 Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳']
  },
  hearts: {
    name: '❤️ Cœurs',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟']
  },
  wedding: {
    name: '💒 Mariage',
    emojis: ['💒', '👰', '🤵', '💍', '💎', '💐', '🌹', '🌸', '🌺', '🌻', '🌷', '🥂', '🍾', '🎉', '🎊', '🎈', '🎁', '💌', '💒', '⛪', '🕊️']
  },
  gestures: {
    name: '👍 Gestes',
    emojis: ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🤝', '🙏']
  },
  nature: {
    name: '🌸 Nature',
    emojis: ['🌸', '🌺', '🌻', '🌹', '🌷', '🌿', '🍀', '🌱', '🌳', '🌲', '🌴', '🌵', '🌾', '🌽', '🍄', '🌰', '🌊', '🌈', '⭐', '🌟', '✨', '☀️', '🌙']
  }
};

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  disabled = false,
  placeholder = "Tapez votre message..."
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeCategory, setActiveCategory] = useState('smileys');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Fermer le picker d'émojis en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Gestion de l'indicateur de frappe
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onStartTyping();
    }

    // Reset du timeout de frappe
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onStopTyping();
      }
    }, 1000);
  };

  const handleEmojiSelect = (emoji: string) => {
    const cursorPosition = textareaRef.current?.selectionStart || message.length;
    const newMessage = message.slice(0, cursorPosition) + emoji + message.slice(cursorPosition);
    setMessage(newMessage);
    
    // Remettre le focus sur le textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(cursorPosition + emoji.length, cursorPosition + emoji.length);
      }
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Arrêter l'indicateur de frappe
      if (isTyping) {
        setIsTyping(false);
        onStopTyping();
      }
      
      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className={styles.messageForm}>
      <div className={styles.inputContainer}>
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={styles.emojiButton}
          disabled={disabled}
          aria-label="Sélectionner un émoji"
        >
          😊
        </button>
        
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className={styles.messageInput}
          rows={1}
          maxLength={1000}
        />
        
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={styles.sendButton}
          aria-label="Envoyer le message"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
          </svg>
        </button>
      </div>

      {/* Picker d'émojis */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className={styles.emojiPicker}>
          <div className={styles.emojiCategories}>
            {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`${styles.categoryButton} ${activeCategory === key ? styles.active : ''}`}
                title={category.name}
              >
                {category.emojis[0]}
              </button>
            ))}
          </div>
          
          <div className={styles.emojiGrid}>
            {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].emojis.map((emoji, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleEmojiSelect(emoji)}
                className={styles.emojiItem}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className={styles.messageInfo}>
        <span className={styles.charCount}>
          {message.length}/1000
        </span>
      </div>
    </form>
  );
}; 