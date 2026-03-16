import React from 'react';

const JsonLd = () => {
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Kawepla',
        url: 'https://kawepla.kaporelo.com',
        logo: 'https://kawepla.kaporelo.com/images/logo.png',
        description: "Plateforme d'Organisation d'Événements & Annuaire Prestataires",
        email: 'kawepla.kaporelo@gmail.com',
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'FR'
        },
        // sameAs: [
        //   "https://www.instagram.com/kawepla",
        //   "https://www.linkedin.com/company/kawepla"
        // ]
    };

    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Kawepla',
        url: 'https://kawepla.kaporelo.com',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://kawepla.kaporelo.com/search?q={search_term_string}'
            },
            'query-input': 'required name=search_term_string'
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
        </>
    );
};

export default JsonLd;
