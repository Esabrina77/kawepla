import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping des anciens tiers vers les nouveaux
const TIER_MAPPING = {
  'BASIC': 'FREE',
  'STANDARD': 'ESSENTIAL', 
  'PREMIUM': 'PREMIUM',
  'ELEGANT': 'ELEGANT',
  'LUXE': 'LUXE'
} as const;

// Données des utilisateurs de production
const PROD_USERS = [
  {
    id: 'cmcryzg4o0000txc4k8cenoiv',
    email: 'whethefoot@gmail.com',
    password: '$2b$12$KgjuS9EqXJR58qJ6UkR84eXKNOXGPLrpcH804GliIdDmyVcn/B1bq',
    firstName: 'Admin',
    lastName: 'System',
    role: 'ADMIN',
    subscriptionTier: 'PREMIUM',
    subscriptionStatus: 'ACTIVE',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2025-07-06T17:52:25.704Z'),
    updatedAt: new Date('2025-07-06T17:52:25.704Z')
  },
  {
    id: 'cmd0b3a4a002hwv4fhgi5q9pl',
    email: 'sabrinaeloundou33@gmail.com',
    password: '$2b$10$dswBntws/rqtzpWp1i1GRuuwglUinubYPrf8z/N8QfeNeI1s9PF5G',
    firstName: 'Sabrina',
    lastName: 'Eloundou',
    role: 'COUPLE',
    subscriptionTier: 'ELEGANT',
    subscriptionStatus: 'ACTIVE',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2025-07-15T10:00:00.000Z'),
    updatedAt: new Date('2025-07-15T10:00:00.000Z')
  },
  {
    id: 'cmcryzgb70001txc4s0gkn9vj',
    email: 'couple@test.com',
    password: '$2b$12$E1W9XptLJnnjvF0jKTX1qO3Vfezuhiq1VKlLusdHg0G0bv0rMK56a',
    firstName: 'Test',
    lastName: 'Couple',
    role: 'COUPLE',
    subscriptionTier: 'BASIC',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2025-07-06T17:52:25.939Z'),
    updatedAt: new Date('2025-07-08T07:30:54.893Z')
  },
  {
    id: 'cmd0b3a4a002hwv4fhgi5q9pl',
    email: 'testerwizard02@gmail.com',
    password: '$2b$10$dswBntws/rqtzpWp1i1GRuuwglUinubYPrf8z/N8QfeNeI1s9PF5G',
    firstName: 'Tester',
    lastName: 'Wizard',
    role: 'COUPLE',
    subscriptionTier: 'BASIC',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2025-07-12T13:53:29.338Z'),
    updatedAt: new Date('2025-07-12T13:54:37.801Z')
  },
  {
    id: 'cmcvj38ov0009wvy2bl21qv1t',
    email: 'yongoherve@gmail.com',
    password: '$2b$10$8PBwneOLNwBEX.4r6CrlT.Bl6aZMubP//zbYrG8HBH2bdpT/jowxa',
    firstName: 'Johan',
    lastName: 'Tchoute',
    role: 'COUPLE',
    subscriptionTier: 'BASIC',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2025-07-09T05:38:33.535Z'),
    updatedAt: new Date('2025-07-09T05:39:08.500Z')
  },
  {
    id: 'cmcvjjssl000dwvy2gjtucr5j',
    email: 'willytchouams@gmail.com',
    password: '$2b$10$uK8kl2cXzNsFPrkWzNp6NOwOEdzyFdCE0GBRDfpKyKszoFVKxUFSW',
    firstName: 'Claudio',
    lastName: 'Hh',
    role: 'COUPLE',
    subscriptionTier: 'BASIC',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2025-07-09T05:51:26.085Z'),
    updatedAt: new Date('2025-07-09T05:51:44.884Z')
  },
  {
    id: 'cmcvm8djb000lwvy23iwgjqdg',
    email: 'elsapraisekengne@gmail.com',
    password: '$2b$10$HQSzYKsGt6/ZnJNqPssmhuB8H95.T3mO5t1m4VUPrwM0FO4shGlKS',
    firstName: 'Praise',
    lastName: 'Kengne',
    role: 'COUPLE',
    subscriptionTier: 'BASIC',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2025-07-09T07:06:31.943Z'),
    updatedAt: new Date('2025-07-09T07:07:30.607Z')
  },
  {
    id: 'cmcvnropd000rwvy2wx2c4fk3',
    email: 'tifonom157@iamtile.com',
    password: '$2b$10$C.mJt8TQuRnzHnpQkkJAeO2Rc28iQWMc6UX2fTMjhj/KhWDe4Aulm',
    firstName: 'Tifo',
    lastName: 'Tadou',
    role: 'COUPLE',
    subscriptionTier: 'BASIC',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2025-07-09T07:49:32.497Z'),
    updatedAt: new Date('2025-07-09T07:49:55.925Z')
  },
  {
    id: 'cmcvw0aom000vwvy28awhciao',
    email: 'kengjosky22@gmail.com',
    password: '$2b$10$/wW.2OajF0TPdWDRauYxae4fipS5WMxihLuRSxMYVA9SGr40dBgbq',
    firstName: 'Josky',
    lastName: 'Keng',
    role: 'COUPLE',
    subscriptionTier: 'BASIC',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2025-07-09T11:40:11.158Z'),
    updatedAt: new Date('2025-07-09T11:40:34.089Z')
  },
  {
    id: 'cmcvwy6ug0011wvy2xz42hokp',
    email: 'jasonkemack@gmail.com',
    password: '$2b$10$raynXcRouyMv36Hd/7BPDuJUK2JrFlei3YmwGDPn2MpO4RunZ8PnK',
    firstName: 'Jason',
    lastName: 'Kemack',
    role: 'COUPLE',
    subscriptionTier: 'BASIC',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: false,
    createdAt: new Date('2025-07-09T12:06:32.488Z'),
    updatedAt: new Date('2025-07-09T12:06:32.488Z')
  },
  {
    id: 'cmcvwy4gx000zwvy2ft4qonc7',
    email: 'm.massamba.gueye@gmail.com',
    password: '$2b$10$DZ9rrQAe5CoB4suL2M/yt.qwvFGuf5vhdfIoBxNkVcFAd4V0fmLJG',
    firstName: 'Massamba',
    lastName: 'Gueye',
    role: 'COUPLE',
    subscriptionTier: 'BASIC',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2025-07-09T12:06:29.409Z'),
    updatedAt: new Date('2025-07-09T12:07:00.562Z')
  },
  {
    id: 'cmcvx02uj0013wvy2clp39aqs',
    email: 'steevenduncan@gmail.com',
    password: '$2b$10$PrCRFDqBSeoTSSlDU4wW4exND5M2nfpvNj2xchuTvBmr4MwduQbQu',
    firstName: 'Jason',
    lastName: 'Mcmanaman',
    role: 'COUPLE',
    subscriptionTier: 'BASIC',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2025-07-09T12:08:00.620Z'),
    updatedAt: new Date('2025-07-09T12:08:20.181Z')
  },
  {
    id: 'cmcvxo1w20017wvy2wopfaxmv',
    email: 'tchounkeuyanzeu62@gmail.com',
    password: '$2b$10$MftoJyf/uLfdqQzlov5zDOOO2uQJmn.oBNnWMSpQqZyxgNxx4y.U.',
    firstName: 'Igor',
    lastName: 'Tchounkeu',
    role: 'COUPLE',
    subscriptionTier: 'BASIC',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2025-07-09T12:26:39.122Z'),
    updatedAt: new Date('2025-07-09T12:27:43.279Z')
  },
  {
    id: 'cmcvyh8do0000wv1f695vxozi',
    email: 'stephanewandji317@gmail.com',
    password: '$2b$10$cdaqVb09XApsAA4N6i5qZuq8QT20.MBLKrdRnzctkUJfspmcvdOfi',
    firstName: 'STEPHANE JUNIOR',
    lastName: 'WANDJI NGABO',
    role: 'COUPLE',
    subscriptionTier: 'BASIC',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2025-07-09T12:49:20.556Z'),
    updatedAt: new Date('2025-07-09T12:58:36.208Z')
  },
  {
    id: 'cmcw4chsr0000wv4f5ml9avd1',
    email: 'nguekokery@gmail.com',
    password: '$2b$10$BR0vZXlksCRAiftLLvzd6ueTRW7VLYc6RC2USizaKqWN02i126tXa',
    firstName: 'Bobbie',
    lastName: 'Ngameni',
    role: 'COUPLE',
    subscriptionTier: 'BASIC',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2025-07-09T15:33:37.179Z'),
    updatedAt: new Date('2025-07-09T15:34:10.584Z')
  },
  {
    id: 'cmcwgpbrz000kwv4fp61924q8',
    email: 'j.nana-tchuiam@montpellier-bs.com',
    password: '$2b$10$dkiVfZL6/JWCrWWtl6lGROYHtnmf1F.KkQ2Cwr4bmcNfy9qgoUJni',
    firstName: 'Nancy',
    lastName: 'Nana',
    role: 'COUPLE',
    subscriptionTier: 'BASIC',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2025-07-09T21:19:31.296Z'),
    updatedAt: new Date('2025-07-09T21:23:32.260Z')
  },
  {
    id: 'cmcwpdo2o001gwv4fimv0cdn6',
    email: 'bryan.kamkui@gmail.com',
    password: '$2b$10$ChScDJx43L1vQPjhJns7lOfruRD3zJeGT9koPYEwVKSs3u.S65WNK',
    firstName: 'Bryan landrich',
    lastName: 'Tchocning kamkui',
    role: 'COUPLE',
    subscriptionTier: 'BASIC',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2025-07-10T01:22:23.904Z'),
    updatedAt: new Date('2025-07-10T01:23:24.417Z')
  },
  {
    id: 'cmd1v52eb002jwv4fkh2e83a5',
    email: 'pokmsojohan@gmail.com',
    password: '$2b$10$Dp0xynsnAegHkvFGAWz0bOekKTEKDYWwyAGoDmiaz6XMzoVF634TS',
    firstName: 'Johan',
    lastName: 'Pokmso',
    role: 'COUPLE',
    subscriptionTier: 'BASIC',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2025-07-13T16:02:31.139Z'),
    updatedAt: new Date('2025-07-13T16:02:58.892Z')
  },
  {
    id: 'cmd20vy0k002nwv4f2fr2sli5',
    email: 'dongmo.natido@gmail.com',
    password: '$2b$10$oICLIR.eCZLpwbr/3f4pCOIAVPAr/TcIaDn16Kr1wXhEycwxytHAq',
    firstName: 'Arnaud',
    lastName: 'DONGMO NATIDO',
    role: 'COUPLE',
    subscriptionTier: 'BASIC',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: false,
    createdAt: new Date('2025-07-13T18:43:23.252Z'),
    updatedAt: new Date('2025-07-13T18:43:23.252Z')
  },
  {
    id: 'cmd2q8c42002pwv4fddrwx8ul',
    email: 'gaiamartino2004@gmail.com',
    password: '$2b$10$cCFmrfSlFjBdJDhovW1Q2evj4D5JzDzhyXcvugZi1DUfqv5aUEQk6',
    firstName: 'Martino',
    lastName: 'Gaia',
    role: 'COUPLE',
    subscriptionTier: 'BASIC',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2025-07-14T06:32:51.794Z'),
    updatedAt: new Date('2025-07-14T06:33:17.029Z')
  },
  {
    id: 'cmd36k6xt002rwv4fdy9uni90',
    email: 'alessia.cafarelli@libero.it',
    password: '$2b$10$71.yC2PaFeqmoWxP0h5lpeTlwfENIkGRpIl7MEjxaYA6DSXcZG/jS',
    firstName: 'Alessia',
    lastName: 'Cafarelli',
    role: 'COUPLE',
    subscriptionTier: 'BASIC',
    subscriptionEndDate: null,
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2025-07-14T14:09:58.817Z'),
    updatedAt: new Date('2025-07-14T14:12:16.842Z')
  }
];

async function importUsers() {
  console.log('🚀 Début de l\'importation des utilisateurs...');
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of PROD_USERS) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: user.email },
            { id: user.id }
          ]
        }
      });

      if (existingUser) {
        // Si l'utilisateur existe, on met à jour ses informations
        const newTier = TIER_MAPPING[user.subscriptionTier as keyof typeof TIER_MAPPING] || 'FREE';
        
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role as any,
            subscriptionTier: newTier as any,
            subscriptionStatus: 'ACTIVE',
            subscriptionEndDate: user.subscriptionEndDate,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
            updatedAt: new Date()
          }
        });
        
        console.log(`🔄 Utilisateur ${user.email} mis à jour (${user.subscriptionTier} → ${newTier})`);
        imported++;
        continue;
      }

      // Mapper l'ancien tier vers le nouveau
      const newTier = TIER_MAPPING[user.subscriptionTier as keyof typeof TIER_MAPPING] || 'FREE';

      // Créer l'utilisateur avec les nouvelles valeurs
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          password: user.password,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role as any,
          subscriptionTier: newTier as any,
          subscriptionStatus: 'ACTIVE',
          subscriptionEndDate: user.subscriptionEndDate,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });

      console.log(`✅ Utilisateur ${user.email} importé (${user.subscriptionTier} → ${newTier})`);
      imported++;

    } catch (error) {
      console.error(`❌ Erreur lors de l'importation de ${user.email}:`, error);
      errors++;
    }
  }

  console.log('\n📊 Résumé de l\'importation:');
  console.log(`✅ Importés/Mis à jour: ${imported}`);
  console.log(`⏭️  Ignorés: ${skipped}`);
  console.log(`❌ Erreurs: ${errors}`);
  console.log(`📝 Total: ${PROD_USERS.length}`);
}

// Exécuter le script
importUsers()
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 