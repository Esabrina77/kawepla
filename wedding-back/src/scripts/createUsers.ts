import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function createUsers() {
  try {
    console.log('👥 Creating users...');
    
    // Supprimer tous les utilisateurs existants
    await prisma.user.deleteMany({});
    console.log('🗑️ Deleted existing users');
    
    // Créer l'utilisateur admin
    const adminPasswordHash = await bcrypt.hash('_Kawepla2025Super_admin', 12);
    const adminUser = await prisma.user.create({
      data: {
        email: 'whethefoot@gmail.com',
        password: adminPasswordHash,
        firstName: 'Admin',
        lastName: 'System',
        role: 'ADMIN',
        emailVerified: true,
        isActive: true,
        subscriptionTier: 'PREMIUM'
      }
    });
    console.log('✅ Created admin user: whethefoot@gmail.com');
    
    // Créer l'utilisateur couple
    const couplePasswordHash = await bcrypt.hash('Password123!', 12);
    const coupleUser = await prisma.user.create({
      data: {
        email: 'couple@test.com',
        password: couplePasswordHash,
        firstName: 'Test',
        lastName: 'Couple',
        role: 'COUPLE',
        emailVerified: true,
        isActive: true,
        subscriptionTier: 'BASIC'
      }
    });
    console.log('✅ Created couple user: couple@test.com');
    
    console.log('🎉 All users created successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin: whethefoot@gmail.com / _Kawepla2025Super_admin');
    console.log('Couple: couple@test.com / Password123!');
    
  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers(); 