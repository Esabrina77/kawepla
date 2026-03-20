"use client";

import React, { useState, useEffect, use } from "react";
import {
  CheckCircle,
  XCircle,
  Users,
  Heart,
  Wine,
  MessageCircle,
  Eye,
  Shield,
  Loader,
  Sparkles,
  Download,
} from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { rsvpApi } from "@/lib/api/rsvp";
import DesignPreview from "@/components/DesignPreview";
import styles from "./merci.module.css";

interface RSVPResponse {
  status: "PENDING" | "CONFIRMED" | "DECLINED";
  numberOfGuests?: number;
  message?: string;
  profilePhotoUrl?: string;
  plusOne?: boolean;
  plusOneName?: string;
  dietaryRestrictions?: string;
  respondedAt?: string;
  guest?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
}

export default function RSVPThankYouPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [status, setStatus] = useState<RSVPResponse | null>(null);
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [token, setToken] = useState<string>("");
  const passRef = React.useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (passRef.current === null) return;
    setDownloading(true);
    try {
      // Forcer un délai d'une seconde pour être sûr que l'image est bien là
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const dataUrl = await toPng(passRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
      });
      const pdf = new jsPDF("p", "mm", [105, 148]); // A6 format
      pdf.addImage(dataUrl, "PNG", 0, 0, 105, 148);
      const eventTitle = invitation?.eventTitle || "Evenement";
      const firstName =
        status?.guest?.firstName || (status as any)?.firstName || "Invite";
      pdf.save(
        `Pass-Kawepla-${eventTitle.replace(/\s+/g, "-")}-${firstName}.pdf`,
      );
    } catch (err) {
      console.error("Erreur lors du téléchargement du pass", err);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      setToken(resolvedParams.token);
    };
    initParams();
  }, [params]);

  useEffect(() => {
    if (!token) return;

    const getStatus = async () => {
      try {
        // Récupérer les données depuis sessionStorage (passées depuis le formulaire)
        const rsvpData = sessionStorage.getItem("rsvpData");
        if (rsvpData) {
          const parsedData = JSON.parse(rsvpData);
          setStatus({
            status: parsedData.rsvp.status,
            numberOfGuests: parsedData.rsvp.numberOfGuests,
            message: parsedData.rsvp.message,
            plusOne: parsedData.rsvp.plusOne,
            plusOneName: parsedData.rsvp.plusOneName,
            dietaryRestrictions: parsedData.rsvp.dietaryRestrictions,
            profilePhotoUrl: parsedData.rsvp.profilePhotoUrl,
            guest: parsedData.guest,
            respondedAt: parsedData.rsvp.respondedAt,
          });
          // Nettoyer les données après utilisation
          sessionStorage.removeItem("rsvpData");
        } else {
          // Si pas de données en session, récupérer depuis l'API
          const statusData = await rsvpApi.getStatus(token);
          setStatus(statusData);
        }

        // Fetch de l'invitation pour y extraire le design complet
        const inviteData = await rsvpApi.getInvitation(token);
        if (inviteData && inviteData.invitation) {
          setInvitation(inviteData.invitation);
        }
      } catch (error) {
        console.error("Error fetching RSVP status:", error);
        setStatus(null);
      } finally {
        setLoading(false);
      }
    };

    getStatus();
  }, [token]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingAnimation}>
            <div className={styles.loadingRing}></div>
            <div className={styles.loadingRing}></div>
            <div className={styles.loadingRing}></div>
            <Sparkles className={styles.loadingIcon} />
          </div>
          <p className={styles.loadingText}>Chargement de votre réponse...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <XCircle className={styles.errorIcon} />
          <h2>Une erreur est survenue</h2>
          <p>
            Nous n'avons pas pu récupérer votre réponse. Veuillez réessayer plus
            tard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.thankYouCard}>
        <div className={styles.headerSection}>
          <div
            className={`${styles.badge} ${status.status === "CONFIRMED" ? styles.confirmed : styles.declined}`}
          >
            <CheckCircle style={{ width: "16px", height: "16px" }} />
            Confirmation RSVP
          </div>

          <div
            className={`${styles.iconContainer} ${status.status === "CONFIRMED" ? styles.confirmed : styles.declined}`}
          >
            {status.status === "CONFIRMED" ? (
              <CheckCircle className={styles.successIcon} />
            ) : (
              <XCircle className={styles.declineIcon} />
            )}
          </div>

          <h1 className={styles.title}>
            Merci pour votre{" "}
            <span
              className={`${styles.titleAccent} ${status.status === "CONFIRMED" ? styles.confirmed : styles.declined}`}
            >
              réponse
            </span>{" "}
            !
          </h1>

          {/* Affichage des informations personnelles */}
          {status.guest?.firstName && status.guest?.lastName && (
            <p className={styles.subtitle}>
              Merci{" "}
              <strong>
                {status.guest.firstName} {status.guest.lastName}
              </strong>{" "}
              !
            </p>
          )}
        </div>

        <div className={styles.contentSection}>
          {status.status === "CONFIRMED" ? (
            <div className={styles.confirmedContent}>
              <p className={styles.confirmationMessage}>
                Nous sommes ravis de vous compter parmi nous ! ✨
              </p>

              <div className={styles.detailsGrid}>
                <div className={`${styles.detailItem} ${styles.confirmed}`}>
                  <div className={`${styles.detailIcon} ${styles.confirmed}`}>
                    <Users />
                  </div>
                  <div className={styles.detailContent}>
                    <span className={styles.detailValue}>
                      {status.plusOne ? 2 : 1} personne
                      {status.plusOne ? "s" : ""}
                    </span>
                    <span className={styles.detailLabel}>Présent(e)(s)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.declinedContent}>
              <p className={styles.declineMessage}>
                Nous sommes désolés que vous ne puissiez pas être présent(e).
              </p>
              <p className={styles.declineSubtext}>
                Nous espérons vous voir lors d'une prochaine occasion ! 💕
              </p>
            </div>
          )}

          {status.message && (
            <div className={styles.messageSection}>
              <div className={styles.messageHeader}>
                <MessageCircle className={styles.messageIcon} />
                <h3>Votre message pour l'organisateur</h3>
              </div>
              <div className={styles.messageContent}>"{status.message}"</div>
            </div>
          )}
        </div>

        <div className={styles.footerSection}>
          <p className={styles.confirmationText}>
            Votre réponse a été enregistrée avec succès. L'organisateur a été
            notifié.
          </p>

          <div className={styles.actionButtons}>
            {status.status === "CONFIRMED" && (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className={styles.viewInvitationButton}
                style={{
                  background: "var(--primary, #6366F1)",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  justifyContent: "center",
                  opacity: downloading ? 0.8 : 1,
                }}
              >
                {downloading ? (
                  <Loader
                    className={styles.buttonIcon}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <Download className={styles.buttonIcon} />
                )}
                {downloading
                  ? "Génération du pass..."
                  : "Télécharger le pass (PDF)"}
              </button>
            )}
          </div>

          <div className={styles.securityNotice}>
            <Shield className={styles.securityIcon} />
            <span>
              Ce lien est personnel. Merci de ne pas le partager avec d'autres
              personnes.
            </span>
          </div>
        </div>
      </div>

      {/* TICKET PASSEPORT MASQUE POUR GENERATION PDF */}
      {status.status === "CONFIRMED" && invitation && invitation.design && (
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <div
            ref={passRef}
            style={{
              width: "450px",
              height: "640px",
              position: "relative",
              overflow: "hidden",
              backgroundColor: "#ffffff",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Zone Invitation (Moitié Haute) */}
            <div
              style={{
                width: "100%",
                height: "340px",
                position: "relative",
                backgroundColor: "#f3f4f6",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              {/* Sceau de certification Kawepla */}
              <img
                src={`${typeof window !== "undefined" ? window.location.origin : ""}/images/sceau-kawepla.png`}
                alt="Sceau Kawepla"
                style={{
                  position: "absolute",
                  top: "0px",
                  left: "0px",
                  width: "45px",
                  height: "45px",
                  zIndex: 20,
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
                }}
              />

              {/* Conteneur pour forcer le ratio de DesignPreview en mode card */}
              <div
                style={{
                  width: "380px",
                  height: "380px",
                  transform: "scale(0.85)",
                  transformOrigin: "center",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {invitation.design.previewImage || invitation.design.thumbnail ? (
                  <img 
                    src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3013"}/api/proxy/image?url=${encodeURIComponent(invitation.design.previewImage || invitation.design.thumbnail)}`} 
                    alt="Design"
                    crossOrigin="anonymous"
                    style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px" }}
                  />
                ) : (
                  <DesignPreview design={invitation.design} />
                )}
              </div>
            </div>

            {/* Notches latérales pour effet Billet */}
            <div
              style={{
                position: "absolute",
                top: "330px",
                left: "-10px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "#ffffff",
                boxShadow: "inset -2px 0 4px rgba(0,0,0,0.05)",
                zIndex: 10,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "330px",
                right: "-10px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "#ffffff",
                boxShadow: "inset 2px 0 4px rgba(0,0,0,0.05)",
                zIndex: 10,
              }}
            />

            {/* Ligne pointillée de découpe */}
            <div
              style={{
                width: "100%",
                borderTop: "2px dashed #e5e7eb",
                position: "absolute",
                top: "340px",
                zIndex: 5,
              }}
            />

            {/* Zone Contenu (Moitié Basse) */}
            <div
              style={{
                flex: 1,
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                justifyContent: "space-between",
              }}
            >
              <div>
                {status.profilePhotoUrl && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-15px",
                      right: "1.25rem",
                      zIndex: 12,
                    }}
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3013"}/api/proxy/image?url=${encodeURIComponent(status.profilePhotoUrl)}`}
                      alt="Avatar"
                      crossOrigin="anonymous"
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        border: "4px solid white",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}

                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    letterSpacing: "2px",
                    color: "var(--primary, #6366F1)",
                    background: "#e0e7ff",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    display: "inline-block",
                    marginBottom: "0.5rem",
                  }}
                >
                  🎫 PASS D'ENTRÉE
                </span>

                <h3
                  style={{
                    margin: "0 0 0.25rem 0",
                    fontFamily: "var(--font-heading)",
                    color: "#111827",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                  }}
                >
                  {status.guest?.firstName.toUpperCase()}{" "}
                  {status.guest?.lastName.toUpperCase()}
                </h3>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                    fontSize: "0.9rem",
                    color: "#4b5563",
                    marginBottom: "0.5rem",
                  }}
                >
                  <p style={{ margin: 0 }}>
                    <strong>Statut d'accès :</strong> ✅ Présent(e)
                  </p>
                  {status.plusOneName && (
                    <p style={{ margin: 0 }}>
                      <strong>Accompagnant :</strong> 👥 {status.plusOneName}
                    </p>
                  )}
                  {status.dietaryRestrictions && (
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        padding: "6px 10px",
                        backgroundColor: "#fff7ed",
                        borderRadius: "6px",
                        color: "#ea580c",
                        fontSize: "0.8rem",
                        borderLeft: "3px solid #f97316",
                      }}
                    >
                      🥗 <strong>Restriction :</strong>{" "}
                      {status.dietaryRestrictions}
                    </p>
                  )}
                </div>
              </div>

              {/* Simulation de QR Code scannable */}
              <div
                style={{
                  textAlign: "center",
                  borderTop: "1px solid #f3f4f6",
                  paddingTop: "0.75rem",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "1.5rem",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                      color: "#111827",
                    }}
                  >
                    CONTROLE D'ACCÈS
                  </p>
                  <p
                    style={{ margin: 0, fontSize: "0.7rem", color: "#6b7280" }}
                  >
                    Sécurisé par Kawepla
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "0.6rem",
                      color: "#9ca3af",
                      letterSpacing: "2px",
                    }}
                  >
                    V-${invitation.id.substring(0, 8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      btoa(JSON.stringify({ 
                        inviteId: invitation.id, 
                        guestId: (status?.guest as any)?.id || (status?.guest as any)?._id || (status as any)?.guestId 
                      }))
                    )}`}
                    alt="Inspection QR Code"
                    style={{
                      width: "120px",
                      height: "120px",
                      border: "1px solid #e5e7eb",
                      padding: "4px",
                      borderRadius: "6px",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
