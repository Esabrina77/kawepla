import express, { Application, Router, RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

// Import des routes principales
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import designRoutes from './routes/designs';
import invitationRoutes from './routes/invitations';
import guestRoutes from './routes/guests';
import rsvpRoutes from './routes/rsvp';
import { RSVPController } from './controllers/rsvpController';

// Import des middlewares
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware, requireAdmin, requireCouple } from './middleware/auth';

// Chargement des variables d'environnement
dotenv.config();

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
app.use(morgan('dev'));

/**
 * Middleware CORS
 * Autorise les requêtes cross-origin depuis le frontend (configurable via .env)
 */
app.use(cors({
  origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
  credentials: true,
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
 * Routes protégées pour les couples
 */
const coupleRouter: Router = express.Router();
coupleRouter.use(authMiddleware as RequestHandler, requireCouple as RequestHandler);

/**
 * Routes protégées pour les admins
 */
const adminRouter: Router = express.Router();
adminRouter.use(authMiddleware as RequestHandler, requireAdmin as RequestHandler);

// Routes utilisateur standard (authentifié)
app.use('/api/users/me', protectedRouter, userRoutes);

// Routes publiques protégées (nécessite authentification)
app.use('/api/designs', protectedRouter, designRoutes);

// Routes admin
app.use('/api/users', adminRouter, userRoutes);
app.use('/api/admin/designs', adminRouter, designRoutes);

// Routes couple
app.use('/api/invitations', coupleRouter, invitationRoutes);
app.use('/api/guests', coupleRouter, guestRoutes);

// Route RSVP protégée pour la liste des réponses
app.use('/api/invitations/:id/rsvps', coupleRouter, (req, res, next) => {
  RSVPController.list(req, res, next);
});

/**
 * Middleware de gestion des erreurs global
 * Capture toutes les erreurs non gérées et renvoie une réponse structurée.
 */
app.use(errorHandler);

export default app; 