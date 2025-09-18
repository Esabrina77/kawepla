import express from 'express';
import { ServicePurchaseController } from '../controllers/subscriptionController';
import { authMiddleware } from '../middleware/auth';
import { getUserLimitsAndUsage } from '../middleware/subscriptionLimits';

const router = express.Router();

// Routes publiques
router.get('/plans', ServicePurchaseController.getPlans);
router.get('/additional-services', ServicePurchaseController.getAdditionalServices);
router.post('/webhook', ServicePurchaseController.handleWebhook);

// Routes protégées
router.post('/create-checkout-session', authMiddleware as any, ServicePurchaseController.createCheckoutSession as any);
router.post('/create-additional-service-checkout-session', authMiddleware as any, ServicePurchaseController.createAdditionalServiceCheckoutSession as any);
router.post('/confirm-payment', authMiddleware as any, ServicePurchaseController.confirmPayment as any);
router.get('/limits', authMiddleware as any, getUserLimitsAndUsage as any);
router.get('/active-purchases', authMiddleware as any, ServicePurchaseController.getActivePurchases as any);
router.post('/change-plan', authMiddleware as any, ServicePurchaseController.changePlan as any);
router.get('/purchase-history', authMiddleware as any, ServicePurchaseController.getPurchaseHistory as any);

export default router; 