'use client';

import React, { useState, useEffect } from 'react';
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
import styles from './merci.module.css';
  
interface RSVPResponse {
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
  numberOfGuests?: number;
  message?: string;
  profilePhotoUrl?: string;
  plusOne?: boolean;
  plusOneName?: string;
  dietaryRestrictions?: string;
  firstName?: string;
  lastName?: string;
  respondedAt?: string;
}

export default function SharedRSVPThankYouPage({ params }: { params: Promise<{ shareableToken: string }> }) {
  const [status, setStatus] = useState<RSVPResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareableToken, setShareableToken] = useState<string>('');

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      setShareableToken(resolvedParams.shareableToken);
    };
    initParams();
  }, [params]);

  useEffect(() => {
    if (!shareableToken) return;

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
            firstName: parsedData.guest.firstName,
            lastName: parsedData.guest.lastName,
            respondedAt: parsedData.rsvp.respondedAt
          });
          // Nettoyer les données après utilisation
          sessionStorage.removeItem('rsvpData');
        } else {
          // Si pas de données en session, essayer de récupérer depuis l'API
          // Vérifier si on a un téléphone dans localStorage (sauvegardé lors de la soumission)
          const savedPhone = localStorage.getItem(`rsvp_phone_${shareableToken}`);
          
          if (savedPhone) {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013'}/api/rsvp/shared/${shareableToken}/status?phone=${encodeURIComponent(savedPhone)}`);
            if (response.ok) {
              const statusData = await response.json();
              setStatus({
                status: statusData.rsvp?.status || 'PENDING',
                numberOfGuests: statusData.rsvp?.numberOfGuests,
                message: statusData.rsvp?.message,
                plusOne: statusData.rsvp?.plusOne,
                plusOneName: statusData.rsvp?.plusOneName,
                dietaryRestrictions: statusData.rsvp?.dietaryRestrictions,
                profilePhotoUrl: statusData.rsvp?.profilePhotoUrl,
                firstName: statusData.guest?.firstName,
                lastName: statusData.guest?.lastName,
                respondedAt: statusData.rsvp?.respondedAt
              });
            } else {
              setStatus(null);
            }
          } else {
            setStatus(null);
          }
        }
      } catch (error) {
        console.error('Error fetching RSVP status:', error);
        setStatus(null);
      } finally {
        setLoading(false);
      }
    };

    getStatus();
  }, [shareableToken]);

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
          {status.firstName && status.lastName && (
            <p className={styles.subtitle}>
              Merci <strong>{status.firstName} {status.lastName}</strong> !
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
              href={`/rsvp/shared/${shareableToken}`}
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