import { prisma } from '../src/lib/prisma';
import { GuestService } from '../src/services/guestService';

async function migrate() {
  console.log('🚀 Début de la migration des codes d\'accès...');
  
  const guests = await prisma.guest.findMany({
    where: {
      albumAccessCode: null
    }
  });

  console.log(`🔍 ${guests.length} invités sans code trouvés.`);

  let count = 0;
  for (const guest of guests) {
    const code = await GuestService.generateUniqueAccessCode(guest.invitationId);
    await prisma.guest.update({
      where: { id: guest.id },
      data: { albumAccessCode: code }
    });
    count++;
    if (count % 10 === 0) console.log(`⏳ ${count}/${guests.length} traités...`);
  }

  console.log(`✅ Terminé ! ${count} invités mis à jour.`);
}

migrate()
  .catch(err => {
    console.error('❌ Erreur lors de la migration:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
