'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { stripeApi, ServicePurchasePlan, AdditionalService } from '@/lib/api/stripe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmModal, SuccessModal, ErrorModal } from '@/components/ui/modal';
import { 
  CreditCard, 
  Users, 
  Image, 
  Mail, 
  CheckCircle,
  AlertCircle,
  Crown,
  ExternalLink,
  Clock,
  Package,
  History
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderMobile } from '@/components/HeaderMobile';
import styles from './billing.module.css';

export default function BillingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [userLimits, setUserLimits] = useState<any>(null);
  const [activePurchases, setActivePurchases] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<ServicePurchasePlan[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [purchasingService, setPurchasingService] = useState<string | null>(null);
  
  // Modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    plan: ServicePurchasePlan | null;
  }>({
    isOpen: false,
    plan: null
  });

  const [serviceModal, setServiceModal] = useState<{
    isOpen: boolean;
    service: AdditionalService | null;
  }>({
    isOpen: false,
    service: null
  });

  // Success and Error modals
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  useEffect(() => {
    const checkPaymentReturn = async () => {
      // Check for payment success/failure in URL
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const canceled = urlParams.get('canceled');
      const planId = urlParams.get('plan');
      const serviceId = urlParams.get('service');
      const sessionId = urlParams.get('session_id');
      
      // Vérifier si on a déjà traité ce retour de paiement (éviter les doubles appels)
      const processedKey = `payment_processed_${sessionId || serviceId || planId}`;
      if (sessionStorage.getItem(processedKey)) {
        console.log('⚠️ Payment return already processed, skipping...');
        return;
      }
      
      if (success === 'true') {
        if (planId) {
          sessionStorage.setItem(processedKey, 'true');
          handlePaymentReturn(planId);
        } else if (serviceId) {
          // Marquer comme traité immédiatement pour éviter les doubles appels
          sessionStorage.setItem(processedKey, 'true');
          
          // Service supplémentaire acheté avec succès
          // En développement local, les webhooks ne sont pas reçus automatiquement
          // On appelle la confirmation manuelle comme fallback
          try {
            console.log('🔍 Confirming additional service purchase:', serviceId, 'session:', sessionId);
            const result = await stripeApi.confirmAdditionalService(serviceId, sessionId || undefined);
            
            if (result.success) {
              setSuccessModal({
                isOpen: true,
                title: 'Achat réussi !',
                message: result.message || 'Votre service supplémentaire a été ajouté à votre compte.'
              });
              
              // Recharger les données après confirmation
              await loadBillingData();
            } else {
              // Si déjà appliqué (par webhook), on affiche juste un message de succès
              setSuccessModal({
                isOpen: true,
                title: 'Achat réussi !',
                message: 'Votre service supplémentaire a été ajouté à votre compte.'
              });
              
              // Recharger quand même les données
              setTimeout(async () => {
                await loadBillingData();
              }, 1000);
            }
          } catch (error) {
            console.error('❌ Error confirming additional service:', error);
            // Même en cas d'erreur, on essaie de recharger (le webhook a peut-être traité)
            setSuccessModal({
              isOpen: true,
              title: 'Achat réussi !',
              message: 'Votre service supplémentaire sera ajouté à votre compte dans quelques instants.'
            });
            
            setTimeout(async () => {
              await loadBillingData();
            }, 2000);
          }
        }
      } else if (canceled === 'true') {
        setErrorModal({
          isOpen: true,
          title: 'Paiement annulé',
          message: 'Vous avez annulé le processus de paiement.'
        });
      }
      
      // Clean URL
      if (success || canceled) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    };

    loadBillingData();
    checkPaymentReturn();
  }, []);

  const loadBillingData = async () => {
    try {
      console.log('🔍 Loading billing data...');
      const [limits, activePurchasesData, plans, services] = await Promise.all([
        stripeApi.getUserLimitsAndUsage(),
        stripeApi.getActivePurchases(),
        stripeApi.getPlans(),
        stripeApi.getAdditionalServices()
      ]);
      
      console.log('✅ Limits loaded:', limits);
      console.log('✅ Active purchases loaded:', activePurchasesData);
      console.log('✅ Plans loaded:', plans);
      console.log('✅ Additional services loaded:', services);
      
      setUserLimits(limits);
      setActivePurchases(activePurchasesData);
      setAvailablePlans(plans);
      setAdditionalServices(services);
    } catch (error) {
      console.error('❌ Error loading billing data:', error);
      setErrorModal({
        isOpen: true,
        title: 'Erreur de chargement',
        message: 'Impossible de charger vos informations de facturation.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentReturn = async (planId: string) => {
    try {
      console.log('🔍 Handling payment return for plan:', planId);
      const result = await stripeApi.confirmPayment(planId);
      
      if (result.success) {
        setSuccessModal({
          isOpen: true,
          title: 'Paiement réussi !',
          message: result.message
        });
        
        // Refresh billing data
        await loadBillingData();
      } else {
        setErrorModal({
          isOpen: true,
          title: 'Erreur de paiement',
          message: result.message
        });
      }
    } catch (error) {
      console.error('❌ Error confirming payment:', error);
      setErrorModal({
        isOpen: true,
        title: 'Erreur de confirmation',
        message: 'Impossible de confirmer le paiement.'
      });
    }
  };

  const handleUpgradeClick = (plan: ServicePurchasePlan) => {
    console.log('🔍 handleUpgradeClick called with plan:', plan);
    console.log('🔍 Setting modal state to open');
    setConfirmModal({
      isOpen: true,
      plan: plan
    });
    console.log('🔍 Modal state set:', { isOpen: true, plan: plan.name });
  };

  const handleConfirmUpgrade = async () => {
    if (!confirmModal.plan) return;
    
    const plan = confirmModal.plan;
    setUpgrading(true);
    
    try {
      console.log('🔍 Creating checkout session for plan:', plan.id);
      const session = await stripeApi.createCheckoutSession(plan.id);
      console.log('✅ Checkout session created:', session);
      
      // Fermer la modal
      setConfirmModal({ isOpen: false, plan: null });
      
      // Redirection vers Stripe Checkout
      if (session.url) {
        console.log('🔍 Redirecting to Stripe Checkout:', session.url);
        window.location.href = session.url;
      } else {
        throw new Error('Aucune URL de session retournée');
      }
    } catch (error) {
      console.error('❌ Error creating checkout session:', error);
      setErrorModal({
        isOpen: true,
        title: 'Erreur de paiement',
        message: 'Impossible de créer la session de paiement.'
      });
      setConfirmModal({ isOpen: false, plan: null });
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancelUpgrade = () => {
    console.log('🔍 User cancelled upgrade');
    setConfirmModal({ isOpen: false, plan: null });
  };

  const handleServiceClick = (service: AdditionalService) => {
    console.log('🔍 handleServiceClick called with service:', service);
    setServiceModal({
      isOpen: true,
      service: service
    });
  };

  const handleConfirmService = async () => {
    if (!serviceModal.service) return;
    
    const service = serviceModal.service;
    setPurchasingService(service.id);
    
    try {
      console.log('🔍 Processing service purchase:', service.id);
      
      // Créer une session de checkout pour le service supplémentaire
      const result = await stripeApi.createAdditionalServiceCheckoutSession(service.id);
      
      // Rediriger vers Stripe Checkout
      window.location.href = result.url;
    } catch (error) {
      console.error('❌ Error processing service purchase:', error);
      setErrorModal({
        isOpen: true,
        title: 'Erreur d\'achat',
        message: 'Impossible d\'acheter le service supplémentaire.'
      });
      setServiceModal({ isOpen: false, service: null });
    } finally {
      setPurchasingService(null);
    }
  };

  const handleCancelService = () => {
    console.log('🔍 User cancelled service purchase');
    setServiceModal({ isOpen: false, service: null });
  };

  const handlePaymentConfirm = async () => {
    // Cette fonction n'est plus utilisée
    console.log('🔍 handlePaymentConfirm - deprecated');
  };

  const handlePlanChange = async (planId: string) => {
    console.log('🔍 handlePlanChange called with planId:', planId);
    setUpgrading(true);
    try {
      const result: any = await stripeApi.changePlan(planId);
      console.log('✅ Plan change result:', result);
      
      if (result.url) {
        // Upgrade requiring payment
        console.log('🔍 Redirecting to payment URL:', result.url);
        window.location.href = result.url;
      } else if (result.success) {
        // Direct downgrade
        setSuccessModal({
          isOpen: true,
          title: 'Forfait modifié !',
          message: `Vous êtes maintenant sur le forfait ${result.plan?.name}.`
        });
        
        // Refresh billing data
        await loadBillingData();
      }
    } catch (error) {
      console.error('❌ Error changing plan:', error);
      setErrorModal({
        isOpen: true,
        title: 'Erreur de changement',
        message: 'Impossible de changer votre forfait.'
      });
    } finally {
      setUpgrading(false);
    }
  };

  const formatNumber = (num: number) => {
    return num === 999999 ? '∞' : num.toLocaleString();
  };

  const getProgressPercentage = (used: number, limit: number) => {
    if (limit === 999999) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'var(--alert-error)'; // Rouge si critique (80%+)
    if (percentage >= 50) return 'var(--alert-warning)'; // Orange si dépassé la moitié (50%+)
    return 'var(--alert-success)'; // Vert si suffisant (<50%)
  };

  const getCurrentPlan = () => {
    return availablePlans.find(plan => plan.tier === userLimits?.tier);
  };

  const getAvailableForPurchase = () => {
    // Retourner tous les plans payants (exclure FREE)
    return availablePlans.filter(plan => plan.tier !== 'FREE');
  };

  const getOriginalPrice = (currentPrice: number) => {
    if (currentPrice <= 39) return 59;
    if (currentPrice <= 69) return 99;
    if (currentPrice <= 99) return 149;
    if (currentPrice <= 149) return 199;
    return Math.floor(currentPrice * 1.4); // Prix actuel * 1.4 pour un effet de promotion
  };

  const getDiscountPercentage = (currentPrice: number) => {
    // Calculer le pourcentage de réduction
    const originalPrice = getOriginalPrice(currentPrice);
    if (originalPrice === 0) return 0; // Eviter la division par zéro
    return Math.floor(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement de vos informations de facturation...</p>
        </div>
      </div>
    );
  }

  if (!userLimits) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <AlertCircle className={styles.errorIcon} />
          <h2>Erreur de chargement</h2>
          <p>Impossible de charger vos informations de facturation.</p>
          <Button onClick={loadBillingData}>Réessayer</Button>
        </div>
      </div>
    );
  }

  const currentPlan = getCurrentPlan();
  const availableForPurchase = getAvailableForPurchase();

  return (
    <div className={styles.billingPage}>
      {/* Header Sticky */}
      <HeaderMobile title="Facturation & Packs d'achat" />
        
      <main className={styles.main}>
        {/* Current Status Section */}
        <section className={styles.currentStatusSection}>
          <h2 className={styles.sectionTitle}>Votre statut actuel</h2>
          
          {/* Packs achetés */}
          {activePurchases?.activePurchases?.length > 0 && (
            <div className={styles.purchasesList}>
              {activePurchases.activePurchases.map((purchase: any, index: number) => (
                <div key={index} className={styles.purchaseItem}>
                  <div className={styles.purchaseLeft}>
                    <div className={styles.purchaseIconWrapper}>
                      <Package size={24} />
                    </div>
                    <p className={styles.purchaseName}>
                      {purchase.pack?.name || availablePlans.find(p => p.tier === purchase.tier)?.name || purchase.tier || 'Pack personnalisé'}
                    </p>
                  </div>
                  <div className={styles.purchaseCount}>
                    x{purchase.count}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Divider */}
          {activePurchases?.activePurchases?.length > 0 && activePurchases?.totalLimits && (
            <hr className={styles.divider} />
          )}

          {/* Limites actuelles */}
          {activePurchases?.totalLimits && (
            <>
              <h3 className={styles.limitsTitle}>Limites actuelles</h3>
              <div className={styles.limitsList}>
                <div className={styles.limitItem}>
                  <div className={styles.limitHeader}>
                    <p className={styles.limitLabel}>Invitations</p>
                    <p className={styles.limitValue}>
                    {userLimits?.usage?.invitations || 0} / {activePurchases.totalLimits.invitations || 0}
                    </p>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{
                        width: `${Math.min(100, ((userLimits?.usage?.invitations || 0) / (activePurchases.totalLimits.invitations || 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
                <div className={styles.limitItem}>
                  <div className={styles.limitHeader}>
                    <p className={styles.limitLabel}>Invités</p>
                    <p className={styles.limitValue}>
                    {userLimits?.usage?.guests || 0} / {activePurchases.totalLimits.guests || 0}
                    </p>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{
                        width: `${Math.min(100, ((userLimits?.usage?.guests || 0) / (activePurchases.totalLimits.guests || 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
                <div className={styles.limitItem}>
                  <div className={styles.limitHeader}>
                    <p className={styles.limitLabel}>Photos</p>
                    <p className={styles.limitValue}>
                    {userLimits?.usage?.photos || 0} / {activePurchases.totalLimits.photos || 0}
                    </p>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{
                        width: `${Math.min(100, ((userLimits?.usage?.photos || 0) / (activePurchases.totalLimits.photos || 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
                <div className={styles.limitItem}>
                  <div className={styles.limitHeader}>
                    <p className={styles.limitLabel}>Requêtes IA</p>
                    <p className={styles.limitValue}>
                      {userLimits?.usage?.aiRequests || 0} / {activePurchases.totalLimits.aiRequests || 0}
                    </p>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{
                        width: `${Math.min(100, ((userLimits?.usage?.aiRequests || 0) / (activePurchases.totalLimits.aiRequests || 1)) * 100)}%`,
                        backgroundColor: (userLimits?.remaining?.aiRequests || 0) === 0 ? '#ef4444' : (userLimits?.remaining?.aiRequests || 0) <= 5 ? '#f59e0b' : undefined
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Bouton Historique */}
          <button 
            className={styles.historyButton}
            onClick={() => router.push('/client/billing/history')}
          >
            <History size={20} />
            Voir l'historique
          </button>
        </section>

      {/* Upgrade Section */}
        <section className={styles.upgradeSection}>
          <h2 className={styles.upgradeTitle}>Upgradez votre expérience</h2>
          <div className={styles.plansGrid}>
            {availablePlans.map((plan) => {
              const isPopular = !!plan.isHighlighted;
              
              return (
                <div 
                  key={plan.id} 
                  className={`${styles.planCard} ${isPopular ? styles.popular : ''}`}
                >
                  {isPopular && (
                    <div className={styles.popularBadge}>POPULAIRE</div>
                  )}
                  
                  <div className={styles.planHeader}>
                    <h3 className={styles.planName}>{plan.name}</h3>
                    
                    {plan.price === 0 ? (
                      <p className={styles.currentPrice}>Gratuit</p>
                    ) : (
                      <div className={styles.priceContainer}>
                        <p className={styles.currentPrice}>
                          {plan.price.toLocaleString('fr-FR', { style: 'currency', currency: plan.currency || 'EUR' })}
                        </p>
                        {getOriginalPrice(plan.price) > plan.price && (
                          <>
                            <p className={styles.originalPrice}>
                              {getOriginalPrice(plan.price).toLocaleString('fr-FR', { style: 'currency', currency: plan.currency || 'EUR' })}
                            </p>
                            <span className={styles.discountBadge}>
                        -{getDiscountPercentage(plan.price)}%
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    </div>
                    
                  <ul className={styles.featuresList}>
                    <li className={styles.featureItem}>
                      <CheckCircle className={styles.featureIcon} size={16} />
                      <span>{formatNumber(plan.limits.invitations)} Invitations</span>
                    </li>
                    <li className={styles.featureItem}>
                      <CheckCircle className={styles.featureIcon} size={16} />
                      <span>{formatNumber(plan.limits.guests)} Invités</span>
                    </li>
                    <li className={styles.featureItem}>
                      <CheckCircle className={styles.featureIcon} size={16} />
                      <span>{formatNumber(plan.limits.photos)} Photos</span>
                    </li>
                    <li className={styles.featureItem}>
                      <CheckCircle className={styles.featureIcon} size={16} />
                      <span>{formatNumber(plan.limits.aiRequests || 0)} Requêtes IA</span>
                    </li>
                  </ul>
                  
                  {plan.tier !== 'FREE' && (
                    <button
                      className={styles.buyButton}
                      onClick={() => handleUpgradeClick(plan)}
                      disabled={upgrading}
                    >
                      Acheter le pack
                    </button>
                      )}
                </div>
              );
            })}
          </div>
        </section>

      {/* Additional Services Section */}
        {additionalServices.length > 0 && (
          <section className={styles.upgradeSection}>
            <h2 className={styles.upgradeTitle}>Packs supplémentaires</h2>
            <p className={styles.sectionDescription}>
              Ajoutez des fonctionnalités à votre forfait actuel
            </p>
            <div className={styles.plansGrid}>
              {additionalServices.map((service) => {
                const getServiceIcon = () => {
                  switch (service.type) {
                    case 'guests':
                      return <Users className={styles.serviceIcon} size={20} />;
                    case 'photos':
                      return <Image className={styles.serviceIcon} size={20} />;
                    case 'invitations':
                      return <Mail className={styles.serviceIcon} size={20} />;
                    case 'designs':
                      return <Crown className={styles.serviceIcon} size={20} />;
                    case 'aiRequests':
                      return <Mail className={styles.serviceIcon} size={20} />;
                    default:
                      return <Package className={styles.serviceIcon} size={20} />;
                  }
                };

                const getServiceLabel = () => {
                  switch (service.type) {
                    case 'guests':
                      return `${service.quantity} invités`;
                    case 'photos':
                      return `${service.quantity} photos`;
                    case 'invitations':
                      return `${service.quantity} événement${service.quantity > 1 ? 's' : ''}`;
                    case 'designs':
                      return `${service.quantity} design${service.quantity > 1 ? 's' : ''}`;
                    case 'aiRequests':
                      return `${service.quantity} requêtes IA`;
                    default:
                      return service.name;
                  }
                };

                return (
                  <div 
                    key={service.id} 
                    className={styles.planCard}
                  >
                    <div className={styles.planHeader}>
                      <div className={styles.serviceHeader}>
                        {getServiceIcon()}
                        <h3 className={styles.planName}>{service.name}</h3>
                      </div>
                      <div className={styles.priceContainer}>
                        <p className={styles.currentPrice}>
                          {service.price.toLocaleString('fr-FR', { style: 'currency', currency: service.currency || 'EUR' })}
                        </p>
                      </div>
                    </div>
                    
                    <p className={styles.serviceDescription}>{service.description}</p>
                    
                    <ul className={styles.featuresList}>
                      <li className={styles.featureItem}>
                        <CheckCircle className={styles.featureIcon} size={16} />
                        <span>{getServiceLabel()}</span>
                      </li>
                    </ul>
                    
                    <button
                      className={styles.buyButton}
                      onClick={() => handleServiceClick(service)}
                      disabled={purchasingService === service.id}
                    >
                      {purchasingService === service.id ? 'Traitement...' : 'Acheter'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Confirm Upgrade Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCancelUpgrade}
        onConfirm={handleConfirmUpgrade}
        title={`Acheter le pack ${confirmModal.plan?.name || ''} ?`}
        message={`Voulez-vous acheter le pack ${confirmModal.plan?.name || ''} pour ${confirmModal.plan ? confirmModal.plan.price.toLocaleString('fr-FR', { style: 'currency', currency: confirmModal.plan.currency || 'EUR' }) : '0€'} ?`}
        confirmText="Oui, acheter le pack"
        cancelText="Non, annuler"
        isLoading={upgrading}
      />

      {/* Confirm Service Modal */}
      <ConfirmModal
        isOpen={serviceModal.isOpen}
        onClose={handleCancelService}
        onConfirm={handleConfirmService}
        title={`Acheter ${serviceModal.service?.name || ''} ?`}
        message={`Voulez-vous acheter ${serviceModal.service?.name || ''} pour ${serviceModal.service ? serviceModal.service.price.toLocaleString('fr-FR', { style: 'currency', currency: serviceModal.service.currency || 'EUR' }) : '0€'} ?`}
        confirmText="Oui, acheter"
        cancelText="Non, annuler"
        isLoading={purchasingService !== null}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
        confirmText="Parfait !"
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
        title={errorModal.title}
        message={errorModal.message}
        confirmText="Compris"
      />
    </div>
  );
} 