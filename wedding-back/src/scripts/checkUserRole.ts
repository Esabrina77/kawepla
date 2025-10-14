import { prisma } from '../lib/prisma';

async function checkUserRole() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'sabrinaeloundou33@gmail.com' }
    });
    
    console.log('Utilisateur trouvé:', user ? 'OUI' : 'NON');
    if (user) {
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Rôle:', user.role);
      console.log('Prénom:', user.firstName);
      console.log('Nom:', user.lastName);
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRole();
