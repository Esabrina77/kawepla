import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { prisma } from '../lib/prisma';

// Charger les variables d'environnement depuis .env
config();

// Définir les variables d'environnement par défaut pour les tests
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

// Configuration globale pour les tests
beforeAll(async () => {
  // Assurez-vous que nous utilisons la base de données de test
  process.env['DATABASE_URL'] = process.env['TEST_DATABASE_URL'];
  // Nettoyer la base de données avant tous les tests
  await prisma.rSVP.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.design.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});

// Nettoyage après chaque test
afterEach(async () => {
  const prisma = new PrismaClient();
  // Nettoyer toutes les tables après chaque test
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
      } catch (error) {
        console.log({ error });
      }
    }
  }

  await prisma.$disconnect();
});

// Configuration globale de Jest
jest.setTimeout(10000);

// Nettoyer les mocks après chaque test
afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  // Fermer la connexion Prisma après tous les tests
  await prisma.$disconnect();
}); 