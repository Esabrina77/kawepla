"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellOff, Info, Settings } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useRoleColor } from "@/hooks/useRoleColor";
import styles from "./NotificationToggle.module.css";
import { Button } from "@/components/ui/button";
import { ErrorModal } from "@/components/ui/modal";

export const NotificationToggle = () => {
  const { permission, requestPermission, isSupported } = useNotifications();
  const { color: themeColor } = useRoleColor();
  const [isMounted, setIsMounted] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isSupported) return null;

  const handleToggle = async () => {
    if (permission === "default") {
      await requestPermission();
    } else if (permission === "denied") {
      setShowBlockedModal(true);
    }
  };

  const getStatusLabel = () => {
    switch (permission) {
      case "granted":
        return "Activées";
      case "denied":
        return "Bloquées";
      default:
        return "Désactivées";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <div
          className={styles.iconWrapper}
          style={{
            backgroundColor:
              permission === "granted"
                ? "rgba(34, 197, 94, 0.1)"
                : "rgba(100, 116, 139, 0.1)",
          }}
        >
          {permission === "granted" ? (
            <Bell className={styles.iconActive} size={20} />
          ) : (
            <BellOff className={styles.iconInactive} size={20} />
          )}
        </div>
        <div>
          <h4 className={styles.title}>Notifications Navigateur</h4>
          <p className={styles.status}>
            Statut :{" "}
            <span className={styles[permission]}>{getStatusLabel()}</span>
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        {permission !== "granted" ? (
          <Button
            onClick={handleToggle}
            className={styles.actionBtn}
            style={{ backgroundColor: "var(--theme-color, #6366F1)" }}
          >
            Activer
          </Button>
        ) : (
          <p className={styles.successText}>Opérationnel</p>
        )}
      </div>

      {permission === "denied" && (
        <div className={styles.hint}>
          <Info size={14} />
          <span>
            Pour réactiver, cliquez sur l'icône à gauche de l'URL de votre
            navigateur.
          </span>
        </div>
      )}

      <ErrorModal
        isOpen={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
        title="Notifications bloquées"
        message="Les notifications sont bloquées par votre navigateur. Veuillez les réactiver dans les paramètres (cliquez sur l'icône de cadenas à gauche de l'URL pour gérer les permissions)."
      />
    </div>
  );
};
