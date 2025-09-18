import { Router, RequestHandler } from 'express';
import { ProviderController } from '@/controllers/providerController';
import { authMiddleware, requireAdmin } from '@/middleware/auth';
import { adminOnly } from '@/middleware/roleCheck';

const router = Router();

// Routes publiques (sans authentification)
router.get('/', ProviderController.getApprovedProviders);
router.get('/search-location', ProviderController.searchByLocation); // NOUVEAU V1: Recherche géolocalisée
router.get('/categories', ProviderController.getServiceCategories);

// Routes protégées (prestataires) - authentification requise
router.post('/profile', authMiddleware as RequestHandler, ProviderController.createProfile);
router.put('/profile', authMiddleware as RequestHandler, ProviderController.updateProfile);
router.get('/profile', authMiddleware as RequestHandler, ProviderController.getMyProfile);

// Routes pour les services
router.post('/services', authMiddleware as RequestHandler, ProviderController.createService);
router.get('/services', authMiddleware as RequestHandler, ProviderController.getMyServices);
router.put('/services/:serviceId', authMiddleware as RequestHandler, ProviderController.updateService);
router.delete('/services/:serviceId', authMiddleware as RequestHandler, ProviderController.deleteService);

// Routes admin seulement
router.get('/admin', authMiddleware as RequestHandler, requireAdmin as RequestHandler, ProviderController.getAllProviders);
router.put('/admin/:providerId/approve', authMiddleware as RequestHandler, requireAdmin as RequestHandler, ProviderController.approveProvider);
router.put('/admin/:providerId/reject', authMiddleware as RequestHandler, requireAdmin as RequestHandler, ProviderController.rejectProvider);
router.put('/admin/:providerId/suspend', authMiddleware as RequestHandler, requireAdmin as RequestHandler, ProviderController.suspendProvider);
router.delete('/admin/:providerId', authMiddleware as RequestHandler, requireAdmin as RequestHandler, ProviderController.deleteProvider);
router.get('/admin/stats', authMiddleware as RequestHandler, requireAdmin as RequestHandler, ProviderController.getStats);

export default router;
