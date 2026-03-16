import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export interface ServicePurchasePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
}

export const useStripe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (planId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/servicePurchases/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ planId })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe non disponible');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const getPlans = async (): Promise<ServicePurchasePlan[]> => {
    try {
      const response = await fetch('/api/servicePurchases/plans');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des plans');
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return [];
    }
  };

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/servicePurchases/verify-payment/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la vérification du paiement');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    }
  };

  return {
    createCheckoutSession,
    getPlans,
    verifyPayment,
    loading,
    error
  };
}; 