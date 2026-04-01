"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatBox } from "@/components/Messages/ChatBox";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { useProviderServices } from "@/hooks/useProviderServices";
import { HeaderMobile } from "@/components/HeaderMobile";
import {
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Info,
  Briefcase,
} from "lucide-react";
import styles from "./support.module.css";

export default function ProviderSupportPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { services, loading: servicesLoading } = useProviderServices();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );
  const [showChatMobile, setShowChatMobile] = useState(false);

  // Pour les providers, on peut lier la discussion à un service ou non
  // L'ID passé à useMessages sera soit l'ID du service, soit undefined (pour discussion générale)
  const {
    messages,
    loading: messagesLoading,
    error,
    hasMore,
    typingUsers,
    connected,
    loadMoreMessages,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    loadUnreadCount,
  } = useMessages(selectedServiceId || undefined);

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

  // Rediriger si pas un provider
  useEffect(() => {
    if (user && user.role !== "PROVIDER") {
      router.push("/");
    }
  }, [user, router]);

  if (authLoading || servicesLoading) {
    return (
      <div className={styles.container}>
        <HeaderMobile title="Support" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement du centre partenaire...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <HeaderMobile title="Centre Partenaire" />

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${showChatMobile ? styles.hiddenMobile : ""}`}>
          <div className={styles.sidebarHeader}>
            <div className={styles.badge}>
              <MessageSquare size={14} />
              Partenaire
            </div>
            <h2>
              Support &<br />
              Assistance
            </h2>
            <p>Comment pouvons-nous vous aider aujourd'hui ?</p>
          </div>

          <div className={styles.subjectsList}>
            <div className={styles.sectionTitle}>Sujets Généraux</div>
            <div
              className={`${styles.subjectItem} ${!selectedServiceId ? styles.selected : ""}`}
              onClick={() => {
                setSelectedServiceId(null);
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

            {services.length > 0 && (
              <>
                <div className={styles.sectionTitle}>Vos Prestations</div>
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`${styles.subjectItem} ${selectedServiceId === service.id ? styles.selected : ""}`}
                    onClick={() => {
                      setSelectedServiceId(service.id);
                      setShowChatMobile(true);
                    }}
                  >
                    <div className={styles.subjectIcon}>
                      <Briefcase size={18} />
                    </div>
                    <div className={styles.subjectDetails}>
                      <h3 className={styles.subjectName}>{service.name}</h3>
                      <p className={styles.subjectType}>Support Prestation</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.helpInfo}>
              <Info className={styles.helpIcon} size={20} />
              <div className={styles.helpContent}>
                <p className={styles.helpTitle}>Support Dédié</p>
                <p className={styles.helpDescription}>
                  Lundi au Vendredi, de 9h à 18h.
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
                {selectedServiceId ? (
                  <Briefcase size={20} />
                ) : (
                  <Info size={20} />
                )}
              </div>
              <div className={styles.chatSubjectDetails}>
                <h3>
                  {selectedServiceId
                    ? services.find((s) => s.id === selectedServiceId)?.name ||
                      "Ma Prestation"
                    : "Questions Générales"}
                </h3>
                <p>
                  {selectedServiceId
                    ? "Assistance technique sur ce service"
                    : "Équipe Partenaires Kawepla"}
                </p>
              </div>
            </div>
          </div>

          <div
            className={styles.chatArea}
            style={
              {
                "--primary-color": "var(--provider)",
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
