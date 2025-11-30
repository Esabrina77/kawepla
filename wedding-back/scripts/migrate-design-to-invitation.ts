import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateDesignToInvitation() {
  console.log('🔄 Migration des packs "Design premium supplémentaire" vers "Invitation supplémentaire"...\n');

  try {
    // Trouver tous les packs avec unit = 'DESIGN'
    const designPacks = await prisma.servicePack.findMany({
      where: {
        unit: 'DESIGN',
        slug: {
          contains: 'design'
        }
      }
    });

    console.log(`📦 ${designPacks.length} pack(s) "Design" trouvé(s)`);

    for (const pack of designPacks) {
      console.log(`\n🔄 Mise à jour du pack: ${pack.name} (${pack.slug})`);
      
      // Vérifier si le nouveau slug existe déjà
      const existingInvitationPack = await prisma.servicePack.findUnique({
        where: { slug: 'addon-invitation' }
      });

      if (existingInvitationPack && existingInvitationPack.id !== pack.id) {
        // Si le nouveau pack existe déjà, supprimer l'ancien pack et migrer ses données
        console.log(`  ⚠️  Le pack "addon-invitation" existe déjà, migration des données...`);
        
        // Migrer les UserAdditionalService vers le nouveau pack
        await prisma.userAdditionalService.updateMany({
          where: { servicePackId: pack.id },
          data: { servicePackId: existingInvitationPack.id, type: 'INVITATION' }
        });

        // Migrer les PurchaseHistory vers le nouveau pack
        await prisma.purchaseHistory.updateMany({
          where: { servicePackId: pack.id },
          data: { servicePackId: existingInvitationPack.id }
        });

        // Supprimer l'ancien pack
        await prisma.servicePack.delete({
          where: { id: pack.id }
        });

        console.log(`  ✅ Ancien pack supprimé, données migrées vers le nouveau pack`);
      } else {
        // Mettre à jour le pack existant
        await prisma.servicePack.update({
          where: { id: pack.id },
          data: {
            unit: 'INVITATION',
            name: 'Invitation supplémentaire',
            description: 'Créez un événement supplémentaire',
            features: ['+1 événement'],
            slug: 'addon-invitation'
          }
        });

        console.log(`  ✅ Pack mis à jour: unit=INVITATION, name="Invitation supplémentaire"`);
      }
    }

    // Mettre à jour les UserAdditionalService existants
    const designServices = await prisma.userAdditionalService.findMany({
      where: {
        type: 'DESIGN'
      },
      include: {
        servicePack: true
      }
    });

    console.log(`\n📦 ${designServices.length} service(s) "DESIGN" trouvé(s) dans user_additional_services`);

    for (const service of designServices) {
      if (service.servicePack && service.servicePack.unit === 'DESIGN') {
        // Mettre à jour le type du service
        await prisma.userAdditionalService.update({
          where: { id: service.id },
          data: {
            type: 'INVITATION'
          }
        });
        console.log(`  ✅ Service ${service.id} mis à jour: type=INVITATION`);
      }
    }

    console.log('\n✅ Migration terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateDesignToInvitation();

