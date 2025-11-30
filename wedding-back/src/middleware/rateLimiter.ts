import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limiter général pour toutes les routes API
 * Limite : 2000 requêtes par 15 minutes par IP
 * Augmenté pour supporter l'usage intensif d'une SPA (Single Page App)
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // ~2 requêtes/seconde en moyenne, suffisant pour une navigation fluide
  message: {
    error: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    if ((req as any).user?.id) {
      return `user:${(req as any).user.id}`;
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard.',
      retryAfter: '15 minutes'
    });
  },
  skip: (req: Request) => {
    return ['SUPER_ADMIN', 'ADMIN'].includes((req as any).user?.role);
  }
});

/**
 * Rate limiter strict pour les routes d'authentification
 * Limite : 15 tentatives par 15 minutes par IP
 * Sécurité : Suffisant pour bloquer le brute-force tout en tolérant les erreurs de saisie
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Tolérance pour les oublis de mot de passe / erreurs de frappe
  message: {
    error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
      retryAfter: '15 minutes',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    });
  },
  skip: () => false
});

/**
 * Rate limiter pour les routes de création/modification
 * Limite : 200 requêtes par 15 minutes par utilisateur/IP
 * UX : Permet l'édition intensive et l'auto-save sans blocage
 */
export const createRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Large pour permettre l'édition rapide et les sauvegardes automatiques
  message: {
    error: 'Trop de requêtes de création. Veuillez réessayer plus tard.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    if ((req as any).user?.id) {
      return `create:user:${(req as any).user.id}`;
    }
    return `create:ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Trop de requêtes de création. Veuillez réessayer plus tard.',
      retryAfter: '15 minutes'
    });
  },
  skip: (req: Request) => {
    return ['SUPER_ADMIN', 'ADMIN'].includes((req as any).user?.role);
  }
});

/**
 * Rate limiter pour les routes AI (Gemini)
 * Limite : 30 requêtes par minute par utilisateur
 * Équilibre : Permet de générer plusieurs variantes sans exploser les coûts API
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 1 requête toutes les 2 secondes
  message: {
    error: 'Trop de requêtes IA. Veuillez patienter avant de réessayer.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    if ((req as any).user?.id) {
      return `ai:user:${(req as any).user.id}`;
    }
    return `ai:ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Trop de requêtes IA. Veuillez patienter avant de réessayer.',
      retryAfter: '1 minute',
      code: 'AI_RATE_LIMIT_EXCEEDED'
    });
  },
  skip: (req: Request) => {
    return ['SUPER_ADMIN', 'ADMIN'].includes((req as any).user?.role);
  }
});

/**
 * Rate limiter pour les routes de recherche
 * Limite : 100 requêtes par minute par IP
 * UX : Permet la recherche "as-you-type" (instantanée)
 */
export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Suffisant pour de la recherche instantanée
  message: {
    error: 'Trop de recherches. Veuillez patienter avant de réessayer.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    if ((req as any).user?.id) {
      return `search:user:${(req as any).user.id}`;
    }
    return `search:ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Trop de recherches. Veuillez patienter avant de réessayer.',
      retryAfter: '1 minute'
    });
  },
  skip: (req: Request) => {
    return ['SUPER_ADMIN', 'ADMIN'].includes((req as any).user?.role);
  }
});

/**
 * Rate limiter pour les routes publiques (RSVP, partage)
 * Limite : 300 requêtes par 15 minutes par IP
 * Sécurité : Bloque le spam massif tout en autorisant les usages légitimes (ex: WiFi partagé lors d'un événement)
 */
export const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Permet à ~20-30 personnes sur le même WiFi de répondre simultanément
  message: {
    error: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard.',
      retryAfter: '15 minutes'
    });
  },
  skip: () => false
});

