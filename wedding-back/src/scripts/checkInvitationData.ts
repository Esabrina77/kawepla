/**
 * Script pour vérifier les données d'invitation dans la base
 */
import { prisma } from '../lib/prisma';

async function checkInvitationData() {
  console.log('🔍 Vérification des données d\'invitation...');

  try {
    const invitations = await prisma.invitation.findMany({
      take: 3,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        _count: {
          select: {
            guests: true,
            rsvps: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 ${invitations.length} invitations trouvées:`);
    
    invitations.forEach((invitation, index) => {
      console.log(`\n--- Invitation ${index + 1} ---`);
      console.log(`ID: ${invitation.id}`);
      console.log(`eventTitle: "${invitation.eventTitle}"`);
      console.log(`eventDate: ${invitation.eventDate}`);
      console.log(`eventType: ${invitation.eventType}`);
      console.log(`location: "${invitation.location}"`);
      console.log(`status: ${invitation.status}`);
      console.log(`createdAt: ${invitation.createdAt}`);
      console.log(`user: ${invitation.user.firstName} ${invitation.user.lastName} (${invitation.user.email})`);
      console.log(`guests: ${invitation._count.guests}, rsvps: ${invitation._count.rsvps}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInvitationData();
