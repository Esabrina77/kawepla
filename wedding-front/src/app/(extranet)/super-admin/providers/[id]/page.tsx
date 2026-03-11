/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { providersApi, ProviderProfile } from "@/lib/api/providers";
import { HeaderMobile } from "@/components/HeaderMobile";
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Pause,
  Camera,
  Users,
  Clock as ClockIcon,
  LayoutGrid,
  ChevronLeft,
} from "lucide-react";
import {
  WebsiteIcon,
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
} from "@/components/icons/SocialIcons";
import styles from "./provider-detail.module.css";

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.id as string;

  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (providerId) {
      loadProvider();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  const loadProvider = async () => {
    try {
      setLoading(true);
      setError(null);

      // Pour l'instant, on récupère depuis la liste
      const response = await providersApi.getAllProviders({ limit: 1000 });
      const foundProvider = response.providers.find((p) => p.id === providerId);

      if (!foundProvider) {
        throw new Error("Provider non trouvé");
      }

      setProvider(foundProvider);
    } catch (err) {
      console.error("Erreur chargement provider:", err);
      setError("Erreur lors du chargement du prestataire");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    action: "approve" | "reject" | "suspend",
  ) => {
    if (!provider) return;

    try {
      setActionLoading(action);

      let response;
      switch (action) {
        case "approve":
          response = await providersApi.approveProvider(provider.id);
          break;
        case "reject":
          response = await providersApi.rejectProvider(provider.id);
          break;
        case "suspend":
          response = await providersApi.suspendProvider(provider.id);
          break;
      }

      setProvider(response.provider);
    } catch (err) {
      console.error(`Erreur ${action}:`, err);
      setError(`Erreur lors de l'action: ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          label: "Vérifié & Approuvé",
          color: "#10B981",
          icon: CheckCircle,
        };
      case "PENDING":
        return {
          label: "Attente de validation",
          color: "#F59E0B",
          icon: Clock,
        };
      case "SUSPENDED":
        return { label: "Compte Suspendu", color: "#EF4444", icon: Pause };
      case "REJECTED":
        return { label: "Demande Rejetée", color: "#6B7280", icon: XCircle };
      default:
        return { label: "Inconnu", color: "#9CA3AF", icon: AlertTriangle };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={styles.providerDetail}>
        <HeaderMobile title="Profil Prestataire" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className={styles.providerDetail}>
        <HeaderMobile title="Profil Prestataire" />
        <div className={styles.errorContainer}>
          <AlertTriangle size={48} color="#EF4444" />
          <h2>Erreur de chargement</h2>
          <p>{error || "Ce prestataire est introuvable ou n'existe plus."}</p>
          <button onClick={() => router.back()} className={styles.backButton}>
            <ChevronLeft size={18} />
            Retourner à la liste
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(provider.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className={styles.providerDetail}>
      <HeaderMobile
        title={provider.businessName || "Profil Prestataire"}
        onBack={() => router.push("/super-admin/providers")}
      />

      <div className={styles.pageContent}>
        {/* Header avec Statut */}
        <div className={styles.pageHeader}>
          <div
            className={styles.statusBadge}
            style={{
              color: statusInfo.color,
              borderColor: `color-mix(in srgb, ${statusInfo.color} 30%, var(--border))`,
            }}
          >
            <StatusIcon size={14} />
            {statusInfo.label}
          </div>
        </div>

        <div className={styles.content}>
          {/* Bloc Principal: Profil & Stats */}
          <section className={styles.mainInfo}>
            <div className={styles.profileSection}>
              <div className={styles.profilePhoto}>
                {provider.profilePhoto ? (
                  <img
                    src={provider.profilePhoto}
                    alt={provider.businessName}
                  />
                ) : (
                  <div className={styles.photoPlaceholder}>
                    <Camera size={32} />
                  </div>
                )}
              </div>

              <div className={styles.profileInfo}>
                <span className={styles.category}>
                  {provider.category?.icon || "🏢"}{" "}
                  {provider.category?.name || "Prestataire"}
                </span>
                <h2>{provider.businessName}</h2>

                <div className={styles.profileMeta}>
                  <div className={styles.location}>
                    <MapPin size={16} />
                    {provider.displayCity}
                  </div>
                  <div className={styles.contact}>
                    <Phone size={16} />
                    {provider.phone || "Non renseigné"}
                  </div>
                </div>

                <div className={styles.socialLinks}>
                  {provider.website && (
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      title="Site web"
                    >
                      <WebsiteIcon size={18} />
                    </a>
                  )}
                  {provider.instagram && (
                    <a
                      href={provider.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      title="Instagram"
                    >
                      <InstagramIcon size={18} />
                    </a>
                  )}
                  {provider.tiktok && (
                    <a
                      href={provider.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      title="TikTok"
                    >
                      <TikTokIcon size={18} />
                    </a>
                  )}
                  {provider.facebook && (
                    <a
                      href={provider.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      title="Facebook"
                    >
                      <FacebookIcon size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.statsSection}>
              <div className={styles.statItem}>
                <Star size={20} fill="currentColor" />
                <div>
                  <h3>{provider.rating.toFixed(1)} / 5</h3>
                  <p>{provider.reviewCount} avis clients</p>
                </div>
              </div>

              <div className={styles.statItem}>
                <Calendar size={20} />
                <div>
                  <h3>{formatDate(provider.createdAt)}</h3>
                  <p>Inscrit sur Kawepla</p>
                </div>
              </div>
            </div>
          </section>

          {/* Bloc de Gauche: Description, Portfolio, Services */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            {provider.description && (
              <section className={styles.descriptionSection}>
                <h3>À propos du professionnel</h3>
                <p>{provider.description}</p>
              </section>
            )}

            {provider.portfolio && provider.portfolio.length > 0 && (
              <section className={styles.portfolioSection}>
                <h3>Portfolio Réalisations</h3>
                <div className={styles.portfolioGrid}>
                  {provider.portfolio.map((photo, index) => (
                    <div key={index} className={styles.portfolioItem}>
                      <img src={photo} alt={`Portfolio ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {provider.services && provider.services.length > 0 && (
              <section className={styles.servicesSection}>
                <h3>Prestations & Tarifs</h3>
                <div className={styles.servicesList}>
                  {provider.services.map((service) => (
                    <div key={service.id} className={styles.serviceItem}>
                      <div className={styles.serviceHeader}>
                        <h4>{service.name}</h4>
                        <span className={styles.servicePrice}>
                          {service.priceType === "FIXED"
                            ? `${service.price}€`
                            : service.priceType === "PER_HOUR"
                              ? `${service.price}€/h`
                              : service.priceType === "PER_PERSON"
                                ? `${service.price}€/pers`
                                : "Sur devis"}
                        </span>
                      </div>

                      {service.description && (
                        <p className={styles.serviceDescription}>
                          {service.description}
                        </p>
                      )}

                      <div className={styles.serviceDetails}>
                        {service.duration && (
                          <div className={styles.serviceDetail}>
                            <ClockIcon size={14} />
                            <span>{service.duration} min</span>
                          </div>
                        )}

                        {service.capacity && (
                          <div className={styles.serviceDetail}>
                            <Users size={14} />
                            <span>Capacité: {service.capacity}</span>
                          </div>
                        )}

                        {service.isActive ? (
                          <span className={styles.activeStatus}>✓ Active</span>
                        ) : (
                          <span className={styles.inactiveStatus}>
                            ⏸ Programmée
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Bloc de Droite (Sticky): Actions Panel */}
          <aside className={styles.actionsSection}>
            <h3>Gestion Administrative</h3>
            <div className={styles.actionButtons}>
              {provider.status !== "APPROVED" && (
                <button
                  onClick={() => handleStatusChange("approve")}
                  disabled={!!actionLoading}
                  className={styles.approveButton}
                >
                  {actionLoading === "approve" ? (
                    <div className={styles.loadingSpinner}></div>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Approuver le Profil
                    </>
                  )}
                </button>
              )}

              {provider.status !== "SUSPENDED" && (
                <button
                  onClick={() => handleStatusChange("suspend")}
                  disabled={!!actionLoading}
                  className={styles.suspendButton}
                >
                  {actionLoading === "suspend" ? (
                    <div className={styles.loadingSpinner}></div>
                  ) : (
                    <>
                      <Pause size={18} />
                      Suspendre l&apos;Accès
                    </>
                  )}
                </button>
              )}

              {provider.status !== "REJECTED" && (
                <button
                  onClick={() => handleStatusChange("reject")}
                  disabled={!!actionLoading}
                  className={styles.rejectButton}
                >
                  {actionLoading === "reject" ? (
                    <div className={styles.loadingSpinner}></div>
                  ) : (
                    <>
                      <XCircle size={18} />
                      Rejeter la Demande
                    </>
                  )}
                </button>
              )}

              <button
                className={styles.backButtonLink}
                onClick={() => router.push("/super-admin/providers")}
              >
                <ChevronLeft size={18} />
                Retourner à la liste
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
