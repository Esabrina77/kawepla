'use client';

import { Hero } from '@/components/Kavent/Hero';
import { Features } from '@/components/Kavent/Features';
import { HowItWorks } from '@/components/Kavent/HowItWorks';
import { Testimonials } from '@/components/Kavent/Testimonials';
import { Pricing } from '@/components/Kavent/Pricing';
import { CTA } from '@/components/Kavent/CTA';
import { FAQ } from '@/components/Kavent/FAQ';
import { Footer } from '@/components/Kavent/Footer';
import { Header } from '@/components/Kavent/Header';

import styles from './siteLayout.module.css';

export default function Home() {
    return (
        <div className={`${styles.siteWrapper} min-h-screen`}>
            <Header />
            <Hero />
            <Features />
            <HowItWorks />
            <Testimonials />
            <Pricing />
            <CTA />
            <FAQ />
            <Footer />
        </div>
    );
}
