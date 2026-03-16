import { PrismaClient } from '@prisma/client';
import { setupPrismaHooks } from './prismaHooks';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient({
  //log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  log: ['error'], // Seulement les erreurs, pas les requêtes
});

// Configurer les hooks pour le nettoyage Firebase
setupPrismaHooks(prisma);

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
} 