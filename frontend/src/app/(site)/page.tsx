"use client";

import { useState } from "react";
import { Hero } from "@/components/Kavent/Hero";
import { Features } from "@/components/Kavent/Features";
import { HowItWorks } from "@/components/Kavent/HowItWorks";
import { Testimonials } from "@/components/Kavent/Testimonials";
import { Pricing } from "@/components/Kavent/Pricing";
import { CTA } from "@/components/Kavent/CTA";
import { FAQ } from "@/components/Kavent/FAQ";
import { Footer } from "@/components/Kavent/Footer";
import { Header } from "@/components/Kavent/Header";

import styles from "./siteLayout.module.css";

export default function Home() {
  // Shared role state to synchronize sections
  const [role, setRole] = useState<"client" | "provider">("client");
  const [featureIndex, setFeatureIndex] = useState(0);

  const handleRoleChange = (newRole: "client" | "provider") => {
    setRole(newRole);
    setFeatureIndex(0); // Reset slider when role changes
  };

  return (
    <div className={`${styles.siteWrapper} min-h-screen`}>
      <Header />
      <Hero role={role} onRoleChange={handleRoleChange} />

      {/* These sections react to the selected role */}
      <Features
        role={role}
        onRoleChange={handleRoleChange}
        currentIndex={featureIndex}
        onIndexChange={setFeatureIndex}
      />
      <HowItWorks role={role} />

      <Pricing role={role} />
      <Testimonials role={role} />
      <CTA role={role} />
      <FAQ role={role} />
      <Footer />
    </div>
  );
}
