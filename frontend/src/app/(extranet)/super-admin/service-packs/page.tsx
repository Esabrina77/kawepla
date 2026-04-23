"use client";

import { useEffect, useMemo, useState } from "react";
import { HeaderMobile } from "@/components/HeaderMobile";
import {
  servicePackApi,
  ServicePackPayload,
  ServicePackResponse,
  ServicePackType,
  ServiceTier,
} from "@/lib/api/servicePacks";
import { useModals } from "@/components/ui/modal-provider";
import styles from "./service-packs.module.css";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Package,
  Layers,
  Sparkles,
  ChevronRight,
  Check,
} from "lucide-react";

const tiers: ServiceTier[] = [
  "FREE",
  "ESSENTIAL",
  "ELEGANT",
  "PREMIUM",
  "LUXE",
];
const addonUnits = [
  { value: "GUEST", label: "Invités" },
  { value: "PHOTO", label: "Photos" },
  { value: "DESIGN", label: "Designs" },
  { value: "AI_REQUEST", label: "Requêtes IA" },
];

const defaultPayload: ServicePackPayload = {
  slug: "",
  name: "",
  description: "",
  type: "BASE",
  tier: "FREE",
  price: 0,
  currency: "EUR",
  features: [],
  invitations: 0,
  guests: 0,
  photos: 0,
  designs: 0,
  aiRequests: 0,
  quantity: null,
  unit: null,
  isHighlighted: false,
  isActive: true,
  sortOrder: 0,
};

export default function ServicePacksAdminPage() {
  const { showAlert, showConfirm } = useModals();
  const [basePacks, setBasePacks] = useState<ServicePackResponse[]>([]);
  const [addonPacks, setAddonPacks] = useState<ServicePackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServicePackPayload>(defaultPayload);
  const [editingPack, setEditingPack] = useState<ServicePackResponse | null>(
    null,
  );
  const [formType, setFormType] = useState<ServicePackType>("BASE");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bases, addons] = await Promise.all([
        servicePackApi.list("BASE"),
        servicePackApi.list("ADDON"),
      ]);
      setBasePacks(bases);
      setAddonPacks(addons);
    } catch (err) {
      console.error("Erreur chargement packs:", err);
      setError("Impossible de charger les packs.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (type: ServicePackType) => {
    setEditingPack(null);
    setFormType(type);
    setFormData({
      ...defaultPayload,
      type,
      tier: type === "BASE" ? "FREE" : null,
      price: type === "BASE" ? 0 : 10,
    });
    // Scroll to form on mobile
    if (window.innerWidth < 1200) {
      document
        .querySelector(`.${styles.formSection}`)
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleEdit = (pack: ServicePackResponse) => {
    setEditingPack(pack);
    setFormType(pack.type);
    setFormData({
      slug: pack.slug,
      name: pack.name,
      description: pack.description || "",
      type: pack.type,
      tier: pack.tier || null,
      price: pack.price,
      currency: pack.currency || "EUR",
      features: pack.features || [],
      invitations: pack.invitations ?? 0,
      guests: pack.guests ?? 0,
      photos: pack.photos ?? 0,
      designs: pack.designs ?? 0,
      aiRequests: pack.aiRequests ?? 0,
      quantity: pack.quantity ?? 0,
      unit: pack.unit ?? null,
      isHighlighted: pack.isHighlighted ?? false,
      isActive: pack.isActive ?? true,
      sortOrder: pack.sortOrder ?? 0,
    });
    // Scroll to form on mobile
    if (window.innerWidth < 1200) {
      document
        .querySelector(`.${styles.formSection}`)
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleChange = (field: keyof ServicePackPayload, value: any) => {
    if (field === "features" && typeof value === "string") {
      setFormData((prev) => ({
        ...prev,
        features: value
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingPack) {
        await servicePackApi.update(editingPack.id, formData);
      } else {
        await servicePackApi.create(formData);
      }
      await loadPacks();
      resetForm(formType);
    } catch (err) {
      console.error("Erreur sauvegarde pack:", err);
      showAlert(
        "Erreur de sauvegarde",
        "Impossible de sauvegarder le pack. Vérifiez le slug (doit être unique).",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (pack: ServicePackResponse) => {
    const confirmed = await showConfirm(
      "Supprimer le pack",
      `Êtes-vous sûr de vouloir supprimer le pack "${pack.name}" ?`
    );
    if (!confirmed) return;
    try {
      await servicePackApi.remove(pack.id);
      await loadPacks();
    } catch (err) {
      console.error("Erreur suppression pack:", err);
      showAlert(
        "Suppression impossible",
        "Une erreur est survenue lors de la suppression. Vérifiez si des utilisateurs utilisent ce pack.",
        "error"
      );
    }
  };

  const featureTextareaValue = useMemo(
    () => (formData.features || []).join("\n"),
    [formData.features],
  );

  return (
    <div className={styles.page}>
      <HeaderMobile title="Gestion des tarifs" />

      <div className={styles.pageHeader}>
        <div>
          <h1>Packs & Tarifs</h1>
          <p>Configurez les offres et options de personnalisation.</p>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={loadPacks}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.grid}>
        <section className={styles.listSection}>
          {/* Base Packs */}
          <div className={styles.sectionHeader}>
            <h2>
              <Package size={18} /> Offres principales
            </h2>
            <button
              className={styles.primaryBtn}
              onClick={() => resetForm("BASE")}
            >
              <Plus size={16} /> Créer
            </button>
          </div>

          <div className={styles.cardList}>
            {loading && basePacks.length === 0 ? (
              <p className={styles.placeholder}>Recherche des offres...</p>
            ) : basePacks.length === 0 ? (
              <p className={styles.placeholder}>
                Aucune offre de base configurée.
              </p>
            ) : (
              basePacks.map((pack) => (
                <article key={pack.id} className={styles.packCard}>
                  <div className={styles.packInfo}>
                    <p className={styles.packName}>{pack.name}</p>
                    <p className={styles.packMeta}>
                      <span>
                        {pack.price.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: pack.currency || "EUR",
                        })}
                      </span>
                      <ChevronRight size={12} opacity={0.5} />
                      <span>{pack.tier}</span>
                      {!pack.isActive && (
                        <span style={{ color: "#EF4444", marginLeft: "auto" }}>
                          Masqué
                        </span>
                      )}
                    </p>
                    <p className={styles.packDescription}>{pack.description}</p>
                  </div>
                  <div className={styles.cardActions}>
                    <button onClick={() => handleEdit(pack)} title="Modifier">
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(pack)}
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Addons */}
          <div className={styles.sectionHeader} style={{ marginTop: "2rem" }}>
            <h2>
              <Layers size={18} /> Options (Add-ons)
            </h2>
            <button
              className={styles.secondaryBtn}
              onClick={() => resetForm("ADDON")}
            >
              <Plus size={16} /> Ajouter
            </button>
          </div>

          <div className={styles.cardList}>
            {loading && addonPacks.length === 0 ? (
              <p className={styles.placeholder}>Recherche des options...</p>
            ) : addonPacks.length === 0 ? (
              <p className={styles.placeholder}>
                Aucune option additionnelle configurée.
              </p>
            ) : (
              addonPacks.map((pack) => (
                <article key={pack.id} className={styles.packCard}>
                  <div className={styles.packInfo}>
                    <p className={styles.packName}>{pack.name}</p>
                    <p className={styles.packMeta}>
                      <span>
                        {pack.price.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: pack.currency || "EUR",
                        })}
                      </span>
                      <ChevronRight size={12} opacity={0.5} />
                      <span>
                        {pack.quantity} {pack.unit?.toLowerCase()}
                      </span>
                      {!pack.isActive && (
                        <span style={{ color: "#EF4444", marginLeft: "auto" }}>
                          Masqué
                        </span>
                      )}
                    </p>
                    <p className={styles.packDescription}>{pack.description}</p>
                  </div>
                  <div className={styles.cardActions}>
                    <button onClick={() => handleEdit(pack)} title="Modifier">
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(pack)}
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h2>
              <Sparkles size={18} />{" "}
              {editingPack ? "Éditer le pack" : "Configuration"}
            </h2>
            {editingPack && (
              <button
                className={styles.secondaryBtn}
                onClick={() => resetForm(formType)}
                style={{ padding: "0.3rem 0.6rem" }}
              >
                Annuler
              </button>
            )}
          </div>

          <form className={styles.packForm} onSubmit={handleSubmit}>
            <div className={styles.formGroupRow}>
              <div className={styles.formGroup}>
                <label>Nom de l'offre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  placeholder="ex: Pack Premium"
                />
              </div>
              <div className={styles.formGroup}>
                <label>ID Unique (Slug)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  required
                  placeholder="ex: premium"
                  disabled={!!editingPack}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Description courte</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={2}
                placeholder="Décrivez brièvement l'offre..."
              />
            </div>

            <div className={styles.formGroupRow}>
              {formType === "BASE" ? (
                <div className={styles.formGroup}>
                  <label>Niveau (Tier)</label>
                  <select
                    value={formData.tier || "FREE"}
                    onChange={(e) =>
                      handleChange("tier", e.target.value as ServiceTier)
                    }
                  >
                    {tiers.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className={styles.formGroup}>
                  <label>Unité de mesure</label>
                  <select
                    value={formData.unit || "GUEST"}
                    onChange={(e) => handleChange("unit", e.target.value)}
                  >
                    {addonUnits.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className={styles.formGroup}>
                <label>Tarif (€)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    handleChange("price", parseFloat(e.target.value))
                  }
                  required
                />
              </div>
            </div>

            {formType === "ADDON" && (
              <div className={styles.formGroup}>
                <label>Quantité incluse</label>
                <input
                  type="number"
                  min={1}
                  value={formData.quantity ?? 0}
                  onChange={(e) =>
                    handleChange("quantity", parseInt(e.target.value, 10))
                  }
                  placeholder="ex: 50"
                />
              </div>
            )}

            {formType === "BASE" && (
              <div className={styles.formGroup}>
                <label>Limites & Quotas</label>
                <div className={styles.formGroupGrid}>
                  <div className={styles.formGroup}>
                    <label style={{ fontSize: "0.65rem" }}>Invints</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.invitations ?? 0}
                      onChange={(e) =>
                        handleChange(
                          "invitations",
                          parseInt(e.target.value, 10),
                        )
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label style={{ fontSize: "0.65rem" }}>Invités</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.guests ?? 0}
                      onChange={(e) =>
                        handleChange("guests", parseInt(e.target.value, 10))
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label style={{ fontSize: "0.65rem" }}>Photos</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.photos ?? 0}
                      onChange={(e) =>
                        handleChange("photos", parseInt(e.target.value, 10))
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label style={{ fontSize: "0.65rem" }}>Designs</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.designs ?? 0}
                      onChange={(e) =>
                        handleChange("designs", parseInt(e.target.value, 10))
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label style={{ fontSize: "0.65rem" }}>IA</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.aiRequests ?? 0}
                      onChange={(e) =>
                        handleChange("aiRequests", parseInt(e.target.value, 10))
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            <div className={styles.formGroup}>
              <label>Avantages (features)</label>
              <textarea
                rows={3}
                value={featureTextareaValue}
                onChange={(e) => handleChange("features", e.target.value)}
                placeholder="Un avantage par ligne..."
              />
            </div>

            <div className={styles.formGroupRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isHighlighted}
                  onChange={(e) =>
                    handleChange("isHighlighted", e.target.checked)
                  }
                />
                Mise en avant
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                />
                Pack actif
              </label>
            </div>

            <div className={styles.formGroup}>
              <label>Priorité d'affichage (Tri)</label>
              <input
                type="number"
                value={formData.sortOrder ?? 0}
                onChange={(e) =>
                  handleChange("sortOrder", parseInt(e.target.value, 10))
                }
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting}
            >
              {submitting ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    justifyContent: "center",
                  }}
                >
                  <RefreshCw size={16} className="animate-spin" />
                  Synchronisation...
                </div>
              ) : editingPack ? (
                "Enregistrer les modifications"
              ) : (
                "Créer l'offre"
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
