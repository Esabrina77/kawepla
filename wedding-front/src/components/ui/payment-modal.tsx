import React from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { X, CreditCard, Shield, Clock } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  plan: {
    name: string;
    price: number;
    features: string[];
  };
  loading?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  plan,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
          <CardTitle className="text-xl font-bold text-center">
            Confirmer l'achat
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Plan Details */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Forfait {plan.name}
            </h3>
            <div className="mt-2">
              <span className="text-3xl font-bold text-purple-600">
                {plan.price}€
              </span>
              <span className="text-gray-500 ml-1">paiement unique</span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Inclus dans ce forfait :</h4>
            <ul className="space-y-1">
              {plan.features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Security Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Paiement sécurisé par Stripe</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Accès immédiat après paiement</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Redirection...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Procéder au paiement</span>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 