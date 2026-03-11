"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDesigns } from "@/hooks/useDesigns";
import { HeaderMobile } from "@/components/HeaderMobile/HeaderMobile";
import { Design } from "@/types";
import DesignPreview from "@/components/DesignPreview";
import {
  Palette,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Crown,
  Power,
  PowerOff,
  ChevronDown,
  Layout,
  User,
} from "lucide-react";
import { deleteFromFirebase } from "@/lib/firebase";
import styles from "./design.module.css";

export default function SuperAdminDesignPage() {
  const router = useRouter();
  const {
    designs,
    loading,
    error,
    updateDesign,
    deleteDesign,
    toggleDesignStatus,
  } = useDesigns();
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [deletingDesignId, setDeletingDesignId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"templates" | "personalized">(
    "templates",
  );

  // Filtrer les designs en fonction de la recherche et du filtre
  const filteredDesigns = designs.filter((design) => {
    // Filtre par recherche
    const searchMatch =
      searchTerm === "" ||
      design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      design.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      design.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    // Filtre par type (View Mode)
    const viewModeMatch =
      viewMode === "templates" ? design.isTemplate : !design.isTemplate;

    // Filtre par type
    const filterMatch =
      selectedFilter === "all" ||
      (selectedFilter === "active" && design.isActive) ||
      (selectedFilter === "inactive" && !design.isActive) ||
      (selectedFilter === "free" && design.priceType === "FREE") ||
      (selectedFilter === "paid" && design.priceType !== "FREE");

    return searchMatch && filterMatch && viewModeMatch;
  });

  // Options pour le filtre
  const filterOptions = [
    { value: "all", label: "Tous les statuts" },
    { value: "active", label: "Actifs uniquement" },
    { value: "inactive", label: "Inactifs uniquement" },
    { value: "free", label: "Designs Gratuits" },
    { value: "paid", label: "Designs Premium" },
  ];

  const handleDeleteDesign = async (designId: string) => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir supprimer ce design ? Cette action est irréversible.",
      )
    ) {
      try {
        setDeletingDesignId(designId);
        const design = designs.find((d) => d.id === designId);

        // Supprimer le design de la base de données
        await deleteDesign(designId);

        // Si succès, nettoyer les images de Firebase
        if (design) {
          if (
            design.thumbnail &&
            design.thumbnail.includes("firebasestorage")
          ) {
            try {
              await deleteFromFirebase(design.thumbnail);
            } catch (e) {
              console.error("Erreur suppression thumbnail:", e);
            }
          }
          if (
            design.previewImage &&
            design.previewImage !== design.thumbnail &&
            design.previewImage.includes("firebasestorage")
          ) {
            try {
              await deleteFromFirebase(design.previewImage);
            } catch (e) {
              console.error("Erreur suppression preview:", e);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du design:", error);
        alert("Erreur lors de la suppression du design. Veuillez réessayer.");
      } finally {
        setDeletingDesignId(null);
      }
    }
  };

  const handleToggleStatus = async (designId: string) => {
    try {
      const design = designs.find((d) => d.id === designId);
      if (design) {
        await toggleDesignStatus(designId, !design.isActive);
      }
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
    }
  };

  const handlePreviewDesign = (design: Design) => {
    setSelectedDesign(design);
    setShowPreviewModal(true);
  };

  const handleEditDesign = (designId: string) => {
    router.push(`/super-admin/design/create-canva?id=${designId}`);
  };

  if (loading) {
    return (
      <div className={styles.designPage}>
        <HeaderMobile title="Designs" showBackButton={false} />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement de votre bibliothèque de designs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.designPage}>
        <HeaderMobile title="Designs" showBackButton={false} />
        <div className={styles.errorContainer}>
          <p>Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.designPage}>
      <HeaderMobile title="Designs" showBackButton={false} />

      <div className={styles.pageContent}>
        {/* Actions bar */}
        <div className={styles.pageHeader}>
          <button
            onClick={() => router.push("/super-admin/design/create-canva")}
            className={styles.createButton}
          >
            <Plus size={20} />
            Créer un design
          </button>
        </div>

        {/* View Mode Tabs */}
        <div className={styles.viewModeContainer}>
          <button
            className={`${styles.viewModeButton} ${
              viewMode === "templates" ? styles.active : ""
            }`}
            onClick={() => setViewMode("templates")}
          >
            <Layout
              size={16}
              style={{
                display: "inline",
                marginRight: 8,
                verticalAlign: "text-bottom",
              }}
            />
            Modèles d&apos;invitations
          </button>
          <button
            className={`${styles.viewModeButton} ${
              viewMode === "personalized" ? styles.active : ""
            }`}
            onClick={() => setViewMode("personalized")}
          >
            <User
              size={16}
              style={{
                display: "inline",
                marginRight: 8,
                verticalAlign: "text-bottom",
              }}
            />
            Designs Clients
          </button>
        </div>

        {/* Filters Bento */}
        <div className={styles.filtersContainer}>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher par nom, tag ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterContainer}>
            <Filter className={styles.filterIcon} />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className={styles.filterSelect}
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--text-secondary)",
              }}
            />
          </div>
        </div>

        {/* Designs Modern Grid */}
        <div className={styles.designsGrid}>
          {filteredDesigns.map((design) => (
            <div key={design.id} className={styles.designCard}>
              {/* Premium Badge */}
              {design.priceType && design.priceType !== "FREE" && (
                <div className={styles.premiumBadge}>
                  <Crown size={12} />
                  {design.priceType}
                </div>
              )}

              {/* Preview with quality Feel */}
              <div className={styles.previewContainer}>
                <DesignPreview
                  design={design}
                  width={250}
                  height={320}
                  className={styles.previewContent}
                />
              </div>

              {/* Sophisticated Info */}
              <div className={styles.designInfo}>
                <h3 className={styles.designTitle}>{design.name}</h3>

                <p className={styles.designDescription}>{design.description}</p>

                <div className={styles.badgesFlex}>
                  {design.priceType && design.priceType !== "FREE" && (
                    <span className={styles.priceBadge}>
                      💎 {design.priceType}
                    </span>
                  )}
                  {design.isTemplate ? (
                    <span className={styles.templateBadge}>🎨 MODÈLE</span>
                  ) : (
                    <span className={styles.personalizedBadge}>👤 CLIENT</span>
                  )}
                  {design.isActive ? (
                    <span
                      className={styles.priceBadge}
                      style={{
                        background: "rgba(16, 185, 129, 0.1)",
                        color: "#10B981",
                      }}
                    >
                      ACTIF
                    </span>
                  ) : (
                    <span
                      className={styles.priceBadge}
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "#EF4444",
                      }}
                    >
                      OFF
                    </span>
                  )}
                </div>

                {design.tags && design.tags.length > 0 && (
                  <div className={styles.tagsContainer}>
                    {design.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className={styles.tag}>
                        #{tag}
                      </span>
                    ))}
                    {design.tags.length > 3 && (
                      <span className={styles.tag}>
                        +{design.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions Bento Grid */}
                <div className={styles.actionsContainer}>
                  <button
                    onClick={() => handlePreviewDesign(design)}
                    className={styles.previewButton}
                    title="Agrandir l'aperçu"
                  >
                    <Eye size={14} /> Aperçu
                  </button>

                  <button
                    onClick={() => handleEditDesign(design.id)}
                    className={styles.editButton}
                    title="Modifier dans Canva"
                  >
                    <Edit size={14} /> Éditer
                  </button>

                  <button
                    onClick={() => handleToggleStatus(design.id)}
                    className={styles.toggleButton}
                    title={
                      design.isActive
                        ? "Désactiver le design"
                        : "Activer le design"
                    }
                  >
                    {design.isActive ? (
                      <>
                        <PowerOff size={14} /> OFF
                      </>
                    ) : (
                      <>
                        <Power size={14} /> ON
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteDesign(design.id)}
                    disabled={deletingDesignId === design.id}
                    className={styles.deleteButton}
                    title="Supprimer définitivement"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDesigns.length === 0 && (
          <div className={styles.emptyState}>
            <Palette size={64} />
            <h3>Aucun design trouvé</h3>
            <p>
              {searchTerm || selectedFilter !== "all"
                ? "Aucun résultat pour cette recherche. Essayez d'autres mots-clés."
                : "Votre bibliothèque est vide. Créez votre premier modèle d'invitation dès maintenant !"}
            </p>
          </div>
        )}

        {/* Clean Modal for Preview */}
        {showPreviewModal && selectedDesign && (
          <div
            className={styles.modal}
            onClick={() => setShowPreviewModal(false)}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>{selectedDesign.name}</h2>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowPreviewModal(false)}
                >
                  ×
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.modalPreviewContainer}>
                  <DesignPreview
                    design={selectedDesign}
                    width={500}
                    height={700}
                    className={styles.fullPreview}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
