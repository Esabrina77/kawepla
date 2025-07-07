import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

export type MockPrismaClient = DeepMockProxy<PrismaClient>;

// Mock de Prisma pour les tests
export const prismaMock = mockDeep<PrismaClient>();

// Réinitialiser tous les mocks avant chaque test
beforeEach(() => {
  mockReset(prismaMock);
});

// Mock du module prisma
jest.mock('../../lib/prisma', () => ({
  prisma: prismaMock
})); 