/**
 * Middleware global de gestion des erreurs pour Express.
 * Capture toutes les erreurs non gérées et renvoie une réponse structurée.
 */
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log de l'erreur côté serveur (utile en dev)
  console.error('Erreur capturée par le middleware global :', err);

  // Statut HTTP par défaut
  const status = err.statusCode || 500;

  // Message d'erreur par défaut
  const message = err.message || 'Erreur interne du serveur';

  // Réponse structurée
  res.status(status).json({
    success: false,
    message,
    details: err.details || undefined,
  });
} 