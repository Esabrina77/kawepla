/**
 * Script de migration pour mettre à jour les données d'invitation existantes
 * avec les nouveaux champs eventTitle, eventDate, eventType
 */
import { prisma } from '../lib/prisma';

async function migrateInvitationData() {
  console.log('🔄 Début de la migration des données d\'invitation...');

  try {
    // Récupérer toutes les invitations qui n'ont pas eventTitle
    const invitations = await prisma.invitation.findMany({
      where: {
        OR: [
          { eventTitle: null },
          { eventTitle: '' },
          { eventDate: null },
          { eventType: null }
        ]
      }
    });

    console.log(`📊 ${invitations.length} invitations à migrer`);

    for (const invitation of invitations) {
      const updates: any = {};

      // Si eventTitle est manquant, utiliser un titre par défaut
      if (!invitation.eventTitle || invitation.eventTitle === '') {
        updates.eventTitle = `Invitation ${invitation.id.slice(-6)}`;
      }

      // Si eventDate est manquant, utiliser la date de création
      if (!invitation.eventDate) {
        updates.eventDate = invitation.createdAt;
      }

      // Si eventType est manquant, utiliser WEDDING par défaut
      if (!invitation.eventType) {
        updates.eventType = 'WEDDING';
      }

      // Mettre à jour l'invitation
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: updates
      });

      console.log(`✅ Invitation ${invitation.id} migrée`);
    }

    console.log('🎉 Migration terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migrateInvitationData();
