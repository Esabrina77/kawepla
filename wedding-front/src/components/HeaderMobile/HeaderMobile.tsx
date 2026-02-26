"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FloatingThemeToggle } from "@/components/FloatingThemeToggle";
import { useRoleColor } from "@/hooks/useRoleColor";
import styles from "./HeaderMobile.module.css";

interface HeaderMobileProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  backUrl?: string;
  rightAction?: React.ReactNode;
}

export const HeaderMobile: React.FC<HeaderMobileProps> = ({
  title,
  showBackButton = true,
  onBack,
  backUrl,
  rightAction,
}) => {
  const router = useRouter();
  const { color, dark, rgb } = useRoleColor();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <header
      className={styles.header}
      style={{
        background: `linear-gradient(135deg, ${color}, ${dark})`,
        boxShadow: `0 4px 20px rgba(${rgb}, 0.2)`,
      }}
    >
      {showBackButton ? (
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={24} />
        </button>
      ) : (
        <div className={styles.headerSpacer} />
      )}

      <h1 className={styles.pageTitle}>{title}</h1>

      <div className={styles.rightActionWrapper}>
        {rightAction ? (
          rightAction
        ) : (
          <div className={styles.themeToggleWrapper}>
            <FloatingThemeToggle variant="inline" size={20} />
          </div>
        )}
      </div>
    </header>
  );
};
