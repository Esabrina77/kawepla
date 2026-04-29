import { PrismaClient, ServicePackType, ServiceTier } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Nettoyage radical des anciens packs...');
  
  try {
    // Suppression des relations avant de supprimer les packs
    // Note: On ne supprime pas l'historique d'achat réel par sécurité, 
    // mais on désactive tout ce qui pourrait gêner.
    await prisma.servicePack.updateMany({
      data: { isActive: false }
    });
    
    // Si on peut supprimer, on supprime
    await prisma.servicePack.deleteMany({
      where: {
        purchases: { none: {} },
        history: { none: {} },
        userAdditionalServices: { none: {} }
      }
    });
    console.log('✅ Anciens packs inutilisés supprimés. Les autres sont désactivés.');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }

  console.log('🚀 Création de la nouvelle Grille Stratégique...');

  const basePacks = [
    {
      slug: 'decouverte',
      name: 'Découverte',
      description: 'Idéal pour tester ou pour un petit événement intime.',
      type: ServicePackType.BASE,
      tier: ServiceTier.FREE,
      price: 0,
      currency: 'EUR',
      invitations: 1,
      guests: 50,
      photos: 200,
      aiRequests: 10,
      features: [
        '1 Événement inclus',
        '50 Invités maximum',
        '200 Photos dans l\'album',
        '10 Requêtes IA rédaction',
        'RSVP en ligne illimité',
        'Support standard'
      ],
      isActive: true,
      sortOrder: 1,
    },
    {
      slug: 'essentiel',
      name: 'Essentiel',
      description: 'Le choix parfait pour un mariage complet et serein.',
      type: ServicePackType.BASE,
      tier: ServiceTier.ESSENTIAL,
      price: 22,
      currency: 'EUR',
      invitations: 3,
      guests: 500,
      photos: 3000,
      aiRequests: 50,
      isHighlighted: true,
      isActive: true,
      features: [
        '3 Événements inclus',
        '500 Invités maximum',
        '3 000 Photos (Généreux)',
        '50 Requêtes IA rédaction',
        'Design personnalisé',
        'Support prioritaire'
      ],
      sortOrder: 2,
    },
    {
      slug: 'elegant',
      name: 'Élégant',
      description: 'Pour ceux qui voient grand et veulent une expérience premium.',
      type: ServicePackType.BASE,
      tier: ServiceTier.ELEGANT,
      price: 49,
      currency: 'EUR',
      invitations: 8,
      guests: 1500,
      photos: 10000,
      aiRequests: 150,
      isActive: true,
      features: [
        '8 Événements inclus',
        '1 500 Invités maximum',
        '10 000 Photos (Quasi illimité)',
        '150 Requêtes IA rédaction',
        'Accès premium anticipé',
        'Conseiller dédié'
      ],
      sortOrder: 3,
    },
    {
      slug: 'luxe',
      name: 'Luxe',
      description: 'L\'expérience ultime sans aucune limite pour vos événements.',
      type: ServicePackType.BASE,
      tier: ServiceTier.LUXE,
      price: 99,
      currency: 'EUR',
      invitations: 15,
      guests: 5000,
      photos: 25000,
      aiRequests: 500,
      isActive: true,
      features: [
        '15 Événements inclus',
        '5 000 Invités maximum',
        '25 000 Photos (Illimité)',
        '500 Requêtes IA rédaction',
        'Tout illimité',
        'Conciergerie VIP'
      ],
      sortOrder: 4,
    }
  ];

  const addonPacks = [
    // PHOTOS
    {
      slug: 'addon-photos-250',
      name: 'Pack 250 Photos',
      description: 'Ajoutez 250 photos supplémentaires à vos albums.',
      type: ServicePackType.ADDON,
      price: 9,
      photos: 250,
      unit: 'PHOTO',
      quantity: 250,
      isActive: true,
      sortOrder: 10,
    },
    {
      slug: 'addon-photos-1000',
      name: 'Pack 1 000 Photos',
      description: 'Ajoutez 1 000 photos supplémentaires à vos albums.',
      type: ServicePackType.ADDON,
      price: 19,
      photos: 1000,
      unit: 'PHOTO',
      quantity: 1000,
      isActive: true,
      sortOrder: 11,
    },
    // INVITES
    {
      slug: 'addon-guests-100',
      name: 'Pack 100 Invités',
      description: 'Ajoutez 100 invités supplémentaires à vos invitations.',
      type: ServicePackType.ADDON,
      price: 9,
      guests: 100,
      unit: 'GUEST',
      quantity: 100,
      isActive: true,
      sortOrder: 20,
    },
    {
      slug: 'addon-guests-500',
      name: 'Pack 500 Invités',
      description: 'Ajoutez 500 invités supplémentaires à vos invitations.',
      type: ServicePackType.ADDON,
      price: 19,
      guests: 500,
      unit: 'GUEST',
      quantity: 500,
      isActive: true,
      sortOrder: 21,
    },
    // IA
    {
      slug: 'addon-ai-25',
      name: 'Pack 25 Requêtes IA',
      description: 'Ajoutez 25 requêtes IA supplémentaires.',
      type: ServicePackType.ADDON,
      price: 5,
      aiRequests: 25,
      unit: 'AI_REQUEST',
      quantity: 25,
      isActive: true,
      sortOrder: 30,
    },
    {
      slug: 'addon-ai-100',
      name: 'Pack 100 Requêtes IA',
      description: 'Ajoutez 100 requêtes IA supplémentaires.',
      type: ServicePackType.ADDON,
      price: 15,
      aiRequests: 100,
      unit: 'AI_REQUEST',
      quantity: 100,
      isActive: true,
      sortOrder: 31,
    },
    // EVENEMENT
    {
      slug: 'addon-event-1',
      name: 'Événement Supplémentaire',
      description: 'Créez un événement supplémentaire (Mariage civil, brunch, etc.).',
      type: ServicePackType.ADDON,
      price: 9,
      invitations: 1,
      unit: 'INVITATION',
      quantity: 1,
      isActive: true,
      sortOrder: 40,
    },
    // TEST LIVE
    {
      slug: 'addon-test-live-1eur',
      name: 'Pack de Test (Live)',
      description: 'Pack à 1€ pour tester le paiement réel sur Stripe.',
      type: ServicePackType.ADDON,
      price: 1,
      photos: 10,
      unit: 'PHOTO',
      quantity: 10,
      isActive: true,
      sortOrder: 100,
    }
  ];

  // Upsert pour éviter les doublons sur les nouveaux slugs
  const allPacks = [...basePacks, ...addonPacks];
  
  for (const pack of allPacks) {
    console.log(`📦 Configuration du pack: ${pack.name}...`);
    await prisma.servicePack.upsert({
      where: { slug: pack.slug },
      update: pack,
      create: pack as any,
    });
  }

  console.log('✅ Base de données réinitialisée avec les bonnes unités !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la mise à jour:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
