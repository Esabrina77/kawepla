/**
 * Script de migration pour transférer les anciens shareableToken 
 * de la table Invitation vers la nouvelle table ShareableLink
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateShareableLinks() {
  console.log('🔄 Migration des liens partageables...');

  try {
    // Récupérer toutes les invitations avec un shareableToken
    const invitationsWithTokens = await prisma.invitation.findMany({
      where: {
        shareableToken: {
          not: null
        },
        shareableEnabled: true
      },
      select: {
        id: true,
        shareableToken: true,
        shareableMaxUses: true,
        shareableUsedCount: true,
        shareableExpiresAt: true
      }
    });

    console.log(`📊 ${invitationsWithTokens.length} invitation(s) avec des liens partageables trouvée(s)`);

    if (invitationsWithTokens.length === 0) {
      console.log('✅ Aucune migration nécessaire');
      return;
    }

    // Migrer chaque token vers la nouvelle table
    for (const invitation of invitationsWithTokens) {
      try {
        // Créer l'entrée dans ShareableLink
        await prisma.shareableLink.create({
          data: {
            token: invitation.shareableToken!,
            isActive: true,
            maxUses: invitation.shareableMaxUses || 50,
            usedCount: invitation.shareableUsedCount || 0,
            expiresAt: invitation.shareableExpiresAt,
            invitationId: invitation.id
          }
        });

        console.log(`✅ Migré le lien de l'invitation ${invitation.id}`);

      } catch (error) {
        // Si le token existe déjà (migration déjà faite), ignorer l'erreur
        if (error instanceof Error && error.message.includes('Unique constraint')) {
          console.log(`⏭️  Lien déjà migré pour l'invitation ${invitation.id}`);
        } else {
          console.error(`❌ Erreur lors de la migration de l'invitation ${invitation.id}:`, error);
        }
      }
    }

    console.log('🎉 Migration terminée avec succès !');
    console.log('ℹ️  Les anciens champs shareableToken dans la table Invitation peuvent maintenant être supprimés lors d\'une prochaine migration');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
}

// Exécuter la migration si le script est lancé directement
if (require.main === module) {
  migrateShareableLinks()
    .then(() => {
      console.log('✅ Migration terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Échec de la migration:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { migrateShareableLinks }; 