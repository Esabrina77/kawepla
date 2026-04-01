"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  memo,
  useCallback,
} from "react";
import { useProviderProfile } from "@/hooks/useProviderProfile";
import {
  useProviderConversations,
  useProviderConversation,
} from "@/hooks/useProviderConversations";
import { ProviderMessage } from "@/lib/api/providerConversations";
import { HeaderMobile } from "@/components/HeaderMobile";
import { ErrorModal } from "@/components/ui/modal";
import {
  Send,
  MessageCircle,
  Search,
  Calendar,
  Users,
  Briefcase,
} from "lucide-react";
import styles from "./messages.module.css";
import Link from "next/link";

// ── Date Separator (style WhatsApp) ─────────────────────────────────────────
const DateSeparator = ({ date }: { date: string }) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  let label = "";
  if (d.toDateString() === today.toDateString()) {
    label = "Aujourd'hui";
  } else if (d.toDateString() === yesterday.toDateString()) {
    label = "Hier";
  } else {
    label = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    if (d.getFullYear() !== today.getFullYear()) label += ` ${d.getFullYear()}`;
  }

  return (
    <div className={styles.dateSeparator}>
      <span>{label}</span>
    </div>
  );
};

// ── Message Item ─────────────────────────────────────────────────────────────
const MessageItem = memo(
  ({
    message,
    providerBusinessName,
    isSystemMessage,
  }: {
    message: ProviderMessage;
    providerBusinessName: string;
    isSystemMessage: (type: string) => boolean;
  }) => {
    const isSystem = isSystemMessage(message.messageType);
    const isBookingMessage = message.messageType?.startsWith("BOOKING_");
    // Du point de vue du prestataire : CLIENT = HOST/GUEST
    const isClient =
      message.sender?.role === "HOST" || message.sender?.role === "GUEST";

    const renderBookingContent = (content: string) => {
      const eventDateMatch = content.match(
        /(?:Date de l'événement|Date)\s*:\s*([^👥💰Statut\r\n]+)/i,
      );
      const guestMatch = content.match(
        /(?:Type|Invités)\s*:\s*([^💰Statut\r\n]+)/i,
      );
      const priceMatch = content.match(
        /(?:Montant|Prix|Total)\s*:\s*([^Statut\r\n]+)/i,
      );
      const statusMatch = content.match(/Statut\s*:\s*(.+)/i);

      let cardTitle = "Mise à jour réservation";
      if (message.messageType === "BOOKING_CREATED")
        cardTitle = "Demande de réservation";
      if (message.messageType === "BOOKING_CONFIRMED")
        cardTitle = "Réservation confirmée";
      if (message.messageType === "BOOKING_CANCELLED")
        cardTitle = "Réservation annulée";

      return (
        <div className={styles.bookingCard}>
          <div className={styles.bookingCardStatus}>
            <Calendar size={14} className={styles.statusIcon} />
            <span>{cardTitle}</span>
          </div>
          {eventDateMatch || guestMatch || priceMatch ? (
            <div className={styles.bookingGrid}>
              {eventDateMatch && (
                <div className={styles.bookingInfoItem}>
                  <Calendar size={12} className={styles.infoIcon} />
                  <div className={styles.infoTextGroup}>
                    <span className={styles.itemLabel}>Date événement</span>
                    <span className={styles.itemValue}>
                      {eventDateMatch[1].trim()}
                    </span>
                  </div>
                </div>
              )}
              {guestMatch && (
                <div className={styles.bookingInfoItem}>
                  <Users size={12} className={styles.infoIcon} />
                  <div className={styles.infoTextGroup}>
                    <span className={styles.itemLabel}>Détails</span>
                    <span className={styles.itemValue}>
                      {guestMatch[1].trim()}
                    </span>
                  </div>
                </div>
              )}
              {priceMatch && (
                <div
                  className={`${styles.bookingInfoItem} ${styles.priceItem}`}
                >
                  <div className={styles.infoTextGroup}>
                    <span className={styles.itemLabel}>Total</span>
                    <span className={styles.priceValue}>
                      {priceMatch[1].trim()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.bookingSimpleContent}>
              <p>{content}</p>
            </div>
          )}
          {statusMatch && (
            <div className={styles.bookingFooter}>
              <span className={styles.statusBadge}>
                {statusMatch[1].trim()}
              </span>
            </div>
          )}
        </div>
      );
    };

    return (
      <div
        className={`${styles.message} ${isSystem ? styles.systemMessage : ""} ${isBookingMessage ? styles.bookingMessage : ""} ${isClient ? styles.clientMessage : styles.providerMessage}`}
        role="listitem"
      >
        {!isSystem && (
          <div className={styles.messageAvatar}>
            {isClient
              ? message.sender?.firstName?.[0] || "C"
              : providerBusinessName[0] || "P"}
          </div>
        )}
        <div className={styles.messageContent}>
          {!isSystem && (
            <div className={styles.messageHeader}>
              <span className={styles.messageSender}>
                {isClient
                  ? `${message.sender?.firstName || ""} ${message.sender?.lastName || ""}`.trim() ||
                    "Client"
                  : providerBusinessName}
              </span>
              <span className={styles.messageTime}>
                {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
          {isBookingMessage ? (
            renderBookingContent(message.content)
          ) : (
            <div className={styles.messageText}>{message.content}</div>
          )}
        </div>
      </div>
    );
  },
);

MessageItem.displayName = "MessageItem";

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ProviderMessagesPage() {
  const { profile } = useProviderProfile();
  const { conversations, loading: conversationsLoading } =
    useProviderConversations("PROVIDER");

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [showChatMobile, setShowChatMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [showSendError, setShowSendError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversation,
    messages,
    sendMessage,
    markAsRead,
    loading: messagesLoading,
  } = useProviderConversation(selectedConversationId);

  const isSystemMessage = useCallback(
    (type: string) =>
      [
        "SYSTEM",
        "BOOKING_CREATED",
        "BOOKING_CONFIRMED",
        "BOOKING_CANCELLED",
        "BOOKING_COMPLETED",
      ].includes(type),
    [],
  );

  // Filter conversations by search
  const filteredConversations = useMemo(
    () =>
      conversations.filter((conv) => {
        // Ne pas afficher les conversations vides
        if (!conv.messages || conv.messages.length === 0) return false;

        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          conv.client?.firstName?.toLowerCase().includes(q) ||
          conv.client?.lastName?.toLowerCase().includes(q) ||
          conv.client?.email?.toLowerCase().includes(q) ||
          conv.service?.name?.toLowerCase().includes(q) ||
          conv.subject?.toLowerCase().includes(q)
        );
      }),
    [conversations, searchQuery],
  );

  // Select first conversation by default
  useEffect(() => {
    if (filteredConversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(filteredConversations[0].id);
    }
  }, [filteredConversations, selectedConversationId]);

  // Mark as read on open (once)
  const markAsReadRef = useRef(markAsRead);
  const hasMarkedRef = useRef<string | null>(null);

  useEffect(() => {
    markAsReadRef.current = markAsRead;
  }, [markAsRead]);
  useEffect(() => {
    if (
      selectedConversationId &&
      hasMarkedRef.current !== selectedConversationId
    ) {
      hasMarkedRef.current = selectedConversationId;
      markAsReadRef.current();
    }
  }, [selectedConversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Memoize rendered messages with date separators
  const memoizedMessages = useMemo(() => {
    if (!profile) return [];
    const elements: React.ReactNode[] = [];
    let lastDate: string | null = null;

    messages.forEach((msg) => {
      const dayStr = new Date(msg.createdAt).toDateString();
      if (dayStr !== lastDate) {
        elements.push(
          <DateSeparator key={`sep-${msg.createdAt}`} date={msg.createdAt} />,
        );
        lastDate = dayStr;
      }
      elements.push(
        <MessageItem
          key={msg.id}
          message={msg}
          providerBusinessName={profile.businessName}
          isSystemMessage={isSystemMessage}
        />,
      );
    });
    return elements;
  }, [messages, profile?.businessName, isSystemMessage]);

  const getUnreadCount = (conv: any) => {
    return conv.unreadCount || 0;
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff === 0)
      return d.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    if (diff === 1) return "Hier";
    if (diff < 7)
      return d.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversationId || sending) return;
    try {
      setSending(true);
      await sendMessage({ content: messageText.trim(), messageType: "TEXT" });
      setMessageText("");
      await markAsRead();
    } catch {
      setShowSendError(true);
    } finally {
      setSending(false);
    }
  };

  if (conversationsLoading) {
    return (
      <div className={styles.messagesPage}>
        <HeaderMobile title="Messages" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>Chargement des conversations…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.messagesPage}>
      <HeaderMobile title="Messages" />

      <div className={styles.messagesLayout}>
        {/* ── Conversations list ── */}
        <aside className={`${styles.conversationsList} ${showChatMobile ? styles.hiddenMobile : ""}`}>
          <div className={styles.searchContainer}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.conversations}>
            {filteredConversations.length === 0 ? (
              <div className={styles.emptyConversations}>
                <MessageCircle size={40} />
                <p>Aucune conversation</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const unread = getUnreadCount(conv);
                const lastMsg = conv.messages?.[0] ?? null;
                const selected = selectedConversationId === conv.id;

                return (
                  <div
                    key={conv.id}
                    className={`${styles.conversationItem} ${selected ? styles.selected : ""}`}
                    onClick={() => {
                      setSelectedConversationId(conv.id);
                      setShowChatMobile(true);
                    }}
                  >
                    <div className={styles.conversationAvatar}>
                      {conv.client?.firstName?.[0] || "C"}
                    </div>
                    <div className={styles.conversationContent}>
                      <div className={styles.conversationTopRow}>
                        <h3 className={styles.conversationName}>
                          {conv.client
                            ? `${conv.client.firstName} ${conv.client.lastName}`
                            : "Client"}
                        </h3>
                        {lastMsg && (
                          <span className={styles.conversationTime}>
                            {formatTime(lastMsg.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className={styles.conversationPreview}>
                        <p className={styles.lastMessage}>
                          {lastMsg
                            ? lastMsg.content.length > 50
                              ? `${lastMsg.content.substring(0, 50)}…`
                              : lastMsg.content
                            : "Aucun message"}
                        </p>
                        {unread > 0 && (
                          <span className={styles.unreadBadge}>{unread}</span>
                        )}
                      </div>
                      {conv.service && (
                        <div className={styles.serviceBadge}>
                          <Briefcase size={11} />
                          {conv.service.name}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ── Messages area ── */}
        <div className={`${styles.messagesArea} ${!showChatMobile ? styles.hiddenMobile : ""}`}>
          {!selectedConversationId ? (
            <div className={styles.noConversationSelected}>
              <MessageCircle size={56} />
              <p>Sélectionnez une conversation</p>
            </div>
          ) : !conversation ? (
            <div className={styles.loadingMessages}>
              <div className={styles.loadingSpinner} />
            </div>
          ) : (
            <>
              {/* Conversation header */}
              <div className={styles.conversationHeader}>
                <button 
                  className={styles.backButton}
                  onClick={() => setShowChatMobile(false)}
                >
                  <Send size={18} style={{ transform: "rotate(-180deg)" }} />
                </button>
                <div className={styles.providerInfo}>
                  <div className={styles.providerAvatar}>
                    {conversation.client?.firstName?.[0] || "C"}
                  </div>
                  <div className={styles.providerDetails}>
                    <h3>
                      {conversation.client
                        ? `${conversation.client.firstName} ${conversation.client.lastName}`
                        : "Client"}
                    </h3>
                    {conversation.service && (
                      <p className={styles.category}>
                        {conversation.service.name}
                      </p>
                    )}
                  </div>
                </div>
                {conversation.service && (
                  <Link
                    href={`/provider/bookings?conversationId=${conversation.id}`}
                    className={styles.bookButton}
                  >
                    Voir la réservation
                  </Link>
                )}
              </div>

              {/* Messages list */}
              <div
                className={styles.messagesList}
                role="list"
                aria-label="Historique des messages"
                aria-live="polite"
              >
                {messagesLoading && messages.length === 0 ? (
                  <div className={styles.loadingMessages}>
                    <div className={styles.loadingSpinner} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className={styles.emptyMessages}>
                    <MessageCircle size={48} />
                    <p>Aucun message dans cette conversation</p>
                  </div>
                ) : (
                  memoizedMessages
                )}
                <div ref={messagesEndRef} aria-hidden="true" />
              </div>

              {/* Send form */}
              <form onSubmit={handleSend} className={styles.messageForm}>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Tapez votre message…"
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
            </>
          )}
        </div>
      </div>
      <ErrorModal
        isOpen={showSendError}
        onClose={() => setShowSendError(false)}
        title="Erreur d'envoi"
        message="Désolé, votre message n'a pas pu être envoyé. Veuillez vérifier votre connexion et réessayer."
      />
    </div>
  );
}
