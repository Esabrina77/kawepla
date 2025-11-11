'use client';

import React, { useState, useEffect, use } from 'react';
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
  Sparkles
} from 'lucide-react';
import { rsvpApi } from '@/lib/api/rsvp';
import styles from './merci.module.css';

interface RSVPResponse {
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
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

export default function RSVPThankYouPage({ params }: { params: Promise<{ token: string }> }) {
  const [status, setStatus] = useState<RSVPResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string>('');

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
        const rsvpData = sessionStorage.getItem('rsvpData');
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
            respondedAt: parsedData.rsvp.respondedAt
          });
          // Nettoyer les données après utilisation
          sessionStorage.removeItem('rsvpData');
        } else {
          // Si pas de données en session, récupérer depuis l'API
          const statusData = await rsvpApi.getStatus(token);
          setStatus(statusData);
        }
      } catch (error) {
        console.error('Error fetching RSVP status:', error);
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
          <p>Nous n'avons pas pu récupérer votre réponse. Veuillez réessayer plus tard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.thankYouCard}>
        <div className={styles.headerSection}>
          <div className={`${styles.badge} ${status.status === 'CONFIRMED' ? styles.confirmed : styles.declined}`}>
            <CheckCircle style={{ width: '16px', height: '16px' }} />
            Confirmation RSVP
          </div>
          
          <div className={`${styles.iconContainer} ${status.status === 'CONFIRMED' ? styles.confirmed : styles.declined}`}>
            {status.status === 'CONFIRMED' ? (
              <CheckCircle className={styles.successIcon} />
            ) : (
              <XCircle className={styles.declineIcon} />
            )}
          </div>
          
          <h1 className={styles.title}>
            Merci pour votre <span className={`${styles.titleAccent} ${status.status === 'CONFIRMED' ? styles.confirmed : styles.declined}`}>réponse</span> !
          </h1>

          {/* Affichage des informations personnelles */}
          {status.guest?.firstName && status.guest?.lastName && (
            <p className={styles.subtitle}>
              Merci <strong>{status.guest.firstName} {status.guest.lastName}</strong> !
            </p>
          )}
        </div>

        <div className={styles.contentSection}>
          {status.status === 'CONFIRMED' ? (
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
                      {status.plusOne ? 2 : 1} personne{status.plusOne ? 's' : ''}
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
              <div className={styles.messageContent}>
                "{status.message}"
              </div>
            </div>
          )}
        </div>

        <div className={styles.footerSection}>
          <p className={styles.confirmationText}>
            Votre réponse a été enregistrée avec succès. L'organisateur a été notifié.
          </p>
          
          <div className={styles.actionButtons}>
            <a
              href={`/rsvp/${token}`}
              className={styles.viewInvitationButton}
            >
              <Eye className={styles.buttonIcon} />
              Voir l'invitation
            </a>
          </div>
          
          <div className={styles.securityNotice}>
            <Shield className={styles.securityIcon} />
            <span>Ce lien est personnel. Merci de ne pas le partager avec d'autres personnes.</span>
          </div>
        </div>
      </div>
    </div>
  );
}