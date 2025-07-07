import { prisma } from '../lib/prisma';

async function setupComplete() {
  try {
    console.log('🔍 Checking setup completion...\n');
    
    // Vérifier les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        emailVerified: true
      }
    });
    
    console.log('👥 Users in database:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.firstName} ${user.lastName}`);
    });
    console.log(`  Total: ${users.length} users\n`);
    
    // Vérifier les designs
    const designs = await prisma.design.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        tags: true,
        isActive: true,
        isPremium: true,
        backgroundImageRequired: true,
        createdBy: true
      }
    });
    
    console.log('🎨 Designs in database:');
    designs.forEach(design => {
      const tags = design.tags?.join(', ') || 'none';
      const status = design.isActive ? '✅ Active' : '❌ Inactive';
      const premium = design.isPremium ? '💎 Premium' : '🆓 Free';
      const bgRequired = design.backgroundImageRequired ? '🖼️ BG Required' : '';
      console.log(`  - ${design.name} (${design.category}) ${status} ${premium} ${bgRequired}`);
      console.log(`    Tags: ${tags}`);
    });
    console.log(`  Total: ${designs.length} designs\n`);
    
    // Vérifier la configuration
    const adminCount = users.filter(u => u.role === 'ADMIN').length;
    const coupleCount = users.filter(u => u.role === 'COUPLE').length;
    const activeDesigns = designs.filter(d => d.isActive).length;
    
    console.log('📊 Summary:');
    console.log(`  - Admin users: ${adminCount}`);
    console.log(`  - Couple users: ${coupleCount}`);
    console.log(`  - Active designs: ${activeDesigns}`);
    console.log(`  - Categories: ${[...new Set(designs.map(d => d.category))].join(', ')}`);
    
    if (adminCount > 0 && activeDesigns > 0) {
      console.log('\n🎉 Setup is complete! You can now:');
      console.log('  1. Start the backend server: npm start');
      console.log('  2. Login as admin: whethefoot@gmail.com / _Kawepla2025Super_admin');
      console.log('  3. Login as couple: couple@test.com / Password123!');
      console.log('  4. Test the design selection interface');
      console.log('  5. Access Prisma Studio: npx prisma studio');
    } else {
      console.log('\n⚠️ Setup incomplete:');
      if (adminCount === 0) console.log('  - No admin user found');
      if (activeDesigns === 0) console.log('  - No active designs found');
    }
    
  } catch (error) {
    console.error('❌ Error checking setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupComplete(); 