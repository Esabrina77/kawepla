import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDesigns() {
  try {
    console.log('🧹 Suppression de tous les designs existants...');
    
    const result = await prisma.design.deleteMany({});
    
    console.log(`✅ ${result.count} designs supprimés avec succès`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des designs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDesigns(); 