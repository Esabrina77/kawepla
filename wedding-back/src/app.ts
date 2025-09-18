// app.ts

import dotenv from 'dotenv';

// Chargement des variables d'environnement
dotenv.config();

import express, { Application, Router, RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

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
import newsletterRoutes from './routes/newsletterRoutes';

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
  'https://kapescape.kaporelo.com',
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
 * Routes publiques (sans authentification)
 */
app.use('/api/auth', authRoutes);

// Routes RSVP publiques
app.use('/api/rsvp', rsvpRoutes);

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

// Routes admin users - utilise le système de routes modulaire
app.use('/api/admin', adminRouter, userRoutes);

// Routes utilisateur standard (authentifié)
app.use('/api/users/me', protectedRouter, userRoutes);

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

// Routes pour les newsletters (admin seulement)
app.use('/api/newsletters', newsletterRoutes);

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
 * Capture toutes les erreurs non gérées et renvoie une réponse structurée.
 */
app.use(errorHandler);

/**
 * Jobs de nettoyage automatique
 * Nettoie les liens partageables expirés toutes les 5 minutes
 */
let cleanupInterval: NodeJS.Timeout | null = null;

const startCleanupJobs = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
  
  // Exécuter immédiatement au démarrage
  setTimeout(async () => {
    try {
      const { CleanupJobs } = await import('./jobs/cleanupJobs');
      await CleanupJobs.runAllCleanupJobs();
    } catch (error) {
      console.error('❌ Erreur lors du cleanup initial:', error);
    }
  }, 10000); // Attendre 10 secondes après le démarrage
  
  // Puis exécuter toutes les 5 minutes
  cleanupInterval = setInterval(async () => {
    try {
      const { CleanupJobs } = await import('./jobs/cleanupJobs');
      await CleanupJobs.runAllCleanupJobs();
    } catch (error) {
      console.error('❌ Erreur lors du cleanup automatique:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes
  
  console.log('🔄 Jobs de nettoyage automatique démarrés (toutes les 5 minutes)');
};

// Démarrer les jobs de nettoyage
startCleanupJobs();

export default app;