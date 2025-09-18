import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient({
  //log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  log: ['error'], // Seulement les erreurs, pas les requêtes
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
} 