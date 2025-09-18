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
  Clock
} from 'lucide-react';
import Link from 'next/link';
import styles from './billing.module.css';

export default function BillingPage() {
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
    loadBillingData();
    
    // Check for payment success/failure in URL
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    const planId = urlParams.get('plan');
    
    if (success === 'true' && planId) {
      handlePaymentReturn(planId);
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
    if (percentage >= 80) return '#dc3545'; // Rouge si critique (80%+)
    if (percentage >= 50) return '#ffc107'; // Orange si dépassé la moitié (50%+)
    return '#28a745'; // Vert si suffisant (<50%)
  };

  const getCurrentPlan = () => {
    return availablePlans.find(plan => plan.id === userLimits?.tier);
  };

  const getAvailableForPurchase = () => {
    // Retourner tous les plans payants (exclure FREE)
    return availablePlans.filter(plan => plan.id !== 'FREE');
  };

  const getOriginalPrice = (currentPrice: number) => {
    // Simuler un prix original pour l'effet de promotion
    // Par exemple, si le prix actuel est 39€, l'original pourrait être 59€
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
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.badge}>
          <CreditCard className={styles.badgeIcon} />
          Gestion des achats
        </div>
        
        <h1 className={styles.title}>
          Facturation & <span className={styles.titleAccent}>Packs d'achat</span>
        </h1>
        
        <p className={styles.subtitle}>
          Gérez vos achats et consultez votre utilisation
        </p>
      </div>

      {/* Current Status */}
      <Card className={styles.currentPlanCard}>
        <CardHeader>
          <div className={styles.planHeader}>
            <div className={styles.planInfo}>
              <CardTitle className={styles.planTitle}>
                <Crown className={styles.crownIcon} />
                Votre statut actuel
              </CardTitle>
              <div className={styles.planActions}>
                <Link href="/client/billing/history" className={styles.historyLink}>
                  <Clock className={styles.historyIcon} />
                  Voir l'historique
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('upgrade-section')?.scrollIntoView()}
                  className={styles.upgradeActionButton}
                >
                  Acheter des packs
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Packs achetés (hors FREE) */}
          {activePurchases?.activePurchases?.length > 0 ? (
            <div className={styles.activePurchasesGrid}>
              <div className={styles.purchasesHeader}>
                <h4>Packs achetés</h4>
              </div>
              {activePurchases.activePurchases.map((purchase: any, index: number) => (
                <div key={index} className={styles.purchaseItem}>
                  <div className={styles.purchaseHeader}>
                    <h4>{availablePlans.find(p => p.id === purchase.tier)?.name || purchase.tier}</h4>
                    <Badge variant="outline" className={styles.purchaseCount}>
                      {purchase.count}x
                    </Badge>
                  </div>
                  <p className={styles.purchaseDescription}>
                    {availablePlans.find(p => p.id === purchase.tier)?.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noPurchases}>
              <div className={styles.freeStatus}>
                <div className={styles.freeIcon}>🎉</div>
                <h4>Pack gratuit actif</h4>
                <p>Vous bénéficiez des fonctionnalités de base gratuitement</p>
              </div>
            </div>
          )}

          {/* Limites actuelles */}
          {activePurchases?.totalLimits && (
            <div className={styles.totalLimitsSection}>
              <div className={styles.limitsHeader}>
                <h4 className={styles.limitsTitle}>Vos limites actuelles</h4>
              </div>
              <div className={styles.limitsGrid}>
                <div className={styles.limitItem}>
                  <Mail className={styles.limitIcon} />
                  <span className={styles.limitLabel}>Invitations</span>
                  <span className={styles.limitValue}>
                    {userLimits?.usage?.invitations || 0} / {activePurchases.totalLimits.invitations || 0}
                  </span>
                  <div className={styles.limitProgress}>
                    <div 
                      className={styles.limitProgressBar}
                      style={{
                        width: `${Math.min(100, ((userLimits?.usage?.invitations || 0) / (activePurchases.totalLimits.invitations || 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
                <div className={styles.limitItem}>
                  <Users className={styles.limitIcon} />
                  <span className={styles.limitLabel}>Invités</span>
                  <span className={styles.limitValue}>
                    {userLimits?.usage?.guests || 0} / {activePurchases.totalLimits.guests || 0}
                  </span>
                  <div className={styles.limitProgress}>
                    <div 
                      className={styles.limitProgressBar}
                      style={{
                        width: `${Math.min(100, ((userLimits?.usage?.guests || 0) / (activePurchases.totalLimits.guests || 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
                <div className={styles.limitItem}>
                  <Image className={styles.limitIcon} />
                  <span className={styles.limitLabel}>Photos</span>
                  <span className={styles.limitValue}>
                    {userLimits?.usage?.photos || 0} / {activePurchases.totalLimits.photos || 0}
                  </span>
                  <div className={styles.limitProgress}>
                    <div 
                      className={styles.limitProgressBar}
                      style={{
                        width: `${Math.min(100, ((userLimits?.usage?.photos || 0) / (activePurchases.totalLimits.photos || 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Section */}
      {availablePlans.length > 0 && (
        <div id="upgrade-section" className={styles.upgradeSection}>
          <h2 className={styles.sectionTitle}>Acheter des packs supplémentaires</h2>
          <p className={styles.sectionSubtitle}>Achetez des packs pour augmenter vos limites</p>
          
          <div className={styles.upgradeGrid}>
            {availableForPurchase.map((plan) => {
              const isPopular = plan.id === 'ELEGANT';
              
              return (
                <Card key={plan.id} className={styles.upgradeCard} data-popular={plan.id === 'ELEGANT'}>
                  {/* Badge LIMITÉ pour créer l'urgence */}
                  {/* <div className={styles.limitedBadge}>LIMITÉ</div>
                   */}
                  <CardHeader>
                    <div className={styles.upgradeHeader}>
                      <div className={styles.upgradePlanName}>
                        {plan.name}
                        {plan.id === 'ELEGANT' && (
                          <Badge variant="default" className={styles.popularBadge}>POPULAIRE</Badge>
                        )}
                      </div>
                      <div className={styles.upgradePriceSection}>
                        <span className={styles.priceAmount}>{plan.price}€</span>
                        <span className={styles.priceUnit}>unique</span>
                      </div>
                      <p className={styles.upgradeDescription}>{plan.description}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={styles.upgradeLimits}>
                      <div className={styles.upgradeLimit}>
                        <Mail className={styles.limitIcon} />
                        <span>{formatNumber(plan.limits.invitations)} invitations</span>
                      </div>
                      <div className={styles.upgradeLimit}>
                        <Users className={styles.limitIcon} />
                        <span>{formatNumber(plan.limits.guests)} invités</span>
                      </div>
                      <div className={styles.upgradeLimit}>
                        <Image className={styles.limitIcon} />
                        <span>{formatNumber(plan.limits.photos)} photos</span>
                      </div>
                    </div>
                    
                    {/* Prix avec effet de promotion */}
                    <div className={styles.pricingSection}>
                      <div className={styles.originalPrice}>
                        {getOriginalPrice(plan.price)}€
                      </div>
                      <div className={styles.currentPrice}>
                        {plan.price}€
                      </div>
                      <div className={styles.promotionBadge}>
                        -{getDiscountPercentage(plan.price)}%
                      </div>
                    </div>
                    
                    {/* Message d'urgence */}
                    {/* <div className={styles.urgencyMessage}>
                      Offre limitée - Plus que 3 packs disponibles !
                    </div> */}
                    
                    <Button 
                      onClick={() => handleUpgradeClick(plan)}
                      disabled={upgrading}
                      className={styles.upgradeButton}
                    >
                      {upgrading ? 'Traitement...' : (
                        <>
                          <CreditCard className={styles.buttonIcon} />
                          <span>Acheter le pack {plan.name}</span>
                          <ExternalLink className={styles.buttonIcon} />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Success Message for LUXE users */}
      {currentPlan?.id === 'LUXE' && (
        <Card className={styles.luxeCard}>
          <CardContent>
            <div className={styles.luxeContent}>
              <Crown className={styles.luxeIcon} />
              <h3>Félicitations ! Vous avez le pack ultime</h3>
              <p>Profitez de toutes les fonctionnalités avec les limites du pack LUXE.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm Upgrade Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCancelUpgrade}
        onConfirm={handleConfirmUpgrade}
        title={`Acheter le pack ${confirmModal.plan?.name || ''} ?`}
        message={`Voulez-vous acheter le pack ${confirmModal.plan?.name || ''} pour ${confirmModal.plan?.price || 0}€ ?`}
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
        message={`Voulez-vous acheter ${serviceModal.service?.name || ''} pour ${serviceModal.service?.price || 0}€ ?`}
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