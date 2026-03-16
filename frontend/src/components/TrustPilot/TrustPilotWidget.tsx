'use client';

import React, { useRef } from 'react';
import Script from 'next/script';

export const TrustPilotWidget = () => {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <>
            <Script
                src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
                strategy="lazyOnload"
                onLoad={() => {
                    if (typeof window !== 'undefined' && (window as any).Trustpilot && ref.current) {
                        (window as any).Trustpilot.loadFromElement(ref.current, true);
                    }
                }}
            />
            <div
                ref={ref}
                className="trustpilot-widget"
                data-locale="fr-FR"
                data-template-id="56278e9abfbbba0bdcd568bc"
                data-businessunit-id="69243c382a6043b23f4e275f"
                data-style-height="52px"
                data-style-width="100%"
                data-theme="light"
            >
                <a
                    href="https://fr.trustpilot.com/review/kaporelo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Trustpilot
                </a>
            </div>
        </>
    );
};
