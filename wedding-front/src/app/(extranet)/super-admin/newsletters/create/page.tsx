"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNewsletters } from "@/hooks/useNewsletters";
import {
  Mail,
  ArrowLeft,
  Save,
  Send,
  Users,
  Eye,
  Search,
  Plus,
  AlertCircle,
} from "lucide-react";
import styles from "./page.module.css";
import { SuccessModal, ErrorModal } from "@/components/ui/modal";

export default function CreateNewsletterPage() {
  const router = useRouter();
  const {
    createNewsletter,
    sendNewsletter,
    fetchTargetUsers,
    targetUsers,
    loading,
    error,
  } = useNewsletters();

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    content: "",
    targetAudience: "ALL_USERS" as
      | "ALL_USERS"
      | "HOSTS_ONLY"
      | "PROVIDERS_ONLY"
      | "ADMINS_ONLY"
      | "SPECIFIC_USERS",
    specificUserIds: [] as string[],
    scheduledAt: "",
  });

  const [userSearch, setUserSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

  // Modal states
  const [modalState, setModalState] = useState<{
    type: "success" | "error" | null;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    type: null,
    title: "",
    message: "",
  });

  // Charger les utilisateurs si audience spécifique
  useEffect(() => {
    if (formData.targetAudience === "SPECIFIC_USERS") {
      fetchTargetUsers({ search: userSearch, limit: 50 });
    }
  }, [formData.targetAudience, userSearch, fetchTargetUsers]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUserToggle = (user: any) => {
    const isSelected = selectedUsers.some((u) => u.id === user.id);
    if (isSelected) {
      setSelectedUsers((prev) => prev.filter((u) => u.id !== user.id));
      setFormData((prev) => ({
        ...prev,
        specificUserIds: prev.specificUserIds.filter((id) => id !== user.id),
      }));
    } else {
      setSelectedUsers((prev) => [...prev, user]);
      setFormData((prev) => ({
        ...prev,
        specificUserIds: [...prev.specificUserIds, user.id],
      }));
    }
  };

  const handleSave = async (sendImmediately = false) => {
    if (!formData.title || !formData.subject || !formData.content) {
      setModalState({
        type: "error",
        title: "Champs manquants",
        message:
          "Veuillez remplir tous les champs obligatoires (Titre, Sujet et Contenu).",
      });
      return;
    }

    if (
      formData.targetAudience === "SPECIFIC_USERS" &&
      formData.specificUserIds.length === 0
    ) {
      setModalState({
        type: "error",
        title: "Audience vide",
        message:
          "Veuillez sélectionner au moins un utilisateur pour cette newsletter ciblée.",
      });
      return;
    }

    setSaving(true);
    try {
      const newsletter = await createNewsletter({
        ...formData,
        scheduledAt:
          isScheduled && formData.scheduledAt
            ? formData.scheduledAt
            : undefined,
      });

      if (newsletter) {
        if (sendImmediately && (!isScheduled || !formData.scheduledAt)) {
          // Envoyer directement la newsletter seulement si non programmée
          try {
            const result = await sendNewsletter(newsletter.id, true);
            if (result) {
              setModalState({
                type: "success",
                title: "Envoi réussi",
                message: `La newsletter a été envoyée avec succès à ${result.sentCount} destinataires.`,
                onConfirm: () => router.push("/super-admin/newsletters"),
              });
            }
          } catch (sendError) {
            console.error("Erreur lors de l'envoi:", sendError);
            setModalState({
              type: "error",
              title: "Erreur d'envoi",
              message:
                "La newsletter a été créée mais une erreur est survenue lors de l'envoi automatique.",
              onConfirm: () => router.push("/super-admin/newsletters"),
            });
          }
        } else if (isScheduled && formData.scheduledAt) {
          setModalState({
            type: "success",
            title: "Programmation réussie",
            message:
              "Votre newsletter a été programmée et sera envoyée à la date prévue.",
            onConfirm: () => router.push("/super-admin/newsletters"),
          });
        } else {
          // Brouillon sauvegardé
          router.push("/super-admin/newsletters");
        }
      }
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      setModalState({
        type: "error",
        title: "Erreur de sauvegarde",
        message:
          "Une erreur est survenue lors de la création de la newsletter. Veuillez réessayer.",
      });
    } finally {
      setSaving(false);
    }
  };

  const getAudienceDescription = () => {
    switch (formData.targetAudience) {
      case "ALL_USERS":
        return "Tous les utilisateurs actifs";
      case "HOSTS_ONLY":
        return "Organisateurs uniquement";
      case "PROVIDERS_ONLY":
        return "Prestataires uniquement";
      case "ADMINS_ONLY":
        return "Administrateurs uniquement";
      case "SPECIFIC_USERS":
        return `${selectedUsers.length} sélectionné(s)`;
      default:
        return "";
    }
  };

  return (
    <div className={styles.createPage}>
      {/* Header */}
      <div className={styles.createHeader}>
        <div className={styles.headerLeft}>
          <button
            className={styles.backButton}
            onClick={() => router.push("/super-admin/newsletters")}
          >
            <ArrowLeft size={18} />
            Retour
          </button>
          <div>
            <h1>Nouvelle Newsletter</h1>
            <p>Créez et envoyez une newsletter à vos utilisateurs</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.previewButton}
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye size={16} />
            {previewMode ? "Édition" : "Aperçu"}
          </button>
        </div>
      </div>

      <div className={styles.createContent}>
        {!previewMode ? (
          /* Mode Édition */
          <div className={styles.editMode}>
            <div className={styles.formSection}>
              <h3>
                <Mail size={18} /> Informations générales
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.5fr",
                  gap: "1rem",
                }}
              >
                <div className={styles.formGroup}>
                  <label>Titre (Interne) *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Ex: Mars 2024"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Sujet de l'email *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      handleInputChange("subject", e.target.value)
                    }
                    placeholder="Ex: 🚀 Nouvelles fonctionnalités Kawepla"
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3>
                  <Users size={18} /> Audience cible
                </h3>
                <div className={styles.audienceDescription}>
                  <AlertCircle size={14} />
                  <span>{getAudienceDescription()}</span>
                </div>
              </div>

              <div className={styles.audienceSelector}>
                <div className={styles.audienceOptions}>
                  {[
                    { value: "ALL_USERS", label: "Tous" },
                    { value: "HOSTS_ONLY", label: "Organisateurs" },
                    { value: "PROVIDERS_ONLY", label: "Prestataires" },
                    { value: "ADMINS_ONLY", label: "Admins" },
                    { value: "SPECIFIC_USERS", label: "Ciblé" },
                  ].map((option) => (
                    <label key={option.value} className={styles.audienceOption}>
                      <input
                        type="radio"
                        name="targetAudience"
                        value={option.value}
                        checked={formData.targetAudience === option.value}
                        onChange={(e) =>
                          handleInputChange("targetAudience", e.target.value)
                        }
                      />
                      <div className={styles.optionContent}>
                        <span>{option.label}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {formData.targetAudience === "SPECIFIC_USERS" && (
                  <div className={styles.userSelector}>
                    <div className={styles.userSelectorHeader}>
                      <div className={styles.searchBar}>
                        <Search size={16} />
                        <input
                          type="text"
                          placeholder="Rechercher..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.usersList}>
                      {targetUsers.map((user) => (
                        <label key={user.id} className={styles.userItem}>
                          <input
                            type="checkbox"
                            checked={selectedUsers.some(
                              (u) => u.id === user.id,
                            )}
                            onChange={() => handleUserToggle(user)}
                          />
                          <div className={styles.userInfo}>
                            <span className={styles.userName}>
                              {user.firstName} {user.lastName}
                            </span>
                            <span className={styles.userEmail}>
                              {user.email}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formSection}>
              <h3>Contenu</h3>

              <div className={styles.formGroup}>
                <label>Texte de la newsletter *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  placeholder="Rédigez le contenu..."
                  rows={12}
                  required
                />
              </div>

              {/* Programmation Toggle */}
              <div
                className={`${styles.programmingToggle} ${isScheduled ? styles.active : ""}`}
                onClick={() => setIsScheduled(!isScheduled)}
              >
                <div className={styles.toggleSwitch}>
                  <div className={styles.toggleCircle} />
                </div>
                <span
                  style={{
                    marginLeft: "10px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: isScheduled
                      ? "var(--admin)"
                      : "var(--text-secondary)",
                  }}
                >
                  {isScheduled
                    ? "Programmation activée"
                    : "Programmer à une date ultérieure ?"}
                </span>
              </div>

              <div
                className={`${styles.programmingContainer} ${isScheduled ? styles.visible : ""}`}
              >
                <div className={styles.formGroup}>
                  <label>Date et heure d'envoi</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) =>
                      handleInputChange("scheduledAt", e.target.value)
                    }
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Mode Aperçu */
          <div className={styles.previewMode}>
            <div className={styles.previewHeader}>
              <h3>Aperçu de la newsletter</h3>
              <div className={styles.previewMeta}>
                <span>Sujet: {formData.subject || "Sujet non défini"}</span>
                <span>Audience: {getAudienceDescription()}</span>
                {isScheduled && (
                  <span>📅 Prévu pour: {formData.scheduledAt}</span>
                )}
              </div>
            </div>

            <div className={styles.previewContent}>
              <div className={styles.emailPreview}>
                <div className={styles.emailHeader}>
                  <h2>📧 Kawepla Newsletter</h2>
                  <p>{formData.title}</p>
                </div>

                <div className={styles.emailBody}>
                  <h3>Bonjour 👋</h3>

                  <div className={styles.newsletterContent}>
                    {formData.content || "Contenu non défini"}
                  </div>

                  <div className={styles.emailFooter}>
                    <p>© 2024 Kawepla. Tous droits réservés.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={styles.formActions}>
          <button
            className={styles.cancelButton}
            onClick={() => router.push("/super-admin/newsletters")}
          >
            Annuler
          </button>

          <div className={styles.saveActions}>
            <button
              className={styles.saveButton}
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              <Save size={16} />
              {saving ? "Sauvegarde..." : "Brouillon"}
            </button>

            <button
              className={styles.sendButton}
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              <Send size={16} />
              {isScheduled ? "Programmer" : "Envoyer"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Modals de feedback */}
      <SuccessModal
        isOpen={modalState.type === "success"}
        onClose={() => {
          setModalState((prev) => ({ ...prev, type: null }));
          if (modalState.onConfirm) modalState.onConfirm();
        }}
        title={modalState.title}
        message={modalState.message}
        confirmText="Continuer"
      />

      <ErrorModal
        isOpen={modalState.type === "error"}
        onClose={() => {
          setModalState((prev) => ({ ...prev, type: null }));
          if (modalState.onConfirm) modalState.onConfirm();
        }}
        title={modalState.title}
        message={modalState.message}
        confirmText="OK"
      />
    </div>
  );
}
