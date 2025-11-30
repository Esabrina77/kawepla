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
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { generateInvoicePDF } from '@/utils/invoiceGenerator';
import { useToast } from '@/components/ui/toast';
import styles from './history.module.css';

interface ServicePackMeta {
  id: string;
  name: string;
  slug: string;
  tier?: string | null;
  price: number;
  currency: string;
}

interface PurchaseHistoryItem {
  id: string;
  tier?: string | null;
  quantity: number;
  price: number;
  currency: string;
  stripePaymentId?: string;
  purchasedAt: string;
  servicePack?: ServicePackMeta | null;
}

interface PurchaseHistoryData {
  purchaseHistory: PurchaseHistoryItem[];
}

export default function PurchaseHistoryPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPurchaseHistory();
  }, []);

  const loadPurchaseHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading purchase history...');
      const data = await stripeApi.getPurchaseHistory();
      console.log('✅ Purchase history loaded:', data);

      setPurchaseHistory(data);
    } catch (error) {
      console.error('❌ Error loading purchase history:', error);
      setError('Impossible de charger l\'historique des achats.');
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

  const getTierDisplayName = (tier?: string | null) => {
    const tierNames: Record<string, string> = {
      'FREE': 'Gratuit',
      'ESSENTIAL': 'Essentiel',
      'ELEGANT': 'Élégant',
      'PREMIUM': 'Premium',
      'LUXE': 'Luxe'
    };
    if (!tier) return 'Pack personnalisé';
    return tierNames[tier] || tier;
  };

  const getTierIcon = (tier?: string | null) => {
    const tierIcons: Record<string, React.ReactNode> = {
      'FREE': <Package className={styles.tierIcon} />,
      'ESSENTIAL': <CheckCircle className={styles.tierIcon} />,
      'ELEGANT': <TrendingUp className={styles.tierIcon} />,
      'PREMIUM': <CreditCard className={styles.tierIcon} />,
      'LUXE': <CreditCard className={styles.tierIcon} />
    };
    return tierIcons[tier || ''] || <Package className={styles.tierIcon} />;
  };

  const getTierColor = (tier?: string | null) => {
    const tierColors: Record<string, string> = {
      'FREE': 'var(--luxury-pearl-gray)',
      'ESSENTIAL': 'var(--luxury-champagne-gold)',
      'ELEGANT': 'var(--luxury-rose-quartz)',
      'PREMIUM': 'var(--luxury-velvet-black)',
      'LUXE': 'var(--luxury-champagne-gold)'
    };
    return tierColors[tier || ''] || 'var(--luxury-pearl-gray)';
  };

  const getPurchaseDisplayName = (purchase: PurchaseHistoryItem) => {
    if (purchase.servicePack?.name) return purchase.servicePack.name;
    return `Pack ${getTierDisplayName(purchase.tier)}`;
  };

  const getEffectiveTier = (purchase: PurchaseHistoryItem) => {
    return purchase.servicePack?.tier || purchase.tier || 'FREE';
  };

  const handleDownloadInvoice = async (purchase: PurchaseHistoryItem) => {
    if (!user) return;

    const invoiceData = {
      invoiceNumber: `INV-${purchase.id.substring(0, 8).toUpperCase()}`,
      purchaseId: purchase.id,
      purchaseDate: purchase.purchasedAt,
      customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Client',
      customerEmail: user.email || '',
      itemName: `${purchase.quantity > 1 ? `${purchase.quantity}x ` : ''}${getPurchaseDisplayName(purchase)}`,
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
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Erreur lors de la génération de la facture. Veuillez réessayer.'
      });
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement de l'historique...</p>
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
          <Button onClick={loadPurchaseHistory} className={styles.retryButton}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  // Afficher uniquement l'historique des achats (PurchaseHistory)
  const allPurchases = (purchaseHistory?.purchaseHistory || []).map(p => {
    const effectiveTier = p.servicePack?.tier || p.tier;
    const baseName = p.servicePack?.name || getTierDisplayName(effectiveTier);
    return {
      ...p,
      effectiveTier,
      type: 'history' as const,
      displayPrice: formatPrice(p.price, p.currency),
      displayName: p.quantity > 1 ? `${p.quantity}x ${baseName}` : baseName
    };
  }).sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());

  const totalAmount = (purchaseHistory?.purchaseHistory || []).reduce((sum, p) => sum + p.price, 0);

  return (
    <div className={styles.historyPage}>
      {/* Header Sticky */}
      <HeaderMobile title="Historique des achats" />

      <main className={styles.main}>
        {/* Summary Cards */}
        <div className={styles.summarySection}>
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

            <div className={styles.summaryCard}>
              <div className={styles.summaryContent}>
                <div className={styles.summaryIcon}>
                  <Clock size={24} />
                </div>
                <div className={styles.summaryInfo}>
                  <h3>Dernier achat</h3>
                  <p>
                    {allPurchases.length > 0
                      ? formatDate(allPurchases[0].purchasedAt)
                      : 'Aucun achat'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase History */}
        <div className={styles.historySection}>
          <h2 className={styles.sectionTitle}>Historique détaillé</h2>

          {allPurchases.length === 0 ? (
            <div className={styles.emptyCard}>
              <div className={styles.emptyContent}>
                <CreditCard className={styles.emptyIcon} size={48} />
                <h3>Aucun achat trouvé</h3>
                <p>Vous n'avez pas encore effectué d'achat.</p>
                <Link href="/client/billing">
                  <Button className={styles.emptyButton}>Voir les forfaits disponibles</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className={styles.purchaseList}>
              {allPurchases.map((purchase, index) => (
                <div key={`${purchase.type}-${purchase.id}`} className={styles.purchaseCard}>
                  <div className={styles.purchaseHeader}>
                    <div className={styles.purchaseInfo}>
                      <div className={styles.purchaseTitle}>
                        {getTierIcon(purchase.effectiveTier)}
                        <span>{purchase.displayName}</span>
                      </div>
                      <div className={styles.purchaseMeta}>
                        <span className={styles.purchaseDate}>
                          <Calendar className={styles.metaIcon} size={14} />
                          {formatDate(purchase.purchasedAt)}
                        </span>
                        <Badge variant="default" className={styles.historyBadge}>Acheté</Badge>
                      </div>
                    </div>

                    <div className={styles.purchaseActions}>
                      <div className={styles.purchasePrice}>
                        {purchase.displayPrice}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(purchase)}
                        className={styles.invoiceButton}
                        title="Télécharger la facture PDF"
                      >
                        <FileText size={16} />
                        Facture PDF
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export Section */}
        {allPurchases.length > 0 && (
          <div className={styles.exportSection}>
            <div className={styles.exportCard}>
              <div className={styles.exportContent}>
                <div className={styles.exportInfo}>
                  <h3>Exporter l'historique</h3>
                  <p>Téléchargez votre historique des achats au format CSV</p>
                </div>
                <Button variant="outline" className={styles.exportButton}>
                  <Download className={styles.exportIcon} size={16} />
                  Exporter CSV
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


