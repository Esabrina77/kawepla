import { Router } from 'express';
import { GuestController, uploadMiddleware } from '../controllers/guestController';

const router = Router();

/**
 * @route   PATCH /api/guests/:id/profile-photo
 * @desc    Mettre à jour la photo de profil d'un invité
 * @access  Privé (authentifié)
 */
router.patch('/:id/profile-photo', GuestController.updateProfilePhoto);

/**
 * @route   POST /api/guests/:id/send-invitation
 * @desc    Envoyer une invitation par email à un invité
 * @access  Privé (authentifié)
 */
router.post('/:id/send-invitation', GuestController.sendInvitation);

/**
 * @route   POST /api/guests/:id/send-reminder
 * @desc    Envoyer un rappel à un invité
 * @access  Privé (authentifié)
 */
router.post('/:id/send-reminder', GuestController.sendReminder);

/**
 * @route   POST /api/guests/preview-import
 * @desc    Prévisualisation d'un fichier avant import
 * @access  Privé (authentifié)
 */
router.post('/preview-import', uploadMiddleware, GuestController.previewImport);

/**
 * @route   GET /api/guests/template/:format
 * @desc    Télécharger un template de fichier (csv, json, txt)
 * @access  Public
 */
router.get('/template/:format', GuestController.downloadTemplate);

export default router; 