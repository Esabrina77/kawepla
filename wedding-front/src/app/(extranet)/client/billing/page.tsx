'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { stripeApi, SubscriptionPlan, AdditionalService } from '@/lib/api/stripe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { ConfirmModal } from '@/components/ui/modal';
import { 
  CreditCard, 
  Calendar, 
  Users, 
  Image, 
  Mail, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Crown,
  ExternalLink,
  Plus,
  Package,
  Sparkles
} from 'lucide-react';
import styles from './billing.module.css';

export default function BillingPage() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const [userLimits, setUserLimits] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [purchasingService, setPurchasingService] = useState<string | null>(null);
  
  // Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    plan: SubscriptionPlan | null;
  }>({
    isOpen: false,
    plan: null
  });

  // Service modal state
  const [serviceModal, setServiceModal] = useState<{
    isOpen: boolean;
    service: AdditionalService | null;
  }>({
    isOpen: false,
    service: null
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
      addToast({
        type: 'info',
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
      const [limits, plans, services] = await Promise.all([
        stripeApi.getUserLimitsAndUsage(),
        stripeApi.getPlans(),
        stripeApi.getAdditionalServices()
      ]);
      
      console.log('✅ Limits loaded:', limits);
      console.log('✅ Plans loaded:', plans);
      console.log('✅ Additional services loaded:', services);
      
      setUserLimits(limits);
      setAvailablePlans(plans);
      setAdditionalServices(services);
    } catch (error) {
      console.error('❌ Error loading billing data:', error);
      addToast({
        type: 'error',
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
        addToast({
          type: 'success',
          title: 'Paiement réussi !',
          message: result.message
        });
        
        // Refresh user data to get updated subscription tier
        await refreshUser();
        
        // Refresh billing data
        await loadBillingData();
      } else {
        addToast({
          type: 'error',
          title: 'Erreur de paiement',
          message: result.message
        });
      }
    } catch (error) {
      console.error('❌ Error confirming payment:', error);
      addToast({
        type: 'error',
        title: 'Erreur de confirmation',
        message: 'Impossible de confirmer le paiement.'
      });
    }
  };

  const handleUpgradeClick = (plan: SubscriptionPlan) => {
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
      addToast({
        type: 'error',
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
      addToast({
        type: 'error',
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
        addToast({
          type: 'success',
          title: 'Forfait modifié !',
          message: `Vous êtes maintenant sur le forfait ${result.plan?.name}.`
        });
        
        // Refresh user data to get updated subscription tier
        await refreshUser();
        
        // Refresh billing data
        await loadBillingData();
      }
    } catch (error) {
      console.error('❌ Error changing plan:', error);
      addToast({
        type: 'error',
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
    if (percentage >= 90) return 'var(--color-danger)';
    if (percentage >= 70) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  const getCurrentPlan = () => {
    return availablePlans.find(plan => plan.id === userLimits?.tier);
  };

  const getOtherPlans = () => {
    if (!userLimits) return [];
    // Ne retourner que les plans plus chers que le forfait actuel
    const currentPlan = getCurrentPlan();
    return availablePlans.filter(plan => 
      plan.id !== userLimits.tier && 
      plan.price > (currentPlan?.price || 0)
    );
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>Chargement de vos informations de facturation...</p>
      </div>
    );
  }

  if (!userLimits) {
    return (
      <div className={styles.error}>
        <AlertCircle className={styles.errorIcon} />
        <h2>Erreur de chargement</h2>
        <p>Impossible de charger vos informations de facturation.</p>
        <Button onClick={loadBillingData}>Réessayer</Button>
      </div>
    );
  }

  const currentPlan = getCurrentPlan();
  const upgradePlans = getOtherPlans();

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Facturation & Abonnement</h1>
        <p>Gérez votre forfait et consultez votre utilisation</p>
      </div>

      {/* Current Plan */}
      <Card className={styles.currentPlanCard}>
        <CardHeader>
          <div className={styles.planHeader}>
            <div className={styles.planInfo}>
              <CardTitle className={styles.planTitle}>
                <Crown className={styles.crownIcon} />
                Forfait actuel : {currentPlan?.name || 'Inconnu'}
              </CardTitle>
              <Badge variant={currentPlan?.id === 'FREE' ? 'secondary' : 'default'}>
                {currentPlan?.price === 0 ? 'Gratuit' : `${currentPlan?.price}€`}
              </Badge>
            </div>
            {currentPlan?.id !== 'LUXE' && (
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('upgrade-section')?.scrollIntoView()}
              >
                Améliorer le forfait
              </Button>
            )}
          </div>
          <p className={styles.planDescription}>{currentPlan?.description}</p>
        </CardHeader>
        <CardContent>
          <div className={styles.featuresGrid}>
            {currentPlan?.features.map((feature, index) => (
              <div key={index} className={styles.feature}>
                <CheckCircle className={styles.checkIcon} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <div className={styles.usageSection}>
        <h2>Utilisation actuelle</h2>
        <div className={styles.usageGrid}>
          <Card className={styles.usageCard}>
            <CardHeader>
              <CardTitle className={styles.usageTitle}>
                <Mail className={styles.usageIcon} />
                Invitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.usageStats}>
                <span className={styles.usageNumber}>
                  {userLimits.usage.invitations} / {formatNumber(userLimits.limits.invitations)}
                </span>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ 
                      width: `${getProgressPercentage(userLimits.usage.invitations, userLimits.limits.invitations)}%`,
                      backgroundColor: getProgressColor(getProgressPercentage(userLimits.usage.invitations, userLimits.limits.invitations))
                    }}
                  />
                </div>
                <span className={styles.remainingText}>
                  {formatNumber(userLimits.remaining.invitations)} restantes
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className={styles.usageCard}>
            <CardHeader>
              <CardTitle className={styles.usageTitle}>
                <Users className={styles.usageIcon} />
                Invités
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.usageStats}>
                <span className={styles.usageNumber}>
                  {userLimits.usage.guests} / {formatNumber(userLimits.limits.guests)}
                </span>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ 
                      width: `${getProgressPercentage(userLimits.usage.guests, userLimits.limits.guests)}%`,
                      backgroundColor: getProgressColor(getProgressPercentage(userLimits.usage.guests, userLimits.limits.guests))
                    }}
                  />
                </div>
                <span className={styles.remainingText}>
                  {formatNumber(userLimits.remaining.guests)} restants
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className={styles.usageCard}>
            <CardHeader>
              <CardTitle className={styles.usageTitle}>
                <Image className={styles.usageIcon} />
                Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.usageStats}>
                <span className={styles.usageNumber}>
                  {userLimits.usage.photos} / {formatNumber(userLimits.limits.photos)}
                </span>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ 
                      width: `${getProgressPercentage(userLimits.usage.photos, userLimits.limits.photos)}%`,
                      backgroundColor: getProgressColor(getProgressPercentage(userLimits.usage.photos, userLimits.limits.photos))
                    }}
                  />
                </div>
                <span className={styles.remainingText}>
                  {formatNumber(userLimits.remaining.photos)} restantes
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upgrade Section */}
      {availablePlans.length > 0 && (
        <div id="upgrade-section" className={styles.upgradeSection}>
          <h2>Changer de forfait</h2>
          <p>Passez à un forfait différent selon vos besoins</p>
          
          <div className={styles.upgradeGrid}>
            {getOtherPlans().map((plan) => {
              const currentPlan = getCurrentPlan();
              const isUpgrade = currentPlan && plan.price > currentPlan.price;
              
              return (
                <Card key={plan.id} className={styles.upgradeCard}>
                  <CardHeader>
                    <CardTitle className={styles.upgradePlanTitle}>
                      {plan.name}
                      {plan.id === 'ELEGANT' && (
                        <Badge variant="default">Populaire</Badge>
                      )}
                    </CardTitle>
                    <div className={styles.upgradePrice}>
                      <span className={styles.priceAmount}>{plan.price}€</span>
                      <span className={styles.priceUnit}>unique</span>
                    </div>
                    <p className={styles.upgradeDescription}>{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className={styles.upgradeLimits}>
                      <div className={styles.upgradeLimit}>
                        <Mail size={16} />
                        <span>{formatNumber(plan.limits.invitations)} invitations</span>
                      </div>
                      <div className={styles.upgradeLimit}>
                        <Users size={16} />
                        <span>{formatNumber(plan.limits.guests)} invités</span>
                      </div>
                      <div className={styles.upgradeLimit}>
                        <Image size={16} />
                        <span>{formatNumber(plan.limits.photos)} photos</span>
                      </div>
                    </div>
                    
                      <Button 
                        onClick={() => handleUpgradeClick(plan)}
                        disabled={upgrading}
                        className={styles.upgradeButton}
                      >
                        {upgrading ? 'Traitement...' : (
                          <div className="flex items-center space-x-2">
                            <CreditCard size={16} />
                            <span>Passer à {plan.name}</span>
                            <ExternalLink size={14} />
                          </div>
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
              <h3>Félicitations ! Vous avez le forfait ultime</h3>
              <p>Profitez de toutes les fonctionnalités avec les limites de l'abonnement LUXE.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Services Section 
      {additionalServices.length > 0 && (
        <div className={styles.additionalServicesSection}>
          <h2>Services Supplémentaires</h2>
          <p>Étendez votre forfait avec ces services optionnels</p>
          
          <div className={styles.servicesGrid}>
            {additionalServices.map((service) => {
              const ServiceIcon = service.type === 'guests' ? Users : service.type === 'photos' ? Image : Sparkles;
              
              return (
                <Card key={service.id} className={styles.serviceCard}>
                  <CardHeader>
                    <div className={styles.serviceHeader}>
                      <ServiceIcon className={styles.serviceIcon} />
                      <CardTitle className={styles.serviceTitle}>{service.name}</CardTitle>
                    </div>
                    <div className={styles.servicePrice}>
                      <span className={styles.priceAmount}>{service.price}€</span>
                      <span className={styles.priceUnit}>unique</span>
                    </div>
                    <p className={styles.serviceDescription}>{service.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className={styles.serviceDetails}>
                      <div className={styles.serviceQuantity}>
                        <Package size={16} />
                        <span>+{service.quantity} {service.type === 'guests' ? 'invités' : service.type === 'photos' ? 'photos' : 'design'}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleServiceClick(service)}
                      disabled={purchasingService === service.id}
                      className={styles.serviceButton}
                    >
                      {purchasingService === service.id ? 'Traitement...' : (
                        <div className="flex items-center space-x-2">
                          <Plus size={16} />
                          <span>Ajouter</span>
                          <ExternalLink size={14} />
                        </div>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
*/}


      {/* Confirm Upgrade Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCancelUpgrade}
        onConfirm={handleConfirmUpgrade}
        title={`Passer au forfait ${confirmModal.plan?.name || ''} ?`}
        message={`Voulez-vous passer au forfait ${confirmModal.plan?.name || ''} pour ${confirmModal.plan?.price || 0}€ ?`}
        confirmText="Oui, passer au forfait"
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
    </div>
  );
} 