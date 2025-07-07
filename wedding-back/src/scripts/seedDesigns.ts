import { prisma } from '../lib/prisma';

const ELEGANT_TEMPLATES = {
  bohoFloral: {
    name: 'Boho Floral Naturel',
    description: 'Design naturel avec roses, pampas et cadre doré organique',
    category: 'boho',
    tags: ['floral', 'naturel', 'doré', 'roses', 'pampas'],
    backgroundImageRequired: false,
    template: {
      layout: "<div class='wedding-invitation boho-floral'>{header}{main}{footer}</div>",
      sections: {
        header: {
          html: "<header class='invitation-header'><div class='floral-frame'><div class='save-the-date'>Save The Date</div><div class='event-type'>FOR THE WEDDING CEREMONY OF</div><h1 class='couple-names'>{coupleName}</h1><div class='wedding-date'>{date}</div><div class='location-time'>{details}</div></div></header>",
          position: "header"
        },
        main: {
          html: "<main class='invitation-body'><div class='ornamental-divider'></div><div class='reception-info'>{message}</div></main>",
          position: "main"
        },
        footer: {
          html: "<footer class='invitation-footer'><div class='contact-info'>{rsvpForm}</div></footer>",
          position: "footer"
        }
      }
    },
    styles: {
      base: {
        ".wedding-invitation": {
          "max-width": "600px",
          "margin": "0 auto",
          "padding": "2rem",
          "background": "linear-gradient(135deg, #faf8f5 0%, #f5f2ed 100%)",
          "position": "relative",
          "border-radius": "12px",
          "box-shadow": "0 15px 40px rgba(0,0,0,0.1)"
        }
      },
      components: {
        header: {
          ".invitation-header": {
            "text-align": "center",
            "position": "relative",
            "z-index": "2",
            "padding": "3rem 2rem"
          },
          ".couple-names": {
            "font-size": "2.8rem",
            "color": "#4a3c1d",
            "margin": "1rem 0",
            "font-weight": "400",
            "letter-spacing": "2px",
            "line-height": "1.2"
          }
        }
      },
      animations: {}
    },
    variables: {
      colors: {
        primary: "#4a3c1d",
        secondary: "#d4af37",
        accent: "#8b6914",
        background: "#faf8f5"
      },
      typography: {
        bodyFont: "Crimson Text, serif",
        headingFont: "Playfair Display, serif"
      },
      spacing: {
        base: "1rem",
        sections: "2rem"
      }
    }
  },
  
  monogramElegant: {
    name: 'Monogramme Élégant',
    description: 'Design moderne avec lettres décoratives et style minimaliste',
    category: 'moderne',
    tags: ['monogramme', 'minimaliste', 'lettres', 'élégant'],
    template: {
      layout: "<div class='wedding-invitation monogram-elegant'>{header}{main}{footer}</div>",
      sections: {
        header: {
          html: "<header class='invitation-header'><div class='save-title'>Save the Date</div><div class='event-title'>THE WEDDING OF</div></header>",
          position: "header"
        },
        main: {
          html: "<main class='invitation-body'><div class='monogram-container'><div class='letter-left'>{firstLetter}</div><div class='letter-right'>{secondLetter}</div></div><h1 class='couple-names'>{coupleName}</h1><div class='wedding-date'>{date}</div><div class='time-location'>{details}</div></main>",
          position: "main"
        },
        footer: {
          html: "<footer class='invitation-footer'><div class='rsvp-info'>{rsvpForm}</div></footer>",
          position: "footer"
        }
      }
    },
    styles: {
      base: {
        ".wedding-invitation": {
          "max-width": "500px",
          "margin": "0 auto",
          "padding": "4rem 3rem",
          "background": "linear-gradient(145deg, #f8f6f3 0%, #f0ebe6 100%)",
          "border-radius": "0",
          "box-shadow": "0 20px 60px rgba(0,0,0,0.08)"
        }
      },
      components: {
        header: {
          ".invitation-header": {
            "text-align": "center",
            "margin-bottom": "3rem"
          }
        }
      },
      animations: {}
    },
    variables: {
      colors: {
        primary: "#2c2c2c",
        secondary: "#8b7d6b",
        accent: "#d4c4a8",
        background: "#f8f6f3"
      },
      typography: {
        bodyFont: "Lora, serif",
        headingFont: "Cormorant Garamond, serif"
      },
      spacing: {
        base: "1rem",
        sections: "3rem"
      }
    }
  },
  
  photoRomantic: {
    name: 'Photo Romantique',
    description: 'Design avec photo de couple en arrière-plan et typographie script',
    category: 'photo',
    tags: ['photo', 'romantique', 'couple', 'overlay'],
    backgroundImageRequired: true,
    template: {
      layout: "<div class='wedding-invitation photo-romantic'><div class='photo-overlay'></div>{header}{main}{footer}</div>",
      sections: {
        header: {
          html: "<header class='invitation-header'><h1 class='save-title'>Save the Date</h1><div class='event-subtitle'>THE WEDDING OF</div></header>",
          position: "header"
        },
        main: {
          html: "<main class='invitation-body'><div class='decorative-line'></div><h2 class='couple-names'>{coupleName}</h2><div class='decorative-line'></div><div class='wedding-details'>{date}<br/>{details}</div></main>",
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
          "max-width": "400px",
          "margin": "0 auto",
          "height": "600px",
          "background": "url('/images/couple-photo-placeholder.jpg') center/cover",
          "position": "relative",
          "border-radius": "8px",
          "overflow": "hidden",
          "box-shadow": "0 20px 50px rgba(0,0,0,0.3)"
        }
      },
      components: {
        header: {
          ".invitation-header": {
            "position": "relative",
            "z-index": "2",
            "text-align": "center",
            "padding": "3rem 2rem 1rem 2rem",
            "color": "white"
          }
        }
      },
      animations: {}
    },
    variables: {
      colors: {
        primary: "#ffffff",
        secondary: "#d4af37",
        accent: "#f0f0f0",
        background: "transparent"
      },
      typography: {
        bodyFont: "Lato, sans-serif",
        headingFont: "Great Vibes, cursive"
      },
      spacing: {
        base: "1rem",
        sections: "2rem"
      }
    }
  },
  
  indianTraditional: {
    name: 'Indien Traditionnel',
    description: 'Style indien avec lanternes dorées, motifs traditionnels et couleurs riches',
    category: 'traditionnel',
    tags: ['indien', 'traditionnel', 'lanternes', 'doré', 'religieux'],
    template: {
      layout: "<div class='wedding-invitation indian-traditional'>{header}{main}{footer}</div>",
      sections: {
        header: {
          html: "<header class='invitation-header'><div class='om-symbol'>ॐ</div><div class='family-blessing'>Together with their families</div></header>",
          position: "header"
        },
        main: {
          html: "<main class='invitation-body'><h1 class='couple-names'>{coupleName}</h1><div class='invitation-text'>cordially invite you to join the occasion of their joyous commitment on</div><div class='date-section'><div class='month'>JULY</div><div class='day'>28</div><div class='time'>AT 8AM</div><div class='year'>2024</div></div><div class='location'>at<br/>{details}</div></main>",
          position: "main"
        },
        footer: {
          html: "<footer class='invitation-footer'><div class='rsvp-text'>{rsvpForm}</div></footer>",
          position: "footer"
        }
      }
    },
    styles: {
      base: {
        ".wedding-invitation": {
          "max-width": "550px",
          "margin": "0 auto",
          "padding": "3rem 2.5rem",
          "background": "linear-gradient(135deg, #4a1a4a 0%, #6b2c6b 100%)",
          "position": "relative",
          "border-radius": "15px",
          "box-shadow": "0 15px 40px rgba(74, 26, 74, 0.4)",
          "color": "white"
        }
      },
      components: {
        header: {
          ".invitation-header": {
            "text-align": "center",
            "margin-bottom": "2rem"
          }
        }
      },
      animations: {}
    },
    variables: {
      colors: {
        primary: "#4a1a4a",
        secondary: "#d4af37",
        accent: "#e8b4b8",
        background: "#6b2c6b"
      },
      typography: {
        bodyFont: "Noto Sans, sans-serif",
        headingFont: "Cinzel, serif"
      },
      spacing: {
        base: "1rem",
        sections: "2rem"
      }
    }
  },
  
  goldenRoses: {
    name: 'Roses Dorées',
    description: 'Cadre géométrique doré avec roses rouges et fond crème élégant',
    category: 'luxe',
    tags: ['doré', 'roses', 'géométrique', 'luxe', 'élégant'],
    template: {
      layout: "<div class='wedding-invitation golden-roses'>{header}{main}{footer}</div>",
      sections: {
        header: {
          html: "<header class='invitation-header'><div class='family-text'>TOGETHER WITH THEIR FAMILIES</div></header>",
          position: "header"
        },
        main: {
          html: "<main class='invitation-body'><div class='geometric-frame'><h1 class='couple-names'>{coupleName}</h1><div class='date-display'><div class='month'>OCTOBER</div><div class='day'>21</div><div class='time'>08:00 AM</div><div class='year'>2026</div></div><div class='location-info'>{details}</div></div></main>",
          position: "main"
        },
        footer: {
          html: "<footer class='invitation-footer'><div class='rsvp-info'>{rsvpForm}</div></footer>",
          position: "footer"
        }
      }
    },
    styles: {
      base: {
        ".wedding-invitation": {
          "max-width": "550px",
          "margin": "0 auto",
          "padding": "3rem 2.5rem",
          "background": "linear-gradient(135deg, #faf7f2 0%, #f5f0e8 100%)",
          "position": "relative",
          "border-radius": "8px",
          "box-shadow": "0 20px 50px rgba(0,0,0,0.1)"
        }
      },
      components: {
        header: {
          ".invitation-header": {
            "text-align": "center",
            "margin-bottom": "2rem"
          }
        }
      },
      animations: {}
    },
    variables: {
      colors: {
        primary: "#4a3c1d",
        secondary: "#d4af37",
        accent: "#dc3545",
        background: "#faf7f2"
      },
      typography: {
        bodyFont: "Libre Baskerville, serif",
        headingFont: "Playfair Display, serif"
      },
      spacing: {
        base: "1rem",
        sections: "2rem"
      }
    }
  }
};

async function seedDesigns() {
  try {
    console.log('🌱 Seeding designs...');
    
    // Créer un utilisateur admin si nécessaire
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@wedding.com',
          password: 'hashed_password', // À remplacer par un hash réel
          firstName: 'Admin',
          lastName: 'System',
          role: 'ADMIN',
          emailVerified: true
        }
      });
      console.log('✅ Admin user created');
    }
    
    // Créer les designs
    for (const [key, template] of Object.entries(ELEGANT_TEMPLATES)) {
      const existing = await prisma.design.findFirst({
        where: { name: template.name }
      });
      
      if (!existing) {
        await prisma.design.create({
          data: {
            name: template.name,
            description: template.description,
            category: template.category,
            tags: template.tags,
            template: template.template,
            styles: template.styles,
            variables: template.variables,
            backgroundImageRequired: false,
            isActive: true,
            isPremium: false,
            createdBy: adminUser.id
          }
        });
        console.log(`✅ Created design: ${template.name}`);
      } else {
        console.log(`⚠️  Design already exists: ${template.name}`);
      }
    }
    
    console.log('🎉 Seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding designs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDesigns(); 