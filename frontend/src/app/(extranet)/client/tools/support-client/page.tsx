"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatBox } from "@/components/Messages/ChatBox";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { useInvitations } from "@/hooks/useInvitations";
import { HeaderMobile } from "@/components/HeaderMobile";
import {
  MessageSquare,
  AlertCircle,
  Plus,
  RefreshCw,
  Info,
  Users,
} from "lucide-react";
import styles from "./discussions.module.css";

export default function ClientDiscussionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { invitations, loading: invitationsLoading } = useInvitations();
  const [selectedInvitationId, setSelectedInvitationId] = useState<
    string | null
  >(null);
  const [showChatMobile, setShowChatMobile] = useState(false);

  // On ne force plus la sélection de la première invitation pour permettre l'accès au support général (null)

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
    loadUnreadCount,
  } = useMessages(selectedInvitationId || undefined);

  // Charger le compteur de messages non lus
  useEffect(() => {
    loadUnreadCount();
  }, []);

  // Rediriger si pas authentifié
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  // Rediriger si ni HOST ni PROVIDER
  useEffect(() => {
    if (user && user.role !== "HOST" && user.role !== "PROVIDER") {
      router.push("/");
    }
  }, [user, router]);

  if (authLoading || invitationsLoading) {
    return (
      <div className={styles.container}>
        <HeaderMobile title="Support" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement du centre d'assistance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <HeaderMobile title="Centre d'Assistance" />

      <div className={styles.pageContent}>
        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={`${styles.sidebar} ${showChatMobile ? styles.hiddenMobile : ""}`}>
            <div className={styles.sidebarHeader}>
           
              <h2>
                Assistance 
              </h2>
              <p>Comment pouvons-nous vous aider aujourd'hui ?</p>
            </div>

            <div className={styles.subjectsList}>
              <div className={styles.sectionTitle}>Sujets Généraux</div>
              <div
                className={`${styles.subjectItem} ${!selectedInvitationId ? styles.selected : ""}`}
                onClick={() => {
                  setSelectedInvitationId(null);
                  setShowChatMobile(true);
                }}
              >
                <div className={styles.subjectIcon}>
                  <Info size={18} />
                </div>
                <div className={styles.subjectDetails}>
                  <h3 className={styles.subjectName}>Questions Générales</h3>
                  <p className={styles.subjectType}>Support Kawepla</p>
                </div>
              </div>

              {invitations.length > 0 && (
                <>
                  <div className={styles.sectionTitle}>Vos Événements</div>
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className={`${styles.subjectItem} ${selectedInvitationId === invitation.id ? styles.selected : ""}`}
                      onClick={() => {
                        setSelectedInvitationId(invitation.id);
                        setShowChatMobile(true);
                      }}
                    >
                      <div className={styles.subjectIcon}>
                        <Users size={18} />
                      </div>
                      <div className={styles.subjectDetails}>
                        <h3 className={styles.subjectName}>
                          {invitation.eventTitle ||
                            `Événement #${invitation.id.slice(-4)}`}
                        </h3>
                        <p className={styles.subjectType}>
                          Conseils & Organisation
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Sidebar Footer / Help Info */}
            <div className={styles.sidebarFooter}>
              <div className={styles.helpInfo}>
                <Info className={styles.helpIcon} size={20} />
                <div className={styles.helpContent}>
                  <p className={styles.helpTitle}>Support 7j/7</p>
                  <p className={styles.helpDescription}>
                    Notre équipe vous répond sous 24h ouvrées.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Chat Area */}
          <main className={`${styles.chatArea} ${!showChatMobile ? styles.hiddenMobile : ""}`}>
            <div className={styles.chatHeader}>
              <div className={styles.chatSubjectInfo}>
                <button 
                  className={styles.backButton}
                  onClick={() => setShowChatMobile(false)}
                >
                  <RefreshCw size={18} style={{ transform: "rotate(-90deg)" }} />
                </button>
                <div className={styles.chatSubjectIcon}>
                  {selectedInvitationId ? (
                    <Users size={20} />
                  ) : (
                    <Info size={20} />
                  )}
                </div>
                <div className={styles.chatSubjectDetails}>
                  <h3>
                    {selectedInvitationId
                      ? invitations.find((i) => i.id === selectedInvitationId)
                          ?.eventTitle || "Mon Événement"
                      : "Questions Générales"}
                  </h3>
                  <p>
                    {selectedInvitationId
                      ? "Support dédié à cet événement"
                      : "Équipe Kawepla"}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={styles.chatWrapper}
              style={
                {
                  "--primary-color": "var(--host)",
                  "--primary-contrast": "#fff",
                } as React.CSSProperties
              }
            >
              <ChatBox
                messages={messages}
                currentUserId={user?.id || ""}
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
            </div>
          </main>
        </div>
      </div>

      {error && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            background: "#fee2e2",
            color: "#991b1b",
            padding: "12px 20px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            zIndex: 100,
          }}
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}
    </div>
  );
}
