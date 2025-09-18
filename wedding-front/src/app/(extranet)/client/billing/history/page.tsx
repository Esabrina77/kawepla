'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { stripeApi } from '@/lib/api/stripe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Download,
  Calendar,
  Euro,
  Package,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import styles from './history.module.css';

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

export default function PurchaseHistoryPage() {
  const { user } = useAuth();
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

  const getTierDisplayName = (tier: string) => {
    const tierNames: Record<string, string> = {
      'FREE': 'Gratuit',
      'ESSENTIAL': 'Essentiel',
      'ELEGANT': 'Élégant',
      'PREMIUM': 'Premium',
      'LUXE': 'Luxe'
    };
    return tierNames[tier] || tier;
  };

  const getTierIcon = (tier: string) => {
    const tierIcons: Record<string, React.ReactNode> = {
      'FREE': <Package className={styles.tierIcon} />,
      'ESSENTIAL': <CheckCircle className={styles.tierIcon} />,
      'ELEGANT': <TrendingUp className={styles.tierIcon} />,
      'PREMIUM': <CreditCard className={styles.tierIcon} />,
      'LUXE': <CreditCard className={styles.tierIcon} />
    };
    return tierIcons[tier] || <Package className={styles.tierIcon} />;
  };

  const getTierColor = (tier: string) => {
    const tierColors: Record<string, string> = {
      'FREE': 'var(--luxury-pearl-gray)',
      'ESSENTIAL': 'var(--luxury-champagne-gold)',
      'ELEGANT': 'var(--luxury-rose-quartz)',
      'PREMIUM': 'var(--luxury-velvet-black)',
      'LUXE': 'var(--luxury-champagne-gold)'
    };
    return tierColors[tier] || 'var(--luxury-pearl-gray)';
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
  const allPurchases = (purchaseHistory?.purchaseHistory || []).map(p => ({
    ...p,
    type: 'history' as const,
    displayPrice: formatPrice(p.price, p.currency),
    displayName: p.quantity > 1 ? `${p.quantity}x ${getTierDisplayName(p.tier)}` : getTierDisplayName(p.tier)
  })).sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());

  const totalAmount = (purchaseHistory?.purchaseHistory || []).reduce((sum, p) => sum + p.price, 0);

  return (
    <div className={styles.historyPage}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.headerTop}>
          <Link href="/client/billing" className={styles.backButton}>
            <ArrowLeft className={styles.backIcon} />
            Retour à la facturation
          </Link>
        </div>
        
        <div className={styles.badge}>
          <CreditCard className={styles.badgeIcon} />
          Historique des achats
        </div>
        
        <h1 className={styles.title}>
          Historique des <span className={styles.titleAccent}>Achats</span>
        </h1>
        
        <p className={styles.subtitle}>
          Consultez tous vos achats et paiements
        </p>
      </div>

      {/* Summary Cards */}
      <div className={styles.summarySection}>
        <div className={styles.summaryGrid}>
          <Card className={styles.summaryCard}>
            <CardContent>
              <div className={styles.summaryContent}>
                <div className={styles.summaryIcon}>
                  <CheckCircle />
                </div>
                <div className={styles.summaryInfo}>
                  <h3>Total des achats</h3>
                  <p>{allPurchases.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={styles.summaryCard}>
            <CardContent>
              <div className={styles.summaryContent}>
                <div className={styles.summaryIcon}>
                  <Euro />
                </div>
                <div className={styles.summaryInfo}>
                  <h3>Montant total</h3>
                  <p>{formatPrice(totalAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={styles.summaryCard}>
            <CardContent>
              <div className={styles.summaryContent}>
                <div className={styles.summaryIcon}>
                  <Clock />
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Purchase History */}
      <div className={styles.historySection}>
        <h2 className={styles.sectionTitle}>Historique détaillé</h2>
        
        {allPurchases.length === 0 ? (
          <Card className={styles.emptyCard}>
            <CardContent>
              <div className={styles.emptyContent}>
                <CreditCard className={styles.emptyIcon} />
                <h3>Aucun achat trouvé</h3>
                <p>Vous n'avez pas encore effectué d'achat.</p>
                <Link href="/client/billing">
                  <Button className={styles.emptyButton}>Voir les forfaits disponibles</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={styles.purchaseList}>
            {allPurchases.map((purchase, index) => (
              <Card key={`${purchase.type}-${purchase.id}`} className={styles.purchaseCard}>
                <CardContent>
                  <div className={styles.purchaseHeader}>
                    <div className={styles.purchaseInfo}>
                      <div className={styles.purchaseTitle}>
                        {getTierIcon(purchase.tier)}
                        <span>{purchase.displayName}</span>
                      </div>
                      <div className={styles.purchaseMeta}>
                        <span className={styles.purchaseDate}>
                          <Calendar className={styles.metaIcon} />
                          {formatDate(purchase.purchasedAt)}
                        </span>
                        <Badge variant="default" className={styles.historyBadge}>Acheté</Badge>
                      </div>
                    </div>
                    
                    <div className={styles.purchasePrice}>
                      {purchase.displayPrice}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Export Section */}
      {allPurchases.length > 0 && (
        <div className={styles.exportSection}>
          <Card className={styles.exportCard}>
            <CardContent>
              <div className={styles.exportContent}>
                <div className={styles.exportInfo}>
                  <h3>Exporter l'historique</h3>
                  <p>Téléchargez votre historique des achats au format CSV</p>
                </div>
                <Button variant="outline" className={styles.exportButton}>
                  <Download className={styles.exportIcon} />
                  Exporter CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


