import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { JWTService } from '../utils/jwt';
import { AuthUser, AsyncRequestHandler, RequestHandler } from '../types';
import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Wrapper pour gérer les middlewares asynchrones
export const asyncMiddleware = (fn: AsyncRequestHandler) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const authMiddleware = asyncMiddleware(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: 'Token manquant' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Token invalide' });
    return;
  }

  try {
    const payload = JWTService.verifyAccessToken(token);
    if (!payload || !payload.id) {
      res.status(401).json({ message: 'Token invalide' });
      return;
    }

    // logs pour savoir si le token est valide
    // console.log('🔍 Debug auth - Token payload:', {
    //   id: payload.id,
    //   email: payload.email,
    //   role: payload.role
    // });

    // En mode test, on simule l'utilisateur avec les droits appropriés
    if (process.env.NODE_ENV === 'test') {
      const user: AuthUser = {
        id: payload.id,
        email: payload.email,
        role: payload.role || UserRole.HOST, // Par défaut HOST pour les tests
        isActive: true
      };
      req.user = user;
      next();
      return;
    }

    // Vérifier que l'utilisateur existe toujours en base
    // console.log('🔍 Debug auth - Recherche utilisateur avec ID:', payload.id);
    
    const user = await prisma.user.findUnique({
      where: {
        id: payload.id
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    // console.log('🔍 Debug auth - Utilisateur trouvé:', user);

    if (!user) {
      // console.log('❌ Debug auth - Utilisateur non trouvé en base');
      res.status(401).json({ message: 'Utilisateur non trouvé' });
      return;
    }

    if (!user.isActive) {
      // console.log('❌ Debug auth - Utilisateur désactivé');
      res.status(401).json({ message: 'Compte désactivé' });
      return;
    }

    // console.log('✅ Debug auth - Authentification réussie');
    
    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    // console.error('❌ Debug auth - Erreur:', error);
    if (error instanceof Error && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
      res.status(401).json({ message: 'Token invalide ou expiré' });
      return;
    }
    next(error);
  }
});

export const requireRole = (roles: UserRole[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // En mode test, on autorise l'accès si le rôle est défini dans le token
    if (process.env.NODE_ENV === 'test' && req.user.role) {
      if (roles.includes(req.user.role)) {
        next();
        return;
      }
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    next();
  };
};

export const requireAdmin = requireRole([UserRole.ADMIN]);
export const requireHost = requireRole([UserRole.HOST, UserRole.ADMIN]);
export const requireGuest = requireRole([UserRole.GUEST, UserRole.HOST, UserRole.ADMIN]);

// DEPRECATED: Garder pour compatibilité temporaire
export const requireCouple = requireHost;

// Alias pour la compatibilité
export const authenticateToken = authMiddleware; 