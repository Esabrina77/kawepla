// app.ts

import dotenv from 'dotenv';

// Chargement des variables d'environnement
dotenv.config();

import express, { Application, Router, RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { generalRateLimiter } from './middleware/rateLimiter';

// Import des routes principales
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import designRoutes from './routes/designs';
import invitationRoutes from './routes/invitations';
import guestRoutes from './routes/guests';
import rsvpRoutes from './routes/rsvp';
import { RSVPController } from './controllers/rsvpController';
import { UserController } from './controllers/userController';
import messageRoutes from './routes/messages';
import shareableInvitationRoutes from './routes/shareableInvitation';
import photoAlbumRoutes from './routes/photoAlbums';
import subscriptionRoutes from './routes/subscriptions';
import pushRoutes from './routes/push';
import providerRoutes from './routes/providerRoutes';
import bookingRoutes from './routes/bookings';
import providerConversationRoutes from './routes/providerConversations';
import newsletterRoutes from './routes/newsletterRoutes';
import todoRoutes from './routes/todos';
import aiRoutes from './routes/ai';
import adminServicePackRoutes from './routes/adminServicePacks';
import adminInvitationRoutes from './routes/adminInvitations';
import fetch from 'node-fetch';

// Import des middlewares
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware, requireAdmin, requireCouple } from './middleware/auth';

// Création de l'application Express
const app: Application = express();

/**
 * Sécurité HTTP avec Helmet
 * Helmet aide à sécuriser Express en configurant divers en-têtes HTTP.
 */
app.use(helmet());

/**
 * Compression des réponses HTTP
 * Réduit la taille des réponses pour améliorer les performances réseau.
 */
app.use(compression());

/**
 * Logger HTTP avec Morgan
 * Affiche les requêtes entrantes dans la console (utile en dev).
 */
app.use(morgan('combined', {
  skip: (req, res) => {
    // Ignorer les requêtes OPTIONS et les requêtes de santé
    return req.method === 'OPTIONS' || req.path === '/health';
  }
}));

/**
 * Middleware CORS
 * Autorise les requêtes cross-origin depuis le frontend (configurable via .env)
 */
const allowedOrigins = [
  'http://localhost:3012',
  'https://kawepla.kaporelo.com',
  'https://kawepla-api.kaporelo.com',
  'https://kaweplay-api.kaporelo.com',
];

app.use(cors({
  origin: (origin, callback) => {
    // Permettre les requêtes sans origin (ex: mobile apps, Postman)
    if (!origin) return callback(null, true);

    // Permettre tous les sous-domaines de kaporelo.com
    if (origin.endsWith('.kaporelo.com') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

/**
 * Parsing JSON et urlencoded
 * Permet de lire les corps de requête en JSON ou en format formulaire.
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Rate Limiting général pour toutes les routes API
 * Appliqué après le parsing mais avant les routes spécifiques
 * Les routes spécifiques peuvent avoir leurs propres rate limiters plus stricts
 */
app.use('/api', generalRateLimiter as RequestHandler);

/**
 * Routes publiques (sans authentification)
 */
app.use('/api/auth', authRoutes);

// Routes RSVP publiques
app.use('/api/rsvp', rsvpRoutes);

// Proxy image pour contourner les blocages CORS (pour generation PDF/Images)
app.get('/api/proxy/image', (async (req, res) => {
  const url = req.query.url as string;
  if (!url) return res.status(400).send('No URL provided');
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(`Proxy image error for URL [${url}]:`, err);
    res.status(500).send(`Error fetching image: ${url}`);
  }
}) as RequestHandler);

/**
 * Routes protégées (avec authentification)
 */
const protectedRouter: Router = express.Router();
protectedRouter.use(authMiddleware as RequestHandler);

/**
 * Routes protégées pour les organisateurs d'événements (anciennement couples)
 */
const hostRouter: Router = express.Router();
hostRouter.use(authMiddleware as RequestHandler, requireCouple as RequestHandler); // Garder requireCouple temporairement pour compatibilité

/**
 * Routes protégées pour les admins
 */
const adminRouter: Router = express.Router();
adminRouter.use(authMiddleware as RequestHandler, requireAdmin as RequestHandler);

// Routes admin designs - AVANT /api/admin pour éviter les conflits
app.use('/api/admin/designs', adminRouter, designRoutes);

// Routes admin service-packs - AVANT /api/admin pour éviter les conflits
app.use('/api/admin/service-packs', adminRouter, adminServicePackRoutes);

// Routes admin invitations
app.use('/api/admin/invitations', adminRouter, adminInvitationRoutes);

// Routes admin users - utilise le système de routes modulaire
app.use('/api/admin', adminRouter, userRoutes);

// Routes utilisateur standard (authentifié) - AVANT /api/users pour priorité
// Créer un router séparé pour /me pour éviter les conflits avec /api/users
const userMeRouter = Router();
userMeRouter.get('/', UserController.getProfile as RequestHandler);
userMeRouter.patch('/', UserController.updateProfile as RequestHandler);
userMeRouter.delete('/', UserController.deleteProfile as RequestHandler);
app.use('/api/users/me', protectedRouter, userMeRouter);

// Routes publiques protégées (nécessite authentification)
app.use('/api/designs', protectedRouter, designRoutes);

// Routes admin users - APRÈS /api/users/me pour éviter les conflits
app.use('/api/users', adminRouter, userRoutes);


// Routes couple/host (legacy)
app.use('/api/invitations', hostRouter, invitationRoutes);
app.use('/api/guests', hostRouter, guestRoutes);

//MESSAGES
app.use('/api/messages', messageRoutes);

// Routes pour les albums photos
app.use('/api/photos', photoAlbumRoutes);

// Routes pour les abonnements
app.use('/api/subscriptions', subscriptionRoutes);

// Routes push (clé VAPID publique, subscription avec auth)
app.use('/api/push', pushRoutes);

// Routes pour les liens partageables
app.use('/api/invitations', hostRouter, shareableInvitationRoutes);

// Routes provider publiques ET protégées (le router gère l'authentification en interne)
app.use('/api/providers', providerRoutes);

// Routes pour les réservations
app.use('/api/bookings', bookingRoutes);

// Routes pour les conversations client-provider
app.use('/api/provider-conversations', providerConversationRoutes);

// Routes pour les newsletters (admin seulement)
app.use('/api/newsletters', newsletterRoutes);

// Routes pour les tâches (todos)
app.use('/api/todos', protectedRouter, todoRoutes);

// Routes pour l'IA (Gemini)
app.use('/api/ai', protectedRouter, aiRoutes);

// Route de nettoyage (pour les tests et maintenance)
app.post('/api/admin/cleanup', authMiddleware as RequestHandler, requireAdmin as RequestHandler, async (req, res) => {
  try {
    const { CleanupJobs } = await import('./jobs/cleanupJobs');
    const results = await CleanupJobs.runAllCleanupJobs();
    res.json({ success: true, results });
  } catch (error) {
    console.error('Erreur cleanup admin:', error);
    res.status(500).json({ success: false, error: 'Erreur lors du nettoyage' });
  }
});

// Routes pour les messages RSVP des couples - routes spécifiques
const rsvpMessagesRouter = express.Router();
rsvpMessagesRouter.get('/rsvp-messages', UserController.getRSVPMessages as any);
rsvpMessagesRouter.put('/rsvp-messages/:rsvpId/read', UserController.markRSVPMessageAsRead as any);
app.use('/api/rsvp-messages', hostRouter, rsvpMessagesRouter);

// Route RSVP protégée pour la liste des réponses
app.use('/api/invitations/:id/rsvps', hostRouter, (req, res, next) => {
  RSVPController.list(req, res, next);
});

/**
 * Middleware de gestion des erreurs global
 */
app.use(errorHandler);

/**
 * Jobs de maintenance automatique (Newsletter & Cleanup)
 */
let cleanupInterval: NodeJS.Timeout | null = null;
let newsletterInterval: NodeJS.Timeout | null = null;

const startMaintenanceJobs = () => {
  if (cleanupInterval) clearInterval(cleanupInterval);
  if (newsletterInterval) clearInterval(newsletterInterval);

  /* 1. Jobs de nettoyage (Toutes les 5 minutes) - Désactivé car liens stables/permanents
  cleanupInterval = setInterval(async () => {
    try {
      const { CleanupJobs } = await import('./jobs/cleanupJobs');
      await CleanupJobs.runAllCleanupJobs();
    } catch (error) {
      console.error('❌ Erreur lors du cleanup automatique:', error);
    }
  }, 5 * 60 * 1000);
  */

  // 2. Jobs de Newsletter (Toutes les 1 minute)
  newsletterInterval = setInterval(async () => {
    try {
      const { NewsletterJobs } = await import('./jobs/newsletterJobs');
      await NewsletterJobs.processScheduledNewsletters();
    } catch (error) {
      console.error('❌ Erreur lors du job newsletter:', error);
    }
  }, 60 * 1000);

  // Exécution initiale après 10 secondes
  setTimeout(async () => {
    try {
      // const { CleanupJobs } = await import('./jobs/cleanupJobs');
      const { NewsletterJobs } = await import('./jobs/newsletterJobs');
      // await CleanupJobs.runAllCleanupJobs();
      await NewsletterJobs.processScheduledNewsletters();
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution initiale des jobs:', error);
    }
  }, 10000);

  console.log('🔄 Maintenance: Jobs automatiques démarrés (Cleanup 5m, Newsletter 1m)');
};

// Démarrer les jobs
startMaintenanceJobs();

export default app;