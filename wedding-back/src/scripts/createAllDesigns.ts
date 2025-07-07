import { prisma } from '../lib/prisma';

async function createAllDesigns() {
  try {
    console.log('🌱 Creating all designs...');
    
    // Supprimer tous les designs existants
    await prisma.design.deleteMany({});
    console.log('🗑️ Deleted existing designs');
    
    // Trouver l'utilisateur admin
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!adminUser) {
      throw new Error('Admin user not found. Please create admin user first.');
    }
    
    const designs = [
      {
        name: 'Boho Floral Naturel',
        description: 'Design naturel avec roses, pampas et cadre doré organique',
        category: 'boho',
        tags: ['floral', 'naturel', 'doré', 'roses', 'pampas']
      },
      {
        name: 'Monogramme Élégant',
        description: 'Design moderne avec lettres décoratives et style minimaliste',
        category: 'moderne',
        tags: ['monogramme', 'minimaliste', 'lettres', 'élégant']
      },
      {
        name: 'Photo Romantique',
        description: 'Design avec photo de couple en arrière-plan et typographie script',
        category: 'photo',
        tags: ['photo', 'romantique', 'couple', 'overlay']
      },
      {
        name: 'Indien Traditionnel',
        description: 'Style indien avec lanternes dorées, motifs traditionnels et couleurs riches',
        category: 'traditionnel',
        tags: ['indien', 'traditionnel', 'lanternes', 'doré', 'religieux']
      },
      {
        name: 'Roses Dorées',
        description: 'Cadre géométrique doré avec roses rouges et fond crème élégant',
        category: 'luxe',
        tags: ['doré', 'roses', 'géométrique', 'luxe', 'élégant']
      }
    ];
    
    console.log(`Creating ${designs.length} designs...`);
    
    for (let i = 0; i < designs.length; i++) {
      const design = designs[i];
      console.log(`Creating design ${i + 1}/${designs.length}: ${design.name}`);
      
      try {
        await prisma.design.create({
          data: {
            name: design.name,
            description: design.description,
            category: design.category,
            tags: design.tags,
            template: {
              layout: "<div class='wedding-invitation'>{header}{main}{footer}</div>",
              sections: {
                header: {
                  html: "<header class='invitation-header'><h1 class='couple-names'>{coupleName}</h1></header>",
                  position: "header"
                },
                main: {
                  html: "<main class='invitation-body'><p class='wedding-date'>{date}</p><p class='wedding-details'>{details}</p><p class='invitation-message'>{message}</p></main>",
                  position: "main"
                },
                footer: {
                  html: "<footer class='invitation-footer'><div class='rsvp-section'>{rsvpForm}</div></footer>",
                  position: "footer"
                }
              }
            },
            styles: {
              base: {
                ".wedding-invitation": {
                  "max-width": "500px",
                  "margin": "0 auto",
                  "padding": "2rem",
                  "background": "#ffffff",
                  "border-radius": "8px",
                  "box-shadow": "0 4px 20px rgba(0,0,0,0.1)",
                  "font-family": "Georgia, serif"
                }
              },
              components: {
                header: {
                  ".invitation-header": {
                    "text-align": "center",
                    "margin-bottom": "2rem"
                  },
                  ".couple-names": {
                    "font-size": "2rem",
                    "color": "#2c2c2c",
                    "margin": "0"
                  }
                },
                main: {
                  ".invitation-body": {
                    "text-align": "center",
                    "margin": "2rem 0"
                  },
                  ".wedding-date": {
                    "font-size": "1.2rem",
                    "color": "#d4af37",
                    "margin-bottom": "1rem"
                  },
                  ".wedding-details": {
                    "font-size": "1rem",
                    "color": "#666",
                    "margin-bottom": "1rem"
                  },
                  ".invitation-message": {
                    "font-style": "italic",
                    "color": "#555"
                  }
                },
                footer: {
                  ".invitation-footer": {
                    "text-align": "center",
                    "margin-top": "2rem"
                  },
                  ".rsvp-section": {
                    "font-size": "0.9rem",
                    "color": "#888"
                  }
                }
              },
              animations: {}
            },
            variables: {
              colors: {
                primary: "#2c2c2c",
                secondary: "#d4af37",
                accent: "#666666",
                background: "#ffffff"
              },
              typography: {
                bodyFont: "Georgia, serif",
                headingFont: "Georgia, serif",
                fontSize: {
                  base: "16px",
                  heading: {
                    h1: "2rem",
                    h2: "1.5rem",
                    h3: "1.2rem"
                  }
                }
              },
              spacing: {
                base: "1rem",
                sections: "2rem",
                components: "1rem"
              }
            },
            isActive: true,
            isPremium: false,
            backgroundImageRequired: design.name === 'Photo Romantique',
            createdBy: adminUser.id
          }
        });
        console.log(`✅ Created design: ${design.name}`);
      } catch (error) {
        console.error(`❌ Error creating design ${design.name}:`, error);
      }
    }
    
    console.log('🎉 All designs created successfully!');
    
    // Vérifier le nombre de designs créés
    const designCount = await prisma.design.count();
    console.log(`📊 Total designs in database: ${designCount}`);
    
  } catch (error) {
    console.error('❌ Error creating designs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAllDesigns(); 