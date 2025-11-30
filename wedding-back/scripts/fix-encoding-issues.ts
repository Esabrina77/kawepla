/**
 * Script pour corriger les problèmes d'encodage dans les données importées
 * 
 * Ce script corrige les caractères mal encodés comme:
 * - ├® → é
 * - ├¡ → í
 * - etc.
 * 
 * Usage: npm run fix:encoding
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Fonction pour corriger une chaîne de caractères
function fixEncoding(text: string | null): string | null {
  if (!text) return text;
  
  let fixed = text;
  
  // Corrections spécifiques communes (en premier)
  fixed = fixed.replace(/├®v├®nements/g, 'événements');
  fixed = fixed.replace(/D├®coration/g, 'Décoration');
  fixed = fixed.replace(/r├®ception/g, 'réception');
  fixed = fixed.replace(/Garc├¡a/g, 'García');
  fixed = fixed.replace(/Echavarr├¡a/g, 'Echavarría');
  fixed = fixed.replace(/Beaut├®/g, 'Beauté');
  fixed = fixed.replace(/esth├®ticiennes/g, 'estheticiennes');
  fixed = fixed.replace(/├®v├®nementielle/g, 'événementielle');
  fixed = fixed.replace(/├®v├®nement/g, 'événement');
  fixed = fixed.replace(/pour vos/g, 'pour vos');
  
  // Corrections génériques pour caractères accentués (ordre important)
  fixed = fixed.replace(/├®/g, 'é');
  fixed = fixed.replace(/├¡/g, 'í');
  fixed = fixed.replace(/├©/g, 'è');
  fixed = fixed.replace(/├á/g, 'á');
  fixed = fixed.replace(/├║/g, 'ú');
  fixed = fixed.replace(/├╝/g, 'ü');
  fixed = fixed.replace(/├»/g, 'ï');
  fixed = fixed.replace(/├╣/g, 'ù');
  fixed = fixed.replace(/├º/g, 'ç');
  fixed = fixed.replace(/├ë/g, 'É');
  fixed = fixed.replace(/├Ç/g, 'Ç');
  fixed = fixed.replace(/├╗/g, 'û');
  fixed = fixed.replace(/├ó/g, 'â');
  fixed = fixed.replace(/├í/g, 'à');
  fixed = fixed.replace(/├▒/g, 'ñ');
  fixed = fixed.replace(/├ü/g, 'ü');
  fixed = fixed.replace(/├│/g, 'ó');  // Attention: peut être 'ó' ou 'ò' ou 'ô' ou 'ö'
  
  // Nettoyer les caractères restants problématiques
  fixed = fixed.replace(/┬á/g, ' ');
  fixed = fixed.replace(/─/g, '');
  
  return fixed;
}

async function fixServiceCategories() {
  console.log('\n📦 Correction des service_categories...');
  
  const categories = await prisma.serviceCategory.findMany();
  let updated = 0;
  
  for (const category of categories) {
    const fixedName = fixEncoding(category.name);
    const fixedDescription = fixEncoding(category.description);
    
    if (fixedName !== category.name || fixedDescription !== category.description) {
      await prisma.serviceCategory.update({
        where: { id: category.id },
        data: {
          name: fixedName || category.name,
          description: fixedDescription ?? category.description,
        },
      });
      updated++;
      console.log(`   ✓ Corrigé: "${category.name}" → "${fixedName}"`);
    }
  }
  
  console.log(`   ✅ ${updated} categories corrigées sur ${categories.length}`);
}

async function fixUsers() {
  console.log('\n👥 Correction des users...');
  
  const users = await prisma.user.findMany();
  let updated = 0;
  
  for (const user of users) {
    const fixedFirstName = fixEncoding(user.firstName);
    const fixedLastName = fixEncoding(user.lastName);
    
    if (fixedFirstName !== user.firstName || fixedLastName !== user.lastName) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: fixedFirstName || user.firstName,
          lastName: fixedLastName || user.lastName,
        },
      });
      updated++;
      console.log(`   ✓ Corrigé: "${user.firstName} ${user.lastName}" → "${fixedFirstName} ${fixedLastName}"`);
    }
  }
  
  console.log(`   ✅ ${updated} users corrigés sur ${users.length}`);
}

async function fixProviderProfiles() {
  console.log('\n🏢 Correction des provider_profiles...');
  
  const providers = await prisma.providerProfile.findMany();
  let updated = 0;
  
  for (const provider of providers) {
    const fixedBusinessName = fixEncoding(provider.businessName);
    const fixedDescription = fixEncoding(provider.description);
    
    if (fixedBusinessName !== provider.businessName || fixedDescription !== provider.description) {
      await prisma.providerProfile.update({
        where: { id: provider.id },
        data: {
          businessName: fixedBusinessName || provider.businessName,
          description: fixedDescription ?? provider.description,
        },
      });
      updated++;
      console.log(`   ✓ Corrigé: "${provider.businessName}"`);
    }
  }
  
  console.log(`   ✅ ${updated} providers corrigés sur ${providers.length}`);
}

async function main() {
  console.log('🔧 Début de la correction des problèmes d\'encodage');
  console.log('='.repeat(60));
  
  try {
    await fixServiceCategories();
    await fixUsers();
    await fixProviderProfiles();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Correction terminée avec succès!');
  } catch (error: any) {
    console.error('\n❌ Erreur fatale:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Erreur non gérée:', error);
    process.exit(1);
  });
}

export { main as fixEncodingIssues };
