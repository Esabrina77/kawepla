/**
 * Script pour initialiser les packs de service convenus
 * 
 * Usage: npm run seed:service-packs
 * ou: ts-node -r tsconfig-paths/register scripts/seed-service-packs.ts
 */

/// <reference types="node" />

import { ServicePackService } from '../src/services/servicePackService';
import { ServicePackType, ServiceTier } from '@prisma/client';
import { prisma } from '../src/lib/prisma';

const BASE_PACKS = [
  {
    slug: 'decouverte',
    name: 'Découverte',
    description: 'Parfait pour tester',
    type: ServicePackType.BASE,
    tier: ServiceTier.FREE,
    price: 0,
    currency: 'EUR',
    features: [
      '1 invitation personnalisable',
      'Jusqu\'à 25 invités',
      'RSVP basique',
      '1 design standard',
      '3 requêtes IA',
      'Support communautaire'
    ],
    invitations: 1,
    guests: 25,
    photos: 20,
    designs: 1,
    aiRequests: 3,
    isHighlighted: false,
    sortOrder: 1
  },
  {
    slug: 'essentiel',
    name: 'Essentiel',
    description: 'Pour les petits mariages',
    type: ServicePackType.BASE,
    tier: ServiceTier.ESSENTIAL,
    price: 25,
    currency: 'EUR',
    features: [
      '2 invitations personnalisables',
      'Jusqu\'à 60 invités',
      'RSVP avec préférences alimentaires',
      '5 designs premium',
      'Album photos (50 photos max)',
      '15 requêtes IA',
      'Support email'
    ],
    invitations: 2,
    guests: 60,
    photos: 50,
    designs: 5,
    aiRequests: 15,
    isHighlighted: false,
    sortOrder: 2
  },
  {
    slug: 'elegant',
    name: 'Élégant',
    description: 'Le plus populaire',
    type: ServicePackType.BASE,
    tier: ServiceTier.ELEGANT,
    price: 49,
    currency: 'EUR',
    features: [
      '3 invitations personnalisables',
      'Jusqu\'à 120 invités',
      'RSVP complet + messages',
      '10 designs premium',
      'Album photos (150 photos max)',
      'QR codes personnalisés',
      '40 requêtes IA',
      'Support prioritaire'
    ],
    invitations: 3,
    guests: 120,
    photos: 150,
    designs: 10,
    aiRequests: 40,
    isHighlighted: true,
    sortOrder: 3
  },
  {
    slug: 'luxe',
    name: 'Luxe',
    description: 'L\'expérience complète',
    type: ServicePackType.BASE,
    tier: ServiceTier.LUXE,
    price: 99,
    currency: 'EUR',
    features: [
      '5 invitations personnalisables',
      'Jusqu\'à 250 invités',
      'Album photos (500 photos max)',
      'Tous les designs + personnalisations',
      '100 requêtes IA',
      'Accès bêta aux nouvelles fonctionnalités'
    ],
    invitations: 5,
    guests: 250,
    photos: 500,
    designs: 50,
    aiRequests: 100,
    isHighlighted: false,
    sortOrder: 4
  }
];

const ADDON_PACKS = [
  {
    slug: 'addon-guests-25',
    name: 'Pack 25 invités',
    description: 'Ajoutez 25 invités supplémentaires à votre forfait',
    type: ServicePackType.ADDON,
    tier: null,
    price: 10,
    currency: 'EUR',
    features: ['+25 invités'],
    quantity: 25,
    unit: 'GUEST',
    isHighlighted: false,
    sortOrder: 10
  },
  {
    slug: 'addon-guests-50',
    name: 'Pack 50 invités',
    description: 'Ajoutez 50 invités supplémentaires à votre forfait',
    type: ServicePackType.ADDON,
    tier: null,
    price: 20,
    currency: 'EUR',
    features: ['+50 invités'],
    quantity: 50,
    unit: 'GUEST',
    isHighlighted: false,
    sortOrder: 11
  },
  {
    slug: 'addon-photos-50',
    name: 'Pack 50 photos',
    description: 'Ajoutez 50 photos supplémentaires à votre album',
    type: ServicePackType.ADDON,
    tier: null,
    price: 12,
    currency: 'EUR',
    features: ['+50 photos'],
    quantity: 50,
    unit: 'PHOTO',
    isHighlighted: false,
    sortOrder: 12
  },
  {
    slug: 'addon-photos-100',
    name: 'Pack 100 photos',
    description: 'Ajoutez 100 photos supplémentaires à votre album',
    type: ServicePackType.ADDON,
    tier: null,
    price: 20,
    currency: 'EUR',
    features: ['+100 photos'],
    quantity: 100,
    unit: 'PHOTO',
    isHighlighted: false,
    sortOrder: 13
  },
  {
    slug: 'addon-ia-10',
    name: 'Pack 10 requêtes IA',
    description: 'Ajoutez 10 requêtes IA supplémentaires à votre forfait',
    type: ServicePackType.ADDON,
    tier: null,
    price: 4,
    currency: 'EUR',
    features: ['+10 requêtes IA'],
    quantity: 10,
    unit: 'AI_REQUEST',
    isHighlighted: false,
    sortOrder: 14
  },
  {
    slug: 'addon-ia-25',
    name: 'Pack 25 requêtes IA',
    description: 'Ajoutez 25 requêtes IA supplémentaires à votre forfait',
    type: ServicePackType.ADDON,
    tier: null,
    price: 8,
    currency: 'EUR',
    features: ['+25 requêtes IA'],
    quantity: 25,
    unit: 'AI_REQUEST',
    isHighlighted: false,
    sortOrder: 15
  },
  {
    slug: 'addon-ia-50',
    name: 'Pack 50 requêtes IA',
    description: 'Ajoutez 50 requêtes IA supplémentaires à votre forfait',
    type: ServicePackType.ADDON,
    tier: null,
    price: 15,
    currency: 'EUR',
    features: ['+50 requêtes IA'],
    quantity: 50,
    unit: 'AI_REQUEST',
    isHighlighted: false,
    sortOrder: 16
  },
  {
    slug: 'addon-invitation',
    name: 'Invitation supplémentaire',
    description: 'Créez un événement supplémentaire',
    type: ServicePackType.ADDON,
    tier: null,
    price: 15,
    currency: 'EUR',
    features: ['+1 événement'],
    quantity: 1,
    unit: 'INVITATION',
    isHighlighted: false,
    sortOrder: 17
  }
];

async function seedServicePacks() {
  console.log('🌱 Début de l\'initialisation des packs de service...\n');

  try {
    // Créer les packs de base
    console.log('📦 Création des packs de base...');
    for (const packData of BASE_PACKS) {
      const existing = await ServicePackService.getBySlug(packData.slug);
      if (existing) {
        console.log(`  ⚠️  Pack "${packData.name}" existe déjà (slug: ${packData.slug}), mise à jour...`);
        await ServicePackService.update(existing.id, packData);
        console.log(`  ✅ Pack "${packData.name}" mis à jour`);
      } else {
        await ServicePackService.create(packData);
        console.log(`  ✅ Pack "${packData.name}" créé`);
      }
    }

    console.log('\n🎁 Création des packs supplémentaires...');
    for (const packData of ADDON_PACKS) {
      const existing = await ServicePackService.getBySlug(packData.slug);
      if (existing) {
        console.log(`  ⚠️  Pack "${packData.name}" existe déjà (slug: ${packData.slug}), mise à jour...`);
        await ServicePackService.update(existing.id, packData);
        console.log(`  ✅ Pack "${packData.name}" mis à jour`);
      } else {
        await ServicePackService.create(packData);
        console.log(`  ✅ Pack "${packData.name}" créé`);
      }
    }

    console.log('\n✨ Initialisation terminée avec succès !');
    
    // Afficher un résumé
    const basePacks = await ServicePackService.listBasePacks(true);
    const addonPacks = await ServicePackService.listAddonPacks(true);
    
    console.log(`\n📊 Résumé:`);
    console.log(`  - Packs de base: ${basePacks.length}`);
    console.log(`  - Packs supplémentaires: ${addonPacks.length}`);
    console.log(`  - Total: ${basePacks.length + addonPacks.length} packs`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  seedServicePacks()
    .then(() => {
      console.log('\n✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur fatale:', error);
      process.exit(1);
    });
}

export { seedServicePacks };

