"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/useAuth";
import { useProviderConversations } from "@/hooks/useProviderConversations";
import {
  LayoutDashboard,
  CalendarRange,
  Users,
  PaintBucket,
  MessageSquare,
  MessageCircle,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Home,
  CreditCard,
  User,
  Wrench,
  Search,
  Heart,
  Image as ImageIcon,
} from "lucide-react";

const menuItems = [
  // PRIORITÉ 1 : Actions principales (visibles sur mobile)
  {
    title: "Tableau de bord",
    path: "/client/dashboard",
    icon: LayoutDashboard,
    description: "Vue d'ensemble de votre événement",
    priority: 1,
  },
  {
    title: "Créer l'événement",
    path: "/client/invitations",
    icon: CalendarRange,
    description: "Gérez vos événements",
    priority: 1,
  },
  {
    title: "Design",
    path: "/client/design",
    icon: PaintBucket,
    description: "Personnalisez votre événement",
    priority: 1,
  },
  {
    title: "Invités",
    path: "/client/guests",
    icon: Users,
    description: "Gérez votre liste d'invités et les RSVP",
    priority: 1,
  },
  {
    title: "Réponses Convives",
    path: "/client/messages",
    icon: MessageSquare,
    description: "Consultez les messages de vos convives",
    priority: 1,
  },

  // {
  //   title: 'Outils',
  //   path: '/client/tools',
  //   icon: Wrench,
  //   description: 'Tous les outils pour organiser votre événement',
  //   priority: 1
  // },
  {
    title: "Planning",
    path: "/client/tools/planning",
    icon: CalendarRange,
    description: "Gérez vos tâches planifiées",
    priority: 1,
  },

  // PRIORITÉ 2 : Actions secondaires (dans le menu "Plus" sur mobile)
  {
    title: "Prestataires",
    path: "",
    isHeader: true,
    icon: Users,
    priority: 2,
  },
  {
    title: "Catalogue",
    path: "/client/providers/all",
    icon: Search,
    description: "Trouvez des prestataires",
    isSubItem: true,
    priority: 2,
  },
  {
    title: "Discussions",
    path: "/client/providers/discussions",
    icon: MessageCircle,
    description: "Échangez avec vos prestataires",
    isSubItem: true,
    priority: 2,
  },
  {
    title: "Favoris",
    path: "/client/providers/favorites",
    icon: Heart,
    description: "Vos prestataires favoris",
    isSubItem: true,
    priority: 2,
  },

  {
    title: "Albums Photos",
    path: "/client/photos",
    icon: ImageIcon,
    description: "Gérez vos albums photos et les photos",
    priority: 2,
  },
  {
    title: "Facturation",
    path: "/client/billing",
    icon: CreditCard,
    description: "Gérez votre abonnement et facturation",
    priority: 2,
  },
  {
    title: "Profil",
    path: "/client/profile",
    icon: User,
    description: "Gérez votre profil",
    priority: 2,
  },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isProvidersOpen, setIsProvidersOpen] = useState(true);
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { conversations: providerConversations } =
    useProviderConversations("HOST");

  // Calculate unread discussion messages
  const unreadDiscussionsCount = providerConversations.reduce((total, conv) => {
    return total + (conv.unreadCount || 0);
  }, 0);

  // Initialiser l'attribut data sur le body
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-sidebar-collapsed", String(isCollapsed));
    }
  }, [isCollapsed]);

  // Déterminer le chemin de base pour la correspondance active
  const basePath = pathname?.split("/").slice(0, 3).join("/");

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    // Mettre à jour l'attribut data sur le body pour le CSS
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-sidebar-collapsed", String(newState));
    }
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Séparer les éléments pour mobile
  // Sur mobile : seulement 3 icônes principales + bouton "Plus"
  const primaryItems = menuItems
    .filter((item) => item.priority === 1)
    .slice(0, 3);
  const secondaryItems = [
    // Les autres éléments de priorité 1 non affichés
    ...menuItems.filter((item) => item.priority === 1).slice(3),
    // Les éléments de priorité 2
    ...menuItems.filter((item) => item.priority >= 2),
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
      >
        {/* Header Section */}
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logoLink} data-tutorial="logo">
            {isCollapsed ? (
              <span className={styles.logoTextCollapsed}>K</span>
            ) : (
              <span className={styles.logoText}>KAWEPLA</span>
            )}
          </Link>
          <div className={styles.headerActions}>
            <button
              onClick={toggleSidebar}
              className={styles.collapseBtn}
              title={
                isCollapsed ? "Désactiver le mode réduit" : "Réduire le menu"
              }
            >
              {isCollapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className={styles.navigation}>
          <div className={styles.desktopMenu}>
            {menuItems.map((item) => {
              if (item.isHeader) {
                return (
                  <div
                    key={item.title}
                    className={`${styles.navItem} ${styles.navHeader}`}
                    aria-label={item.title}
                    data-tooltip={item.title}
                    onClick={() => setIsProvidersOpen(!isProvidersOpen)}
                  >
                    <div className={styles.headerTitleWrapper}>
                      <span className={styles.icon}>
                        <item.icon className={styles.menuIcon} size={16} />
                      </span>
                      {!isCollapsed && (
                        <span className={styles.title}>{item.title}</span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <ChevronRight
                        className={`${styles.headerChevron} ${isProvidersOpen ? styles.open : ""}`}
                        size={14}
                      />
                    )}
                  </div>
                );
              }

              // Hide sub-items if the category is closed
              if (item.isSubItem && !isProvidersOpen) {
                return null;
              }

              // Hide sub-items if sidebar is collapsed, or maybe just show their icons?
              // The user might still want to access them. Let's just render them as normal items with a subItem class
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${styles.navItem} ${item.isSubItem ? styles.subItem : ""} ${pathname?.startsWith(item.path) ? styles.active : ""}`}
                  aria-label={item.title}
                  data-tooltip={item.title}
                >
                  <span className={styles.icon}>
                    <item.icon
                      className={styles.menuIcon}
                      size={item.isSubItem ? 16 : 18}
                    />
                  </span>
                  {!isCollapsed && (
                    <span className={styles.title}>{item.title}</span>
                  )}
                  {item.title === "Discussions" &&
                    unreadDiscussionsCount > 0 &&
                    !isCollapsed && (
                      <span className={styles.badge}>
                        {unreadDiscussionsCount}
                      </span>
                    )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer Section */}
        <div className={styles.sidebarFooter}>
          <div className={styles.footerContent}>
            <Button
              variant="outline"
              onClick={logout}
              className={styles.logoutButton}
              title="Se déconnecter"
            >
              <LogOut className={styles.menuIcon} size={16} />
              {!isCollapsed && <span>Se déconnecter</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className={styles.mobileBottomNav}>
        <div className={styles.mobileNavContainer}>
          {primaryItems
            .filter((i) => !i.isHeader)
            .map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.mobileNavItem} ${pathname?.startsWith(item.path) ? styles.active : ""}`}
                title={item.title}
              >
                <span className={styles.mobileIcon}>
                  <item.icon className={styles.mobileMenuIcon} size={20} />
                  {item.title === "Discussions" &&
                    unreadDiscussionsCount > 0 && (
                      <span className={styles.badge}>
                        {unreadDiscussionsCount}
                      </span>
                    )}
                </span>
                <span className={styles.mobileTitle}>{item.title}</span>
              </Link>
            ))}

          {/* Bouton Plus pour menu complet */}
          <button
            onClick={toggleMobileMenu}
            className={`${styles.mobileNavItem} ${styles.mobileMoreButton}`}
            title="Plus d'options"
          >
            <span className={styles.mobileIcon}>
              <Plus className={styles.mobileMenuIcon} size={20} />
            </span>
            <span className={styles.mobileTitle}>Plus</span>
          </button>
        </div>
      </nav>

      {/* Menu mobile popup */}
      {showMobileMenu && (
        <div className={styles.mobileMenuOverlay} onClick={toggleMobileMenu}>
          <div
            className={styles.mobileMenuPopup}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.mobileMenuHeader}>
              <h3>Menu</h3>
              <button
                onClick={toggleMobileMenu}
                className={styles.closeMobileMenu}
              >
                ×
              </button>
            </div>
            <div className={styles.mobileMenuItems}>
              {/* Lien vers l'accueil */}
              <Link
                href="/"
                className={styles.mobileMenuItem}
                onClick={toggleMobileMenu}
              >
                <span className={styles.icon}>
                  <Home className={styles.menuIcon} size={18} />
                </span>
                <div className={styles.mobileMenuItemContent}>
                  <span className={styles.title}>Accueil</span>
                  <span className={styles.description}>
                    Retourner à la page d'accueil
                  </span>
                </div>
              </Link>

              {/* Éléments secondaires */}
              {secondaryItems
                .filter((i) => !i.isHeader)
                .map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`${styles.mobileMenuItem} ${pathname?.startsWith(item.path) ? styles.active : ""}`}
                    onClick={toggleMobileMenu}
                  >
                    <span className={styles.icon}>
                      <item.icon className={styles.menuIcon} size={18} />
                    </span>
                    <div className={styles.mobileMenuItemContent}>
                      <span className={styles.title}>
                        {item.isSubItem
                          ? `Prestataires - ${item.title}`
                          : item.title}
                      </span>
                      <span className={styles.description}>
                        {item.description}
                      </span>
                    </div>
                    {item.title === "Discussions" &&
                      unreadDiscussionsCount > 0 && (
                        <span className={styles.badge}>
                          {unreadDiscussionsCount}
                        </span>
                      )}
                  </Link>
                ))}

              <div className={styles.mobileMenuFooter}>
                <Button
                  variant="outline"
                  onClick={() => {
                    logout();
                    toggleMobileMenu();
                  }}
                  className={styles.mobileLogoutButton}
                >
                  <LogOut className={styles.menuIcon} size={18} />
                  <span>Se déconnecter</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
