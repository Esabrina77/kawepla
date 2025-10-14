import { prisma } from '../lib/prisma';

async function updateUserRole() {
  try {
    const user = await prisma.user.update({
      where: { email: 'sabrinaeloundou33@gmail.com' },
      data: { role: 'ADMIN' }
    });
    
    console.log('✅ Rôle utilisateur mis à jour:');
    console.log('Email:', user.email);
    console.log('Nouveau rôle:', user.role);
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();
