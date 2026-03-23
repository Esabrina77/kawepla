/**
 * Middleware global de gestion des erreurs pour Express.
 * Capture toutes les erreurs non gérées et renvoie une réponse structurée.
 */
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log de l'erreur côté serveur (utile en dev)
  console.error('Erreur capturée par le middleware global :', err);

  // Statut HTTP par défaut
  let status = err.statusCode || 500;

  // Message d'erreur par défaut
  let message = err.message || 'Erreur interne du serveur';

  // Gestion spécifique des erreurs de validation Zod
  if (err instanceof ZodError) {
    status = 400;
    // Concaténer les messages d'erreur de Zod pour un affichage propre
    message = err.errors.map(e => e.message).join(', ');
  }

  // Réponse structurée
  res.status(status).json({
    success: false,
    message,
    details: err.details || undefined,
  });
} 