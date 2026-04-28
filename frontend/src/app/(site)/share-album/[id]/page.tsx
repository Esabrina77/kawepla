"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Camera,
  Upload,
  Heart,
  Users,
  CheckCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  MessageCircle,
  Send,
  FolderDown,
  Lock,
  Loader2,
} from "lucide-react";
import { uploadToFirebase } from "@/lib/firebase";
import imageCompression from "browser-image-compression";
import styles from "./share-album.module.css";

// ── Types ──
interface Album {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  invitation: {
    id: string;
    eventTitle: string;
    eventDate: string;
  };
  photos: Photo[];
}

interface Photo {
  id: string;
  compressedUrl: string;
  thumbnailUrl: string;
  caption?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PUBLIC";
  uploadedAt: string;
  uploadedBy?: {
    firstName: string;
    lastName: string;
    profilePhotoUrl?: string;
  };
  comments: Comment[];
  reactions: Reaction[];
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  guest?: {
    firstName: string;
    lastName: string;
    profilePhotoUrl?: string;
  };
  user?: {
    firstName: string;
    lastName: string;
  };
}

interface Reaction {
  id: string;
  type: string;
  guestId?: string;
  userId?: string;
}

// ── Emoji Reactions ──
const REACTIONS = [
  { emoji: "❤️", label: "Love" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "😍", label: "Wow" },
  { emoji: "👏", label: "Bravo" },
  { emoji: "😂", label: "Haha" },
  { emoji: "🎉", label: "Fête" },
];

// ── Background floating icons (event-themed) ──
const BG_ICONS = [
  "📸",
  "💍",
  "🥂",
  "🎂",
  "💐",
  "🎶",
  "✨",
  "🎈",
  "💫",
  "🌸",
  "🪩",
  "🕺",
  "💒",
  "🍾",
  "🦋",
  "🫧",
];

export default function ShareAlbumPage() {
  const params = useParams();
  const albumId = params.id as string;

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload form
  const [guestName, setGuestName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Social UI state
  const [commentText, setCommentText] = useState("");
  const [animatingReaction, setAnimatingReaction] = useState<string | null>(
    null,
  );

  // Identification
  const [guest, setGuest] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    profilePhotoUrl?: string;
  } | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [showIdentifyModal, setShowIdentifyModal] = useState(false);

  // Download
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const commentInputRef = useRef<HTMLInputElement>(null);

  const isAnonymous = !guest || guest.id === "anonymous";

  useEffect(() => {
    loadAlbum();

    // Vérifier si déjà identifié localement
    const savedGuest = localStorage.getItem(`guest_${albumId}`);
    if (savedGuest) {
      const g = JSON.parse(savedGuest);
      setGuest(g);
      setGuestName(`${g.firstName} ${g.lastName}`);
    } else {
      // Vérifier si un code est présent dans l'URL
      const urlParams = new URLSearchParams(window.location.search);
      const codeFromUrl = urlParams.get("code");
      if (codeFromUrl) {
        handleIdentify(codeFromUrl);
      } else {
        // Afficher la modal après un court délai pour l'effet visuel
        setTimeout(() => setShowIdentifyModal(true), 1000);
      }
    }
  }, [albumId]);

  const handleIdentify = async (code: string) => {
    if (!code || code.length < 4) return;
    setIsIdentifying(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3013"}/api/photos/albums/${albumId}/identify?code=${code}`,
      );
      if (!res.ok) throw new Error("Code invalide");

      const guestData = await res.json();
      setGuest(guestData);
      setGuestName(`${guestData.firstName} ${guestData.lastName}`);
      localStorage.setItem(`guest_${albumId}`, JSON.stringify(guestData));
      setShowIdentifyModal(false);
      setSuccessMessage(`Bienvenue ${guestData.firstName} ! 👋`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Code d'accès incorrect. Vérifiez votre invitation.");
    } finally {
      setIsIdentifying(false);
    }
  };

  const continueAnonymous = () => {
    setShowIdentifyModal(false);
    const anonymousGuest = {
      id: "anonymous",
      firstName: "Invité",
      lastName: "",
    };
    setGuest(anonymousGuest);
    setGuestName("Invité");
    localStorage.setItem(`guest_${albumId}`, JSON.stringify(anonymousGuest));
  };

  const loadAlbum = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3013"}/api/photos/albums/${albumId}/photos`,
      );
      if (!res.ok) throw new Error("Album introuvable");
      const data = await res.json();
      setAlbum(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  // ── Upload Logic ──
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 10);
    setSelectedFiles(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      const name = guestName.trim() || "Invité";

      for (const file of selectedFiles) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
        });
        const fileName = `guest-photos/album/${albumId}/${Date.now()}-${Math.random().toString(36).substr(2, 6)}.jpg`;
        await uploadToFirebase(compressed, fileName);

        const formData = new FormData();
        formData.append("photo", compressed);
        formData.append("caption", `Photo de ${name}`);
        formData.append("guestName", name);
        if (guest && guest.id !== "anonymous") {
          formData.append("uploadedById", guest.id);
        }

        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3013"}/api/photos/albums/${albumId}/photos/guest`,
          {
            method: "POST",
            body: formData,
          },
        );
      }
      setSuccessMessage("Merci pour vos souvenirs ! 🎉");
      setSelectedFiles([]);
      setPreviews([]);
      setTimeout(() => {
        setShowUploadModal(false);
        setSuccessMessage(null);
      }, 2500);
      loadAlbum();
    } catch {
      setError("Erreur upload");
    } finally {
      setUploading(false);
    }
  };

  // ── Download Album ──
  const isMobile =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleDownloadAlbum = async () => {
    if (approvedPhotos.length === 0) return;
    setIsDownloading(true);

    if (!isMobile) {
      // Desktop: Backend ZIP (Efficient)
      setDownloadProgress(20);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3013";
      window.location.href = `${apiUrl}/api/photos/albums/${albumId}/download`;
      
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            setIsDownloading(false);
            return 0;
          }
          return prev + 10;
        });
      }, 500);

      setTimeout(() => {
        clearInterval(interval);
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 5000);
    } else {
      // Mobile: Individual download loop (Camera roll friendly)
      let done = 0;
      for (const photo of approvedPhotos) {
        await handleDownloadSinglePhoto(photo, done);
        done++;
        setDownloadProgress(Math.round((done / approvedPhotos.length) * 100));
        // Petit délai pour ne pas saturer le navigateur mobile
        await new Promise(r => setTimeout(r, 600));
      }
      setIsDownloading(false);
      setDownloadProgress(0);
      setSuccessMessage("Photos enregistrées ! ✨");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleDownloadSinglePhoto = async (photo: Photo, index: number) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3013";
    const downloadUrl = `${apiUrl}/api/photos/photos/${photo.id}/download`;
    
    setIsDownloading(true);
    try {
      const res = await fetch(downloadUrl);
      const blob = (await res.ok) ? await res.blob() : null;

      if (blob) {
        let extension = "jpg";
        if (blob.type.includes("png")) extension = "png";
        else if (blob.type.includes("webp")) extension = "webp";
        else if (blob.type.includes("heic")) extension = "heic";

        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `photo_${index + 1}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error("Erreur téléchargement photo:", err);
      // Fallback simple si fetch échoue
      window.open(downloadUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  // ── Reactions ──
  const toggleReaction = async (photoId: string, emoji: string) => {
    if (isAnonymous) return;

    setAnimatingReaction(emoji);
    setTimeout(() => setAnimatingReaction(null), 600);

    // Optimistic UI Update
    setAlbum((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        photos: prev.photos.map((p) => {
          if (p.id !== photoId) return p;
          const existing = p.reactions.find(
            (r) => r.type === emoji && r.guestId === guest?.id,
          );
          if (existing) {
            return {
              ...p,
              reactions: p.reactions.filter((r) => r.id !== existing.id),
            };
          } else {
            return {
              ...p,
              reactions: [
                ...p.reactions,
                { id: "temp", type: emoji, guestId: guest?.id },
              ],
            };
          }
        }),
      };
    });

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3013"}/api/photos/photos/${photoId}/reactions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: emoji, guestId: guest?.id }),
        },
      );
      // Silent reload of the photo's reactions would be better, but for now we trust the UI
    } catch (err) {
      console.error("Erreur réaction:", err);
    }
  };

  // ── Comments ──
  const addComment = async (photoId: string) => {
    if (!commentText.trim() || isAnonymous) return;

    const content = commentText.trim();
    setCommentText("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3013"}/api/photos/photos/${photoId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, guestId: guest?.id }),
        },
      );

      if (res.ok) {
        const newComment = await res.json();
        setAlbum((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            photos: prev.photos.map((p) => {
              if (p.id !== photoId) return p;
              return { ...p, comments: [...p.comments, newComment] };
            }),
          };
        });
      }
    } catch (err) {
      console.error("Erreur commentaire:", err);
    }
  };

  // ── Navigation ──
  const navigatePhoto = (dir: 1 | -1) => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex(
      (selectedPhotoIndex + dir + approvedPhotos.length) %
        approvedPhotos.length,
    );
    setCommentText("");
  };

  // ── Computed ──
  const approvedPhotos = useMemo(() => album?.photos || [], [album]);

  const stats = useMemo(
    () => ({
      photos: approvedPhotos.length,
      contributors: new Set(
        approvedPhotos.map((p) => p.uploadedBy?.firstName || "Invité"),
      ).size,
      totalReactions: approvedPhotos.reduce(
        (sum, p) => sum + p.reactions.length,
        0,
      ),
    }),
    [approvedPhotos],
  );

  const currentPhoto =
    selectedPhotoIndex !== null ? approvedPhotos[selectedPhotoIndex] : null;

  // Group reactions for display
  const currentGroupedReactions = useMemo(() => {
    if (!currentPhoto) return [];
    const counts: Record<string, number> = {};
    currentPhoto.reactions.forEach(
      (r) => (counts[r.type] = (counts[r.type] || 0) + 1),
    );
    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      active: currentPhoto.reactions.some(
        (r) => r.type === type && r.guestId === guest?.id,
      ),
    }));
  }, [currentPhoto, guest]);

  // ── Loading ──
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Préparation de la galerie...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.bgIcons}>
        {BG_ICONS.map((icon, i) => (
          <span key={i} className={styles.bgIcon}>
            {icon}
          </span>
        ))}
      </div>

      <div className={styles.headerSection}>
        <h1 className={styles.title}>{album?.title}</h1>
        <div className={styles.eventInfo}>
          <span className={styles.organisateurName}>
            {album?.invitation.eventTitle}
          </span>
          <span>•</span>
          <span>
            {new Date(album?.invitation.eventDate || "").toLocaleDateString(
              "fr-FR",
              { day: "numeric", month: "long", year: "numeric" },
            )}
          </span>
        </div>
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.photos}</span>
            <span className={styles.statLabel}>photos</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.contributors}</span>
            <span className={styles.statLabel}>contributeurs</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.totalReactions}</span>
            <span className={styles.statLabel}>réactions</span>
          </div>
        </div>

        {approvedPhotos.length > 0 && (
          <div className={styles.headerActions}>
            {isAnonymous && (
              <button 
                className={styles.reIdentifyBtn}
                onClick={() => setShowIdentifyModal(true)}
              >
                <CheckCircle size={16} />
                S'identifier
              </button>
            )}

            {isDownloading ? (
              <div className={styles.downloadProgress}>
                <Loader size={16} className={styles.spin} />
                <div className={styles.progressBarWrapper}>
                  <div
                    className={styles.progressBarFill}
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <span>{downloadProgress}%</span>
              </div>
            ) : (
              <button
                className={styles.downloadAlbumBtn}
                onClick={handleDownloadAlbum}
              >
                <FolderDown size={18} />
                {isMobile ? "Photos" : "Télécharger tout"}
              </button>
            )}
          </div>
        )}
      </div>

      <button
        className={styles.floatingUploadBtn}
        onClick={() => setShowUploadModal(true)}
      >
        <Camera size={22} />
        <span>Ajouter des souvenirs</span>
      </button>

      <div className={styles.gallerySection}>
        <div className={styles.photoGrid}>
          {approvedPhotos.map((photo, index) => {
            const hasReactions = photo.reactions.length > 0;
            const hasComments = photo.comments.length > 0;
            return (
              <div
                key={photo.id}
                className={styles.photoGridItem}
                onClick={() => setSelectedPhotoIndex(index)}
              >
                <img
                  src={photo.thumbnailUrl || photo.compressedUrl}
                  alt=""
                  className={styles.gridImage}
                  loading="lazy"
                />
                <div className={styles.photoGridOverlay}>
                  <div className={styles.overlayStats}>
                    {hasReactions && (
                      <div className={styles.overlayStatItem}>
                        <span>{photo.reactions[0].type}</span>
                        <span>{photo.reactions.length}</span>
                      </div>
                    )}
                    {hasComments && (
                      <div className={styles.overlayStatItem}>
                        <MessageCircle size={18} />
                        <span>{photo.comments.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showUploadModal && (
        <div
          className={styles.uploadModalOverlay}
          onClick={() => !uploading && setShowUploadModal(false)}
        >
          <div
            className={styles.uploadModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.uploadModalHeader}>
              <h2 className={styles.uploadModalTitle}>Partager un souvenir</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowUploadModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.uploadModalBody}>
              {successMessage ? (
                <div style={{ textAlign: "center", padding: "3rem" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                    🎉
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 900 }}>
                    {successMessage}
                  </h3>
                </div>
              ) : (
                <>
                  <div className={styles.userProfileBanner}>
                    <div className={styles.userAvatar}>
                      {guest?.profilePhotoUrl ? (
                        <img src={guest.profilePhotoUrl} alt="" />
                      ) : (
                        <span>{guest?.firstName?.[0] || "I"}</span>
                      )}
                    </div>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>
                        {guest?.firstName} {guest?.lastName}
                      </span>
                      <div className={styles.userRoleRow}>
                        <span className={styles.userRole}>Invité(e)</span>
                        {isAnonymous && (
                          <button 
                            className={styles.inlineIdentifyLink}
                            onClick={() => {
                              setShowUploadModal(false);
                              setShowIdentifyModal(true);
                            }}
                          >
                            • S'identifier
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFileSelect}
                    />
                    <label
                      htmlFor="file-upload"
                      className={styles.fileInputLabel}
                    >
                      <Upload className={styles.uploadIcon} />
                      <p
                        style={{
                          fontWeight: 800,
                          margin: "0.25rem 0",
                          color: "#0f172a",
                        }}
                      >
                        Sélectionner des photos
                      </p>
                      <p style={{ fontSize: "0.8rem", margin: 0 }}>
                        JPG, PNG — 10 max
                      </p>
                    </label>
                  </div>
                  {previews.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                        marginBottom: "1rem",
                      }}
                    >
                      {previews.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt=""
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 10,
                            objectFit: "cover",
                            border: "2px solid #e2e8f0",
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <button
                    className={styles.modalActionBtn}
                    onClick={handleUpload}
                    disabled={uploading || selectedFiles.length === 0}
                  >
                    {uploading ? (
                      <Loader size={20} className={styles.spin} />
                    ) : (
                      <Upload size={20} />
                    )}
                    <span>
                      {uploading
                        ? "Envoi en cours..."
                        : `Partager ${selectedFiles.length || ""} photo${selectedFiles.length > 1 ? "s" : ""}`}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {currentPhoto && selectedPhotoIndex !== null && (
        <div className={styles.photoModal}>
          <div className={styles.viewerLayout}>
            <div className={styles.viewerImageArea}>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setSelectedPhotoIndex(null)}
              >
                <X size={24} />
              </button>
              <span className={styles.imageCounter}>
                {selectedPhotoIndex + 1} / {approvedPhotos.length}
              </span>

              {approvedPhotos.length > 1 && (
                <>
                  <button
                    className={`${styles.navBtn} ${styles.navPrev}`}
                    onClick={() => navigatePhoto(-1)}
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button
                    className={`${styles.navBtn} ${styles.navNext}`}
                    onClick={() => navigatePhoto(1)}
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}

              <img
                src={currentPhoto.compressedUrl || currentPhoto.thumbnailUrl}
                className={styles.modalImage}
                alt=""
                onDoubleClick={() =>
                  !isAnonymous && toggleReaction(currentPhoto.id, "❤️")
                }
              />

              {/* Thumbnails strip */}
              <div className={styles.thumbnailsStrip}>
                {approvedPhotos.map((p, idx) => (
                  <div 
                    key={p.id} 
                    className={`${styles.thumbItem} ${selectedPhotoIndex === idx ? styles.thumbActive : ''}`}
                    onClick={() => {
                        setSelectedPhotoIndex(idx);
                        setCommentText('');
                    }}
                  >
                    <img src={p.thumbnailUrl || p.compressedUrl} alt="" />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.viewerSidebar}>
              <div className={styles.sidebarHeader}>
                <div className={styles.authorAvatar}>
                  {currentPhoto.uploadedBy?.profilePhotoUrl ? (
                    <img
                      src={currentPhoto.uploadedBy.profilePhotoUrl}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    currentPhoto.uploadedBy?.firstName?.[0] || "I"
                  )}
                </div>
                <div>
                  <div className={styles.authorName}>
                    {currentPhoto.uploadedBy
                      ? `${currentPhoto.uploadedBy.firstName} ${currentPhoto.uploadedBy.lastName}`
                      : "Invité"}
                  </div>
                  <div className={styles.authorDate}>
                    {new Date(currentPhoto.uploadedAt).toLocaleDateString(
                      "fr-FR",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  </div>
                </div>
              </div>

              {currentPhoto.caption && (
                <div className={styles.sidebarCaption}>
                  <strong>
                    {currentPhoto.uploadedBy?.firstName || "Invité"}
                  </strong>{" "}
                  {currentPhoto.caption}
                </div>
              )}

              <div className={styles.commentsArea}>
                {currentPhoto.comments.length === 0 ? (
                  <div className={styles.emptyComments}>
                    <MessageCircle size={40} strokeWidth={1.5} />
                    <div className={styles.emptyCommentsTitle}>
                      Pas encore de commentaires
                    </div>
                    <div className={styles.emptyCommentsText}>
                      Soyez le premier à réagir à cette photo !
                    </div>
                  </div>
                ) : (
                  currentPhoto.comments.map((c) => (
                    <div key={c.id} className={styles.commentItem}>
                      <div className={styles.commentAvatar}>
                        {c.guest?.profilePhotoUrl ? (
                          <img
                            src={c.guest.profilePhotoUrl}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "50%",
                            }}
                          />
                        ) : (
                          c.guest?.firstName?.[0] ||
                          c.user?.firstName?.[0] ||
                          "?"
                        )}
                      </div>
                      <div className={styles.commentBody}>
                        <span className={styles.commentAuthor}>
                          {c.guest
                            ? `${c.guest.firstName} ${c.guest.lastName}`
                            : c.user
                              ? `${c.user.firstName} ${c.user.lastName}`
                              : "Anonyme"}
                        </span>{" "}
                        <span className={styles.commentText}>{c.content}</span>
                        <div className={styles.commentTime}>
                          {new Date(c.createdAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className={styles.reactionsBar}>
                {isAnonymous ? (
                  <div className={styles.readOnlyReactions}>
                    {currentGroupedReactions.map(({ type, count }) => (
                      <div key={type} className={styles.reactionBadge}>
                        <span>{type}</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  REACTIONS.map(({ emoji, label }) => {
                    const hasReacted = currentPhoto.reactions.some(
                      (r) => r.type === emoji && r.guestId === guest?.id,
                    );
                    return (
                      <button
                        key={emoji}
                        className={`${styles.reactionBtn} ${hasReacted ? styles.reactionActive : ""} ${animatingReaction === emoji ? styles.heartAnim : ""}`}
                        onClick={() => toggleReaction(currentPhoto.id, emoji)}
                        title={label}
                      >
                        {emoji}
                      </button>
                    );
                  })
                )}
                <div className={styles.reactionDivider} />
                <button
                  className={styles.downloadBtn}
                  title="Télécharger cette photo"
                  onClick={() => handleDownloadSinglePhoto(currentPhoto, selectedPhotoIndex!)}
                  disabled={isDownloading}
                >
                  {isDownloading ? <Loader2 size={20} className={styles.spin} /> : <Download size={20} />}
                </button>
              </div>

              <div className={styles.commentInputArea}>
                {isAnonymous ? (
                  <div 
                    className={styles.readOnlyNote}
                    onClick={() => {
                        setSelectedPhotoIndex(null);
                        setShowIdentifyModal(true);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <Lock size={14} />
                    <span>Identifiez-vous pour commenter</span>
                  </div>
                ) : (
                  <>
                    <input
                      ref={commentInputRef}
                      className={styles.commentInput}
                      type="text"
                      placeholder="Ajouter un commentaire..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && addComment(currentPhoto.id)
                      }
                    />
                    <button
                      className={styles.commentSubmitBtn}
                      onClick={() => addComment(currentPhoto.id)}
                      style={{ opacity: commentText.trim() ? 1 : 0.4 }}
                    >
                      Publier
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showIdentifyModal && (
        <div className={styles.uploadModalOverlay} style={{ zIndex: 3000 }}>
          <div
            className={`${styles.uploadModalContent} ${styles.identifyModal}`}
            style={{ maxWidth: 400 }}
          >
            <div className={styles.uploadModalHeader}>
              <h2 className={styles.uploadModalTitle}>Bienvenue !</h2>
            </div>
            <div
              className={styles.uploadModalBody}
              style={{ textAlign: "center" }}
            >
              <div className={styles.welcomeIcon}>✨</div>
              <p className={styles.identifyText}>
                Pour retrouver vos souvenirs et interagir, entrez le{" "}
                <strong>code à 6 chiffres</strong> présent sur votre invitation.
              </p>

              <div className={styles.formGroup}>
                <input
                  type="text"
                  inputMode="numeric"
                  className={styles.elegantInput}
                  placeholder="Ex: 847 291"
                  value={accessCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setAccessCode(val);
                    if (val.length === 6) handleIdentify(val);
                  }}
                  style={{
                    textAlign: "center",
                    fontSize: "1.5rem",
                    letterSpacing: "0.5rem",
                    fontWeight: 900,
                  }}
                />
              </div>

              {error && (
                <p
                  className={styles.errorMessage}
                  style={{ marginBottom: "1rem" }}
                >
                  {error}
                </p>
              )}

              <button
                className={styles.modalActionBtn}
                onClick={() => handleIdentify(accessCode)}
                disabled={isIdentifying || accessCode.length < 4}
              >
                {isIdentifying ? (
                  <Loader size={20} className={styles.spin} />
                ) : (
                  <CheckCircle size={20} />
                )}
                <span>
                  {isIdentifying ? "Vérification..." : "Valider mon code"}
                </span>
              </button>

              <button className={styles.skipBtn} onClick={continueAnonymous}>
                Continuer sans m'identifier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
