"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { HeaderMobile } from "@/components/HeaderMobile";
import { ConfirmModal } from "@/components/ui/modal";
import { usersApi } from "@/lib/api/users";
import { User, Mail, Phone, Trash2, AlertTriangle, Bell } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { NotificationToggle } from "@/components/Settings/NotificationToggle";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // TODO: Implémenter la mise à jour du profil via l'API
      // await apiClient.put('/users/profile', {
      //   firstName: formData.firstName,
      //   lastName: formData.lastName,
      //   phone: formData.phone,
      // });
      console.log("Mise à jour du profil:", formData);
      // Simuler un délai
      await new Promise((resolve) => setTimeout(resolve, 1000));
      addToast({
        type: "success",
        title: "Succès",
        message: "Profil mis à jour avec succès !",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      addToast({
        type: "error",
        title: "Erreur",
        message: "Erreur lors de la mise à jour du profil",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    const first = formData.firstName?.[0] || "U";
    const last = formData.lastName?.[0] || "";
    return `${first}${last}`.toUpperCase();
  };

  return (
    <div className={styles.profilePage}>
      <HeaderMobile title="Profil Utilisateur" />

      <div className={styles.pageContent}>
        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>{getInitials()}</div>
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>
              {formData.firstName} {formData.lastName}
            </h1>
            <p className={styles.profileEmail}>{formData.email}</p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className={styles.profileForm}>
          <p className={styles.formSectionTitle}>Informations personnelles</p>

          {/* Name Fields - Grid */}
          <div className={styles.formGrid}>
            {/* First Name */}
            <div className={styles.formField}>
              <label className={styles.label} htmlFor="firstname">
                Prénom
              </label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={18} />
                <input
                  className={styles.input}
                  id="firstname"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  required
                  aria-required="true"
                  aria-label="Prénom"
                  placeholder="Votre prénom"
                />
              </div>
            </div>

            {/* Last Name */}
            <div className={styles.formField}>
              <label className={styles.label} htmlFor="lastname">
                Nom
              </label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={18} />
                <input
                  className={styles.input}
                  id="lastname"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  required
                  aria-required="true"
                  aria-label="Nom"
                  placeholder="Votre nom"
                />
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="email">
              Adresse email
            </label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={18} />
              <input
                className={`${styles.input} ${styles.inputDisabled}`}
                id="email"
                type="email"
                value={formData.email}
                disabled
                aria-disabled="true"
                aria-label="Email (non modifiable)"
              />
            </div>
            <p className={styles.helpText}>
              L&apos;adresse email ne peut pas être modifiée
            </p>
          </div>

          {/* Save Button */}
          <div className={styles.saveButtonContainer}>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSaving}
            >
              {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>

        <section className={styles.settingsSection}>
          <div className={styles.sectionHeader}>
            <Bell size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Paramètres de notifications</h3>
          </div>
          <p className={styles.sectionDescription}>
            Gérez la manière dont vous recevez les alertes pour ne manquer aucun
            message.
          </p>
          <NotificationToggle />
        </section>

        {/* Danger Zone */}
        <div className={styles.dangerZone}>
          <div className={styles.dangerZoneHeader}>
            <AlertTriangle className={styles.dangerIcon} size={20} />
            <h3 className={styles.dangerZoneTitle}>Zone de danger</h3>
          </div>
          <p className={styles.dangerZoneDescription}>
            La suppression de votre compte est définitive et irréversible.
            Toutes vos données seront supprimées.
          </p>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className={styles.deleteAccountButton}
            disabled={isDeleting}
          >
            <Trash2 size={18} />
            {isDeleting ? "Suppression..." : "Supprimer mon compte"}
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            await usersApi.deleteAccount();
            logout();
            router.push("/auth/login");
          } catch (error) {
            console.error("Erreur lors de la suppression du compte:", error);
            addToast({
              type: "error",
              title: "Erreur",
              message:
                "Erreur lors de la suppression du compte. Veuillez réessayer.",
            });
            setIsDeleting(false);
            setShowDeleteModal(false);
          }
        }}
        title="Supprimer mon compte"
        message="Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront définitivement supprimées."
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        isLoading={isDeleting}
      />
    </div>
  );
}
