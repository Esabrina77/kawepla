import { prisma } from '../lib/prisma';

async function checkInvitationId() {
  try {
    const invitation = await prisma.invitation.findUnique({
      where: { id: 'cmfl2vml40001tx2k4bvah9d1' }
    });
    
    console.log('Invitation trouvée:', invitation ? 'OUI' : 'NON');
    if (invitation) {
      console.log('ID:', invitation.id);
      console.log('Title:', invitation.eventTitle);
      console.log('Status:', invitation.status);
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInvitationId();
