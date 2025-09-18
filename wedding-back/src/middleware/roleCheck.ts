import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  
  if (!user) {
    res.status(401).json({
      message: 'Utilisateur non authentifié'
    });
    return;
  }

  if (user.role !== 'ADMIN') {
    res.status(403).json({
      message: 'Accès refusé. Droits administrateur requis.'
    });
    return;
  }

  next();
};

export const providerOnly = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  
  if (!user) {
    res.status(401).json({
      message: 'Utilisateur non authentifié'
    });
    return;
  }

  if (user.role !== 'PROVIDER') {
    res.status(403).json({
      message: 'Accès refusé. Droits prestataire requis.'
    });
    return;
  }

  next();
};

export const hostOnly = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  
  if (!user) {
    res.status(401).json({
      message: 'Utilisateur non authentifié'
    });
    return;
  }

  if (user.role !== 'HOST') {
    res.status(403).json({
      message: 'Accès refusé. Droits organisateur d\'événement requis.'
    });
    return;
  }

  next();
};

// DEPRECATED: Garder pour compatibilité temporaire
export const coupleOnly = hostOnly;

export const hasRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    
    if (!user) {
      res.status(401).json({
        message: 'Utilisateur non authentifié'
      });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({
        message: `Accès refusé. Rôles autorisés: ${roles.join(', ')}`
      });
      return;
    }

    next();
  };
};
