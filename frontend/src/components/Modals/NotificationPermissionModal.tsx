"use client";

import React, { useState, useEffect } from "react";
import { Bell, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useRoleColor } from "@/hooks/useRoleColor";
import styles from "./NotificationPermissionModal.module.css";

export const NotificationPermissionModal = () => {
  const { permission, requestPermission, isSupported } = useNotifications();
  const { role } = useRoleColor();
  const [isVisible, setIsVisible] = useState(false);
  const [isReminder, setIsReminder] = useState(false);

  useEffect(() => {
    // Si déjà accordé, on n'affiche rien du tout
    if (permission === "granted") return;

    // 1. Logique d'affichage initial
    const hasPostponed = sessionStorage.getItem("skip_notification_modal");
    const hasRejectedPermanently = localStorage.getItem(
      "permanent_skip_notifications",
    );

    if (
      isSupported &&
      permission === "default" &&
      !hasPostponed &&
      !hasRejectedPermanently
    ) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }

    // 2. Logique de rappel sur message reçu
    const handleNewMessage = () => {
      // Si on a déjà refusé de manière permanente ou déjà vu le rappel, on ne montre plus rien
      const hasRejectedPermanently = localStorage.getItem(
        "permanent_skip_notifications",
      );
      const hasSeenReminder = localStorage.getItem(
        "notification_reminder_shown",
      );

      if (hasRejectedPermanently || hasSeenReminder) return;

      // Si le modal n'est pas déjà visible, on le montre en mode "rappel"
      if (!isVisible) {
        setIsReminder(true);
        setIsVisible(true);
        localStorage.setItem("notification_reminder_shown", "true");
      }
    };

    window.addEventListener("new-message-received", handleNewMessage);
    return () =>
      window.removeEventListener("new-message-received", handleNewMessage);
  }, [isSupported, permission, isVisible]);

  const handleRequest = async () => {
    const granted = await requestPermission();
    if (granted) {
      setIsVisible(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    if (isReminder) {
      // Si c'est un rappel et qu'ils ferment, on considère ça comme définitif
      localStorage.setItem("permanent_skip_notifications", "true");
    } else {
      // Sinon on remet à plus tard (cette session)
      sessionStorage.setItem("skip_notification_modal", "true");
    }
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay} data-role={role}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={handleClose}>
          <X size={20} />
        </button>

        <div className={styles.iconWrapper}>
          <div
            className={`${styles.iconCircle} ${isReminder ? styles.reminderPulse : ""}`}
          >
            <Bell size={32} className={styles.bellIcon} />
          </div>
        </div>

        <h3 className={styles.title}>
          {isReminder
            ? "Nouveau message reçu !"
            : "Activer les notifications ?"}
        </h3>
        <p className={styles.description}>
          {isReminder
            ? "Vous venez de recevoir un message. Activez les notifications pour répondre instantanément à vos interlocuteurs."
            : "Ne manquez aucun message important. Soyez alerté en temps réel, même quand vous n'êtes pas sur l'application."}
        </p>

        {permission === "denied" && (
          <div className={styles.warningBox}>
            <Info size={16} />
            <p>
              Les notifications sont bloquées. Cliquez sur l'icône à gauche de
              l'URL pour les autoriser.
            </p>
          </div>
        )}

        <div className={styles.actions}>
          <Button
            variant="outline"
            onClick={handleClose}
            className={styles.laterBtn}
          >
            {isReminder ? "Plus tard (ne plus demander)" : "Plus tard"}
          </Button>
          <Button onClick={handleRequest} className={styles.enableBtn}>
            {permission === "denied" ? "Réessayer" : "Activer maintenant"}
          </Button>
        </div>
      </div>
    </div>
  );
};
