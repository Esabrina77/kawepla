'use client';

import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { apiClient } from '@/lib/api/apiClient';
import styles from './Chatbot.module.css';

// Fonction pour convertir le markdown simple en HTML avec gestion des listes
const formatMessage = (text: string): string => {
  const lines = text.split('\n');
  let formatted = '';
  let inList = false;
  let listType: 'ol' | 'ul' | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Détecter les listes numérotées (1. ou 2. etc.)
    const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      if (!inList || listType !== 'ol') {
        if (inList && listType === 'ul') {
          formatted += '</ul>';
        }
        formatted += '<ol>';
        inList = true;
        listType = 'ol';
      }
      const content = numberedMatch[2];
      // Convertir le texte en gras dans le contenu
      const boldContent = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      formatted += `<li>${boldContent}</li>`;
      continue;
    }

    // Détecter les listes à puces (- ou *)
    const bulletMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (!inList || listType !== 'ul') {
        if (inList && listType === 'ol') {
          formatted += '</ol>';
        }
        formatted += '<ul>';
        inList = true;
        listType = 'ul';
      }
      const content = bulletMatch[1];
      // Convertir le texte en gras dans le contenu
      const boldContent = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      formatted += `<li>${boldContent}</li>`;
      continue;
    }

    // Fermer la liste si on rencontre une ligne vide ou du texte normal
    if (inList && (trimmedLine === '' || (!numberedMatch && !bulletMatch))) {
      formatted += listType === 'ol' ? '</ol>' : '</ul>';
      inList = false;
      listType = null;

      // Si ligne vide, ajouter un espace
      if (trimmedLine === '') {
        formatted += '<br>';
        continue;
      }
    }

    // Traiter les lignes normales
    if (trimmedLine !== '') {
      // Convertir le texte en gras
      let processedLine = trimmedLine.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      formatted += processedLine + '<br>';
    } else if (!inList) {
      formatted += '<br>';
    }
  }

  // Fermer la liste si on est encore dedans à la fin
  if (inList) {
    formatted += listType === 'ol' ? '</ol>' : '</ul>';
  }

  return formatted;
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Chatbot() {
  const pathname = usePathname();

  // Déterminer le rôle basé sur l'URL
  const isProvider = pathname?.startsWith('/provider');
  const isAdmin = pathname?.startsWith('/super-admin');
  const role = isProvider ? 'PROVIDER' : isAdmin ? 'ADMIN' : 'HOST';

  const getWelcomeMessage = () => {
    if (isProvider) return "Bonjour ! Je suis Kawebot, votre assistant business. Comment puis-je vous aider à développer votre activité ?";
    if (isAdmin) return "Bonjour Admin ! Je suis Kawebot. Comment puis-je vous aider dans la gestion de la plateforme ?";
    return "Bonjour ! Je suis Kawebot, l'assistant intelligent de Kawepla. Comment puis-je vous aider avec l'organisation de votre événement ?";
  };

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: getWelcomeMessage(),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiClient.post<{ message: string }>('/ai/chat', {
        message: userMessage.content,
        conversationHistory: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        context: {
          page: pathname,
          role: role
        }
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message || 'Désolé, je n\'ai pas pu générer de réponse.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Erreur chatbot:', error);

      // Vérifier si c'est une erreur de quota atteint (403)
      let errorContent = 'Une erreur est survenue. Veuillez réessayer.';

      // L'erreur peut être dans error.message ou error.response
      const errorMessage = error?.message || error?.response?.data?.message || '';
      const statusCode = error?.status || error?.response?.status;

      if (statusCode === 403 || errorMessage.includes('Limite atteinte') || errorMessage.includes('quota')) {
        // Quota AI atteint
        errorContent = 'Désolé, Kawebot n\'est plus disponible pour le moment. Vous avez atteint votre limite de requêtes IA. Passez à un forfait supérieur ou achetez un pack de requêtes supplémentaires pour continuer à utiliser Kawebot.';
      } else if (statusCode === 429 || errorMessage.includes('Trop de requêtes')) {
        // Rate limit atteint
        errorContent = 'Trop de requêtes envoyées. Veuillez patienter quelques instants avant de réessayer.';
      } else if (errorMessage) {
        errorContent = errorMessage;
      }

      const errorMessageObj: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleChat = () => {
    if (isOpen) {
      setIsMinimized(!isMinimized);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <button
          className={styles.chatbotButton}
          onClick={toggleChat}
          aria-label="Ouvrir le chatbot"
        >
          <Image
            src="/icons/robot-svgrepo-com.svg"
            alt="Chatbot"
            width={28}
            height={28}
            className={styles.robotIcon}
          />
        </button>
      )}

      {/* Fenêtre de chat */}
      {isOpen && (
        <div className={`${styles.chatbotWindow} ${isMinimized ? styles.minimized : ''}`}>
          {/* Header */}
          <div className={styles.chatbotHeader}>
            <div className={styles.headerLeft}>
              <Image
                src="/icons/robot-svgrepo-com.svg"
                alt="Chatbot"
                width={20}
                height={20}
                className={styles.headerIcon}
              />
              <span className={styles.headerTitle}>Kawebot</span>
            </div>
            <div className={styles.headerActions}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className={styles.headerButton}
                aria-label={isMinimized ? 'Agrandir' : 'Réduire'}
              >
                {isMinimized ? (
                  <Maximize2 size={16} />
                ) : (
                  <Minimize2 size={16} />
                )}
              </button>
              <button
                onClick={closeChat}
                className={styles.headerButton}
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className={styles.messagesContainer}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.message} ${styles[message.role]}`}
                  >
                    <div
                      className={styles.messageContent}
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    />
                    <div className={styles.messageTime}>
                      {message.timestamp.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className={`${styles.message} ${styles.assistant}`}>
                    <div className={styles.messageContent}>
                      <span className={styles.typingIndicator}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className={styles.inputContainer}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  className={styles.input}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={styles.sendButton}
                  aria-label="Envoyer"
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

