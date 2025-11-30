import { Router, RequestHandler } from 'express';
import { BookingController } from '@/controllers/bookingController';
import { authMiddleware } from '@/middleware/auth';

const router = Router();

// Routes protégées (prestataires authentifiés)
router.get('/', authMiddleware as RequestHandler, BookingController.getProviderBookings);
router.get('/stats', authMiddleware as RequestHandler, BookingController.getBookingStats);
router.get('/conversation/:conversationId', authMiddleware as RequestHandler, BookingController.getBookingByConversationId);
router.get('/:bookingId', authMiddleware as RequestHandler, BookingController.getBookingById);
router.put('/:bookingId/status', authMiddleware as RequestHandler, BookingController.updateBookingStatus);

// Route publique pour créer une réservation (depuis le site client)
router.post('/', BookingController.createBooking);

export default router;
