'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { stripeApi } from '@/lib/api/stripe';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeaderMobile } from '@/components/HeaderMobile';
import { 
  CreditCard, 
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Calendar,
  Euro,
  Package,
  TrendingUp,
  FileText,
  Sparkles,
  Wand2,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { generateInvoicePDF } from '@/utils/invoiceGenerator';
import styles from './billing.module.css';

interface PurchaseHistoryItem {
  id: string;
  tier: string;
  quantity: number;
  price: number;
  currency: string;
  stripePaymentId?: string;
  purchasedAt: string;
}

interface PurchaseHistoryData {
  purchaseHistory: PurchaseHistoryItem[];
}

export default function ProviderBillingPage() {
  const { user } = useAuth();
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger uniquement l'historique (plus de plans providers - tous ont 20 requêtes IA fixes)
      const historyData = await stripeApi.getPurchaseHistory() as PurchaseHistoryData;
      
      setPurchaseHistory(historyData);
    } catch (error) {
      console.error('❌ Error loading billing data:', error);
      setError('Impossible de charger les données de facturation.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const getTierDisplayName = (tier: string) => {
    const tierNames: Record<string, string> = {
      'PROVIDER_FREE': 'Starter',
      'PROVIDER_BASIC': 'Basic',
      'PROVIDER_PRO': 'Pro',
      'PROVIDER_ELITE': 'Elite'
    };
    return tierNames[tier] || tier;
  };


  const handleDownloadInvoice = async (purchase: PurchaseHistoryItem) => {
    if (!user) return;

    const invoiceData = {
      invoiceNumber: `INV-${purchase.id.substring(0, 8).toUpperCase()}`,
      purchaseId: purchase.id,
      purchaseDate: purchase.purchasedAt,
      customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Provider',
      customerEmail: user.email || '',
      itemName: `${purchase.quantity > 1 ? `${purchase.quantity}x ` : ''}Plan ${getTierDisplayName(purchase.tier)}`,
      quantity: purchase.quantity,
      unitPrice: purchase.price / purchase.quantity,
      totalPrice: purchase.price,
      currency: purchase.currency,
      stripePaymentId: purchase.stripePaymentId
    };

    try {
      await generateInvoicePDF(invoiceData);
    } catch (error) {
      console.error('Erreur lors de la génération de la facture:', error);
      alert('Erreur lors de la génération de la facture. Veuillez réessayer.');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <AlertCircle className={styles.errorIcon} />
          <h2>Erreur de chargement</h2>
          <p>{error}</p>
          <Button onClick={loadData} className={styles.retryButton}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  const allPurchases = (purchaseHistory?.purchaseHistory || []).filter(p => 
    p.tier.startsWith('PROVIDER_')
  ).map(p => ({
    ...p,
    displayPrice: formatPrice(p.price, p.currency),
    displayName: p.quantity > 1 ? `${p.quantity}x ${getTierDisplayName(p.tier)}` : getTierDisplayName(p.tier)
  })).sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());

  const totalAmount = allPurchases.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className={styles.billingPage}>
      <HeaderMobile title="Facturation" />

      <main className={styles.main}>
        {/* Info Section - Tous les providers ont 20 requêtes IA */}
        <div className={styles.plansSection}>
          <h2 className={styles.sectionTitle}>Votre forfait</h2>
          
          <div className={styles.planCard}>
            <div className={styles.planHeader}>
              <h3 className={styles.planName}>Forfait Provider</h3>
              <div className={styles.planPrice}>
                <span className={styles.freePrice}>Gratuit</span>
              </div>
            </div>
            
            <p className={styles.planDescription}>Tous les providers bénéficient de 20 requêtes IA par mois pour améliorer les descriptions de leurs services.</p>
            
            <div className={styles.planFeatures}>
              <div className={styles.featureItem}>
                <Zap size={16} />
                <span>20 requêtes IA par mois</span>
              </div>
              <div className={styles.featureItem}>
                <CheckCircle size={16} />
                <span>Amélioration des descriptions de services</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className={styles.summarySection}>
          <h2 className={styles.sectionTitle}>Résumé</h2>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryContent}>
                <div className={styles.summaryIcon}>
                  <CheckCircle size={24} />
                </div>
                <div className={styles.summaryInfo}>
                  <h3>Total des achats</h3>
                  <p>{allPurchases.length}</p>
                </div>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryContent}>
                <div className={styles.summaryIcon}>
                  <Euro size={24} />
                </div>
                <div className={styles.summaryInfo}>
                  <h3>Montant total</h3>
                  <p>{formatPrice(totalAmount)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase History */}
        {allPurchases.length > 0 && (
          <div className={styles.historySection}>
            <h2 className={styles.sectionTitle}>Historique des achats</h2>
            
            <div className={styles.purchaseList}>
              {allPurchases.map((purchase) => (
                <div key={purchase.id} className={styles.purchaseCard}>
                  <div className={styles.purchaseHeader}>
                    <div className={styles.purchaseInfo}>
                      <h3>{purchase.displayName}</h3>
                      <p className={styles.purchaseDate}>{formatDate(purchase.purchasedAt)}</p>
                    </div>
                    <div className={styles.purchasePrice}>
                      {purchase.displayPrice}
                    </div>
                  </div>
                  
                  <div className={styles.purchaseActions}>
                    <Button
                      onClick={() => handleDownloadInvoice(purchase)}
                      className={styles.invoiceButton}
                      variant="outline"
                    >
                      <FileText size={16} />
                      Facture PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

