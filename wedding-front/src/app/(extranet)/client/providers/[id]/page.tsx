"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProviderProfile, Service } from "@/lib/api/providers";
import { useProviderDetail } from "@/hooks/useProviderDetail";
import { HeaderMobile } from "@/components/HeaderMobile";
import {
  MapPin,
  Phone,
  Calendar,
  Star,
  Clock,
  Users,
  Camera,
  Briefcase,
  CheckCircle,
  MessageCircle,
  Heart,
  Share2,
  Music,
  UtensilsCrossed,
  Flower2,
  Palette,
  Building2,
  ChevronRight,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import {
  WebsiteIcon,
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
} from "@/components/icons/SocialIcons";
import { useToast } from "@/components/ui/toast";
import styles from "./provider-detail.module.css";

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.id as string;
  const { addToast } = useToast();

  const { provider, services, loading, error } = useProviderDetail(providerId);
  const [activeTab, setActiveTab] = useState<
    "services" | "portfolio" | "reviews"
  >("services");
  const [isFavorite, setIsFavorite] = useState(false);

  const formatPrice = (price: number, priceType: string) => {
    switch (priceType) {
      case "FIXED":
        return `${price}€`;
      case "PER_HOUR":
        return `${price}€/h`;
      case "PER_PERSON":
        return `${price}€/pers`;
      case "CUSTOM":
        return "Sur devis";
      default:
        return `${price}€`;
    }
  };

  const getCategoryIcon = (categoryName?: string) => {
    const icons: Record<string, React.ReactNode> = {
      Traiteur: <UtensilsCrossed size={14} />,
      Photographe: <Camera size={14} />,
      DJ: <Music size={14} />,
      Fleuriste: <Flower2 size={14} />,
      Décoration: <Palette size={14} />,
    };
    return icons[categoryName || ""] || <Building2 size={14} />;
  };

  const handleContact = () => {
    router.push(`/client/providers/discussions?providerId=${providerId}`);
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implémenter l'API pour les favoris
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: provider?.businessName,
        text: `Découvrez ${provider?.businessName}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast({
        type: "success",
        title: "Lien copié",
        message: "Le lien a été copié dans le presse-papiers",
      });
    }
  };

  if (loading) {
    return (
      <div className={styles.providerDetailPage}>
        <HeaderMobile title="Détails du prestataire" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingSpinner}></div>
            <p>Chargement du profil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className={styles.providerDetailPage}>
        <HeaderMobile title="Détails du prestataire" />
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <h2>❌ Erreur</h2>
            <p>{error || "Prestataire non trouvé"}</p>
            <button onClick={() => router.back()} className={styles.backButton}>
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculer le prix minimum si disponible
  const minPrice =
    services.length > 0
      ? Math.min(...services.map((s) => s.price).filter((p) => p > 0))
      : 0;

  return (
    <div className={styles.providerDetailPage}>
      {/* Immersive Vitrine Hero */}
      <section className={styles.heroSection}>
        <div className={styles.providerCover}>
          <img
            src={
              provider.profilePhoto ||
              "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop"
            }
            alt={provider.businessName}
            loading="eager"
          />
        </div>
        <div className={styles.heroOverlay} />

        {/* Navigation & Status - Anchored to Hero Top */}
        <button className={styles.backButton} onClick={() => router.back()}>
          <ArrowLeft size={24} />
        </button>

        <div className={styles.categoryBadge}>
          {getCategoryIcon(provider.category?.name)}
          <span>{provider.category?.name || "Artisan d'Exception"}</span>
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.providerName}>{provider.businessName}</h1>

          {/* Integrated Credentials Box */}
          <div className={styles.metaDimmedBox}>
            <p className={styles.providerDescription}>
              {provider.description ||
                "Une expérience d'exception pour sublimer votre plus beau jour. Un savoir-faire unique dédié à la création de moments inoubliables."}
            </p>

            <div className={styles.metaGrid}>
              {/* Ratings Segment */}
              <div className={styles.metaInfoGroup}>
                <span className={styles.metaLabel}>Note & Avis</span>
                <div className={styles.metaValue}>
                  <div className={styles.ratingStars}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        fill={
                          i < Math.floor(provider.rating)
                            ? "currentColor"
                            : "none"
                        }
                        stroke={
                          i < Math.floor(provider.rating)
                            ? "currentColor"
                            : "rgba(255,255,255,0.4)"
                        }
                      />
                    ))}
                  </div>
                  <span>{provider.rating.toFixed(1)}</span>
                  <span style={{ opacity: 0.6, fontSize: "0.85rem" }}>
                    ({provider.reviewCount})
                  </span>
                </div>
              </div>

              {/* Location Segment */}
              <div className={styles.metaInfoGroup}>
                <span className={styles.metaLabel}>Localisation</span>
                <div className={styles.metaValue}>
                  <MapPin size={20} style={{ color: "var(--primary)" }} />
                  <span>{provider.displayCity}</span>
                </div>
              </div>

              {/* Integrated Social Segment */}
              {(provider.website ||
                provider.instagram ||
                provider.facebook) && (
                <div className={styles.metaInfoGroup}>
                  <span className={styles.metaLabel}>
                    Retrouver son Univers
                  </span>
                  <div className={styles.integratedSocials}>
                    {provider.instagram && (
                      <a
                        href={provider.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialIconLink}
                        title="Instagram"
                      >
                        <InstagramIcon size={20} />
                      </a>
                    )}
                    {provider.facebook && (
                      <a
                        href={provider.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialIconLink}
                        title="Facebook"
                      >
                        <FacebookIcon size={20} />
                      </a>
                    )}
                    {provider.website && (
                      <a
                        href={provider.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialIconLink}
                        title="Site Internet"
                      >
                        <WebsiteIcon size={20} />
                      </a>
                    )}
                    {provider.tiktok && (
                      <a
                        href={provider.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialIconLink}
                        title="TikTok"
                      >
                        <TikTokIcon size={20} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Action Command Center */}
      <div className={styles.actionPanelContainer}>
        <div className={styles.actionPanel}>
          <div className={styles.actionContent}>
            <div className={styles.statGroup}>
              <span className={styles.statValue}>{provider.bookingCount}</span>
              <span className={styles.statLabel}>
                {provider.bookingCount > 1 ? "Expériences" : "Expérience"}
              </span>
            </div>
            <div className={styles.statGroup}>
              <span className={styles.statValue}>{services.length}</span>
              <span className={styles.statLabel}>
                {services.length > 1 ? "Prestations" : "Prestation"}
              </span>
            </div>
            {minPrice > 0 && (
              <div className={styles.statGroup}>
                <span className={styles.statValue}>{minPrice}€</span>
                <span className={styles.statLabel}>Tarif dès</span>
              </div>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <button className={styles.contactButton} onClick={handleContact}>
              Entrer en contact
            </button>
            <button
              className={`${styles.circleActionBtn} ${isFavorite ? styles.favoriteActive : ""}`}
              onClick={handleFavorite}
            >
              <Heart size={22} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <button className={styles.circleActionBtn} onClick={handleShare}>
              <Share2 size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={styles.tabNavContainer}>
        <nav className={styles.tabNav}>
          <button
            className={`${styles.tabBtn} ${activeTab === "services" ? styles.active : ""}`}
            onClick={() => setActiveTab("services")}
          >
            Prestations
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "portfolio" ? styles.active : ""}`}
            onClick={() => setActiveTab("portfolio")}
          >
            Portfolio
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "reviews" ? styles.active : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Avis
          </button>
        </nav>
      </div>

      {/* Content Panels */}
      <div className={styles.tabContent}>
        {activeTab === "services" && (
          <div className={styles.servicesGrid}>
            {services.length > 0 ? (
              services.map((service) => (
                <div key={service.id} className={styles.serviceCard}>
                  <div className={styles.serviceHeader}>
                    <h3 className={styles.serviceName}>{service.name}</h3>
                    <div className={styles.servicePrice}>
                      {formatPrice(service.price, service.priceType)}
                    </div>
                  </div>
                  <p className={styles.serviceDesc}>
                    {service.description ||
                      "Une prestation d'exception sur mesure pour votre événement."}
                  </p>
                  <div className={styles.serviceMeta}>
                    {service.duration && (
                      <div className={styles.metaItem}>
                        <Clock size={16} />
                        <span>{service.duration} min</span>
                      </div>
                    )}
                    <div className={styles.metaItem}>
                      <CheckCircle size={16} style={{ color: "#10b981" }} />
                      <span>Disponible</span>
                    </div>
                  </div>
                  <button
                    className={styles.contactButton}
                    style={{ width: "100%", marginTop: "auto" }}
                    onClick={handleContact}
                  >
                    Commander
                  </button>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIconWrapper}>
                  <MessageCircle size={40} />
                </div>
                <h3>Information sur les tarifs</h3>
                <p>
                  Ce prestataire n'a pas encore renseigné sa grille tarifaire.
                  Nous vous invitons à le contacter directement pour obtenir un
                  devis personnalisé selon vos besoins.
                </p>
                <button
                  className={styles.contactButton}
                  onClick={handleContact}
                >
                  Contacter le prestataire
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "portfolio" && (
          <div className={styles.portfolioGrid}>
            {provider.portfolio && provider.portfolio.length > 0 ? (
              provider.portfolio.map((photo, index) => (
                <div
                  key={index}
                  className={styles.portfolioItem}
                  onClick={() => window.open(photo, "_blank")}
                >
                  <img
                    src={photo}
                    alt={`Univers ${index + 1}`}
                    loading="lazy"
                  />
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIconWrapper}>
                  <Camera size={40} />
                </div>
                <h3>Portfolio en préparation</h3>
                <p>
                  Les réalisations de ce prestataire seront prochainement
                  disponibles dans sa galerie.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className={styles.reviewsContainer}>
            <div className={styles.ratingSummary}>
              <div className={styles.ratingLarge}>
                <div className={styles.ratingNumber}>
                  {provider.rating.toFixed(1)}
                </div>
                <div className={styles.ratingStarsLarge}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      fill={
                        i < Math.floor(provider.rating) ? "#ffd700" : "none"
                      }
                      stroke={
                        i < Math.floor(provider.rating)
                          ? "#ffd700"
                          : "currentColor"
                      }
                    />
                  ))}
                </div>
                <div className={styles.ratingCount}>
                  {provider.reviewCount} avis
                </div>
              </div>

              <div className={styles.ratingDistribution}>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className={styles.distLine}>
                    <div className={styles.distLabel}>{rating} ★</div>
                    <div className={styles.distBarBg}>
                      <div
                        className={styles.distBarFill}
                        style={{
                          width:
                            provider.reviewCount > 0
                              ? rating === 5
                                ? "100%"
                                : "0%"
                              : "0%",
                        }}
                      />
                    </div>
                    <div className={styles.distCount}>
                      {provider.reviewCount > 0
                        ? rating === 5
                          ? "100%"
                          : "0%"
                        : "0%"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.reviewsList}>
              <div className={styles.emptyReviews}>
                <p>Aucun avis n'a encore été publié pour ce prestataire.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
