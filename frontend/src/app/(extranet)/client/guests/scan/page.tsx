"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Check, X, AlertTriangle, User } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { apiClient } from "@/lib/api/apiClient";
import { HeaderMobile } from "@/components/HeaderMobile/HeaderMobile";
import styles from "./scan.module.css";

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  isVIP: boolean;
  plusOne: boolean;
  plusOneName?: string;
  dietaryRestrictions?: string;
}

interface RSVP {
  id: string;
  status: string;
  guestId: string;
  profilePhotoUrl?: string;
  guest?: Guest;
}

interface Invitation {
  id: string;
  eventTitle: string;
  eventType: string;
  eventDate: string;
}

export default function ScanPage() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvitation, setSelectedInvitation] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [guestDetails, setGuestDetails] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const readerId = "qr-reader";

  // 1. Charger les invitations de l'organisateur
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await apiClient.get("/invitations");
        // Si response est un tableau direct ou response.data
        const data = Array.isArray(response) ? response : (response as any).data || [];
        setInvitations(data);
      } catch (error) {
        console.error("Erreur lors du chargement des invitations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvitations();
  }, []);

  // 2. Controler le Scanner
  useEffect(() => {
    if (scannerActive && selectedInvitation) {
      setTimeout(() => {
        startScanner();
      }, 300);
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [scannerActive, selectedInvitation]);

  const startScanner = () => {
    if (html5QrCodeRef.current) return;

    // Sécurité : Vérifier si le conteneur est bien monté dans le DOM
    const element = document.getElementById(readerId);
    if (!element) {
      console.log("DOM not ready, retrying in 200ms...");
      setTimeout(startScanner, 200);
      return;
    }

    const html5QrCode = new Html5Qrcode(readerId);
    html5QrCodeRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    };

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        handleScanSuccess(decodedText);
      },
      () => {
        // Frames failures are ignored
      }
    ).catch(err => {
      console.error("Erreur lancement scanner:", err);
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        setScanError("⚠️ ERREUR : La caméra nécessite un accès Sécurisé (HTTPS) pour fonctionner sur téléphone.");
      } else {
        setScanError("Impossible d'accéder à la caméra. Vérifiez les autorisations.");
      }
    });
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        // Ignorer l'erreur de stoppage
      }
      html5QrCodeRef.current = null;
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    setScanResult(decodedText);
    stopScanner();
    setScannerActive(false);
    setScanError(null);
    setIsValidating(true);

    try {
      // Décoder la chaîne Base64 Pure
      const decodedData = JSON.parse(atob(decodedText));
      const inviteId = decodedData.inviteId;
      const guestId = decodedData.guestId;

      if (!guestId) {
        setScanError("QR Code incomplet. Identifiant individuel manquant.");
        setIsValidating(false);
        return;
      }

      // Sécurité Organisateur : Vérifier si le QR Code correspond bien à l'évènement CHOISI
      if (inviteId !== selectedInvitation) {
        const matchingInvite = invitations.find(inv => inv.id === inviteId);
        setScanError(
          `⚠️ Mauvais évènement ! Cet invité est attendu sur : ${matchingInvite ? matchingInvite.eventTitle : "un autre de vos évènements"}`
        );
        setIsValidating(false);
        return;
      }

      // Récupérer le profil de l'invité depuis l'API de l'organisateur (Puisqu'il est authentifié)
      // On peut appeler /invitations/:id/guests pour trouver le précieux
      const guestsResponse = await apiClient.get(`/invitations/${inviteId}/guests`);
      const guests = Array.isArray(guestsResponse) ? guestsResponse : (guestsResponse as any).data || [];
      
      const foundGuest = guests.find((g: any) => g.id === guestId || g._id === guestId);

      if (!foundGuest) {
        setScanError("Identifiant invité introuvable sur la liste de cet évènement.");
        setIsValidating(false);
        return;
      }

      setGuestDetails(foundGuest);

    } catch (error) {
      console.error("Erreur lors du traitement du scan:", error);
      setScanError("Format de QR Code invalide ou erreur réseau.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className={styles.container}>
      <HeaderMobile title="Contrôle des Billets" />

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>
      ) : invitations.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Aucun évènement trouvé pour le moment.</div>
      ) : !scannerActive ? (
        // ÉTAPE 1 : CHOIX DE L'ÉVÈNEMENT
        <div className={styles.stepOne}>
          <AlertTriangle size={48} style={{ color: '#f59e0b', marginBottom: '0.5rem' }} />
          <h2 style={{ fontSize: '1.25rem', textAlign: 'center', margin: 0, fontWeight: 700 }}>Sélectionnez l'évènement à contrôler :</h2>
          
          <select 
            value={selectedInvitation} 
            onChange={(e) => setSelectedInvitation(e.target.value)}
            className={styles.selectInput}
          >
            <option value="">-- Choisir un évènement --</option>
            {invitations.map((inv) => (
              <option key={inv.id} value={inv.id}>{inv.eventTitle}</option>
            ))}
          </select>

          {selectedInvitation && (
            <button 
              onClick={() => setScannerActive(true)}
              className={styles.confirmButton}
              style={{ width: '100%', maxWidth: '340px', marginTop: '1rem', backgroundColor: '#10b981' }}
            >
              🚀 Lancer le Scan
            </button>
          )}
        </div>
      ) : (
        // ÉTAPE 2 : SCANNER (CAMÉRA)
        <div className={styles.scannerContainer}>
          <div id={readerId} className={styles.reader}></div>
          
          <div className={styles.overlay}>
            <div className={styles.viewfinder}>
              <div className={`${styles.corner} ${styles.cornerTopLeft}`} />
              <div className={`${styles.corner} ${styles.cornerTopRight}`} />
              <div className={`${styles.corner} ${styles.cornerBottomLeft}`} />
              <div className={`${styles.corner} ${styles.cornerBottomRight}`} />
              <div className={styles.scanLine} />
            </div>
            
            <p className={styles.instructions}>
              Visez le QR Code du Billet
            </p>
          </div>

          <button 
            onClick={() => { stopScanner(); setScannerActive(false); }}
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', zIndex: 12, fontSize: '0.8rem' }}
          >
            Changer évènement
          </button>
        </div>
      )}

      {/* MODAL RESULTATS */}
      {(isValidating || scanError || guestDetails) && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            
            {isValidating ? (
              <div className={styles.modalContent}>
                <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ margin: 0, fontWeight: 600 }}>Décodage et validation du Pass...</p>
              </div>
            ) : scanError ? (
              <>
                <div className={`${styles.modalHeader} ${styles.error}`}>
                  <div className={styles.iconWrap}><X size={28} /></div>
                  <h2>Billet Non Valide</h2>
                </div>
                <div className={styles.modalContent}>
                  <p style={{ textAlign: 'center', color: '#ef4444', fontWeight: 600, margin: 0 }}>{scanError}</p>
                  <div className={styles.actions}>
                    <button onClick={() => { setScanError(null); setScannerActive(true); }} className={styles.confirmButton}>Réessayer</button>
                    <button onClick={() => { setScanError(null); setSelectedInvitation(""); }} className={styles.closeButton}>Retour</button>
                  </div>
                </div>
              </>
            ) : guestDetails ? (
              <>
                <div className={`${styles.modalHeader} ${foundGuestStatus() === 'DECLINED' ? styles.warning : ''}`}>
                  <div className={styles.iconWrap}>
                    {foundGuestStatus() === 'DECLINED' ? <AlertTriangle size={28} /> : <Check size={28} />}
                  </div>
                  <h2>
                    {foundGuestStatus() === 'DECLINED' ? "⚠️ Invité Absent !" : "✅ Billet Confirmé !"}
                  </h2>
                </div>
                <div className={styles.modalContent}>
                  {guestDetails.profilePhotoUrl ? (
                    <img src={guestDetails.profilePhotoUrl} alt="Profil" className={styles.avatar} />
                  ) : (
                    <div className={styles.avatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e7eb' }}>
                      <User size={32} style={{ color: '#6b7280' }} />
                    </div>
                  )}

                  <div className={styles.guestInfo}>
                    <h3>{guestDetails.firstName} {guestDetails.lastName}</h3>
                    <span className={`${styles.badge} ${guestDetails.isVIP ? styles.vip : styles.regular}`}>
                      {guestDetails.isVIP ? "👑 VIP" : "👥 Invité Standard"}
                    </span>
                  </div>

                  <div className={styles.detailsGrid}>
                    <p><strong>Accompagnant :</strong> <span>{guestDetails.plusOne ? `👥 ${guestDetails.plusOneName || '1 Personne'}` : "Aucun"}</span></p>
                    {guestDetails.dietaryRestrictions && (
                      <div className={styles.dietary}>
                        🥗 <strong>Restriction :</strong> {guestDetails.dietaryRestrictions}
                      </div>
                    )}
                  </div>

                  <div className={styles.actions}>
                    <button onClick={() => { setGuestDetails(null); setScannerActive(true); }} className={styles.confirmButton} style={{ backgroundColor: '#10b981' }}>
                      Scanner Suite
                    </button>
                    <button onClick={() => { setGuestDetails(null); setSelectedInvitation(""); }} className={styles.closeButton}>Fermer</button>
                  </div>
                </div>
              </>
            ) : null}

          </div>
        </div>
      )}

      {/* Ajout des animations inline si manquantes */}
      <style jsx global>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  function foundGuestStatus() {
    return guestDetails?.rsvp?.status || guestDetails?.status || "CONFIRMED";
  }
}
