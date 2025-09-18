/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://kawepla.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/client/*',
    '/super-admin/*',
    '/api/*',
    '/_next/*',
    '/admin/*',
    '/404',
    '/500'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/client/',
          '/super-admin/',
          '/api/',
          '/_next/',
          '/admin/',
          '/*.json$',
          '/*.xml$',
          '/sw.js',
          '/sw-custom.js',
          '/sw-notifications.js'
        ]
      }
    ],
    additionalSitemaps: [
      'https://kawepla.com/sitemap.xml'
    ]
  },
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  transform: async (config, path) => {
    // Personnalisation des priorités par page
    let priority = config.priority;
    let changefreq = config.changefreq;

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.startsWith('/auth/')) {
      priority = 0.8;
      changefreq = 'monthly';
    } else if (path === '/help') {
      priority = 0.7;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [
        {
          href: `https://kawepla.com${path}`,
          hreflang: 'fr'
        }
      ]
    };
  }
};
