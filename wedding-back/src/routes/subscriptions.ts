import express from 'express';
import { SubscriptionController } from '../controllers/subscriptionController';
import { authMiddleware } from '../middleware/auth';
import { getUserLimitsAndUsage } from '../middleware/subscriptionLimits';

const router = express.Router();

// Routes publiques
router.get('/plans', SubscriptionController.getPlans);
router.get('/additional-services', SubscriptionController.getAdditionalServices);
router.post('/webhook', SubscriptionController.handleWebhook);

// Routes protégées
router.post('/create-checkout-session', authMiddleware as any, SubscriptionController.createCheckoutSession as any);
router.post('/create-additional-service-checkout-session', authMiddleware as any, SubscriptionController.createAdditionalServiceCheckoutSession as any);
router.post('/confirm-payment', authMiddleware as any, SubscriptionController.confirmPayment as any);
router.get('/limits', authMiddleware as any, getUserLimitsAndUsage as any);
router.post('/change-plan', authMiddleware as any, SubscriptionController.changePlan as any);

export default router; 