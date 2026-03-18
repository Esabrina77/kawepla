import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./EnvelopeWrapper.module.css";
import { Heart } from "lucide-react";

interface EnvelopeWrapperProps {
  children: React.ReactNode;
}

export default function EnvelopeWrapper({ children }: EnvelopeWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Détecter si on est sur PC (Desktop >= 1024px)
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize(); // Init
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => {
        setIsFinished(true); // Laisse place au formulaire classique
      }, 1800); // Augmenté pour correspondre au timing plus lent
    }
  };

  // Variantes pour Mobile / Animation 3D de rotation du volet de DROITE
  const mobileFlapVariants = {
    closed: { rotateY: 0, zIndex: 50, translateZ: 10 },
    open: {
      rotateY: 150,
      opacity: 0.1,
      zIndex: 1,
      transition: { duration: 1.6, ease: [0.42, 0, 0.58, 1] }, // Plus doux (easeInOut)
    },
  };

  // Variantes pour PC (Ouverture vers le Haut sur axe X)
  const desktopFlapVariants = {
    closed: { rotateX: 0, zIndex: 50, translateZ: 10 },
    open: {
      rotateX: -150,
      opacity: 0.1,
      zIndex: 1,
      transition: { duration: 1.6, ease: [0.42, 0, 0.58, 1] },
    },
  };

  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3.0, ease: "easeInOut" }}
        className={styles.finalContent}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={styles.screenOverlay}>
      <div
        className={`${styles.envelopeContainer} ${isDesktop ? styles.desktopContainer : styles.mobileContainer}`}
      >
        <div className={styles.envelopeBack}></div>

        {/* --- STRUCTURE PC VS MOBILE --- */}
        {isDesktop ? (
          // === DESIGN HORIZONTAL (PC) ===
          <>
            <div className={styles.flapLeftFix}></div>
            <div className={styles.flapRightFix}></div>
            <div className={styles.flapBottomFix}></div>

            <motion.div
              className={styles.flapTopOpening}
              variants={desktopFlapVariants}
              animate={isOpen ? "open" : "closed"}
              style={{ transformOrigin: "top" }}
              onClick={handleOpen}
            />
          </>
        ) : (
          // === DESIGN VERTICAL (MOBILE) ===
          <>
            <div className={styles.flapTop}></div>
            <div className={styles.flapBottom}></div>
            <div className={styles.flapLeft}></div>

            <motion.div
              className={styles.flapRightOpening}
              variants={mobileFlapVariants}
              animate={isOpen ? "open" : "closed"}
              style={{ transformOrigin: "right" }}
              onClick={handleOpen}
            />
          </>
        )}

        {/* --- LE SCEAU (Indépendant, au dessus de tout) --- */}
        <motion.div
          className={`${styles.seal} ${isDesktop ? styles.sealTop : ""}`}
          initial={{ scale: 0.9, opacity: 0, x: "-50%", y: "-50%" }}
          animate={
            isOpen
              ? { scale: 0.4, opacity: 0, x: "-50%", y: "-50%" } // Rétraction douce
              : { scale: 1, opacity: 1, x: "-50%", y: "-50%" }
          }
          transition={{ duration: isOpen ? 1.2 : 0.4, ease: "easeInOut" }}
          onClick={handleOpen}
          style={{ pointerEvents: isOpen ? "none" : "auto" }} // Bloquer les clics inutiles après
        >
          <img
            src="/images/sceau-kawepla.png"
            alt="Sceau Kawepla"
            className={styles.sealImage}
          />
        </motion.div>

        {/* OVERLAY DE CLIC GÉANT */}
        {!isOpen && (
          <div className={styles.clickOverlay} onClick={handleOpen}></div>
        )}

        {/* --- CONTENU FINAL (Lettre / Formulaire) --- */}
        <motion.div
          className={styles.finalContent}
          initial={{ opacity: 0 }}
          animate={{ opacity: isFinished ? 1 : 0 }}
          style={{
            pointerEvents: isFinished ? "auto" : "none",
          }} /* Empêche les clics invisibles */
          transition={{
            duration: 5.0,
            ease: "easeInOut",
          }} /* Révélation dramatique et douce */
        >
          {children}
        </motion.div>

        {/* TEXTE D'ACTION */}
        {!isOpen && (
          <motion.span
            className={styles.promptText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Ouvrir l'invitation
          </motion.span>
        )}
      </div>
    </div>
  );
}
