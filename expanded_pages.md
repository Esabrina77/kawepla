# 📖 Grand Rapport d'Analyse Executive & Détaillée - Kawepla

## 📋 Table des Matières

1. [🧠 Chapitre 1 : Les Organes Majeurs du Backend](#1)
2. [🎨 Chapitre 2 : Cartographie Exhaustive des Écrans (L'Extranet)](#2)
3. [🌐 Chapitre 3 : Cartographie des Écrans Publics & Parcours Invités](#3)

---

## 🧠 Chapitre 1 : Les Organes Majeurs du Backend

*(Insérez ici les services backend analysés précédemment...)*

---

## 🎨 Chapitre 2 : Cartographie Exhaustive des Écrans (Extranet)

### 📍 Route : `(extranet)/client/billing/history/page.tsx`
**Composant :** `PurchaseHistoryPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useState, useEffect } ⬅️ 'react';`
  * `{ useAuth } ⬅️ '@/hooks/useAuth';`
  * `{ stripeApi } ⬅️ '@/lib/api/stripe';`
  * `{ Button } ⬅️ '@/components/ui/button';`
  * `{ Badge } ⬅️ '@/components/ui/badge';`
- Logique & Hooks :
  * Utilise `useAuth` pour manager l'état réactif de la page.
  * Utilise `useToast` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/billing/page.tsx`
**Composant :** `BillingPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useState, useEffect } ⬅️ 'react';`
  * `{ useAuth } ⬅️ '@/hooks/useAuth';`
  * `{ stripeApi, ServicePurchasePlan, AdditionalService } ⬅️ '@/lib/api/stripe';`
  * `{ Card, CardContent, CardHeader, CardTitle } ⬅️ '@/components/ui/card';`
  * `{ Button } ⬅️ '@/components/ui/button';`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useAuth` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/dashboard/page.tsx`
**Composant :** `DashboardPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ 'react';`
  * `Link ⬅️ 'next/link';`
  * `{ useRouter } ⬅️ 'next/navigation';`
  * `{ useInvitations } ⬅️ '@/hooks/useInvitations';`
  * `{ useGuests } ⬅️ '@/hooks/useGuests';`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useAuth` pour manager l'état réactif de la page.
  * Utilise `useInvitations` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.
  * Utilise `useGuests` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/design/editor/page.tsx`
**Composant :** `ClientDesignEditorPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useEffect, useState } ⬅️ 'react';`
  * `{ useRouter, useSearchParams } ⬅️ 'next/navigation';`
  * `dynamic ⬅️ 'next/dynamic';`
  * `{ HeaderMobile } ⬅️ '@/components/HeaderMobile';`
  * `{ useDesigns } ⬅️ '@/hooks/useDesigns';`
- Logique & Hooks :
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useSearchParams` pour manager l'état réactif de la page.
  * Utilise `useDesigns` pour manager l'état réactif de la page.
  * Utilise `useToast` pour manager l'état réactif de la page.
  * Utilise `useEditorStore` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/design/page.tsx`
**Composant :** `DesignsGalleryPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useEffect, useState } ⬅️ 'react';`
  * `{ useRouter, useSearchParams } ⬅️ 'next/navigation';`
  * `{ useDesigns } ⬅️ '@/hooks/useDesigns';`
  * `{ useInvitations } ⬅️ '@/hooks/useInvitations';`
  * `{ Design } ⬅️ '@/types';`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useSearchParams` pour manager l'état réactif de la page.
  * Utilise `useDesigns` pour manager l'état réactif de la page.
  * Utilise `useInvitations` pour manager l'état réactif de la page.
  * Utilise `useToast` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/design/[id]/page.tsx`
**Composant :** `DesignDetailPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useEffect, useState } ⬅️ 'react';`
  * `{ useRouter } ⬅️ 'next/navigation';`
  * `{ useDesigns } ⬅️ '@/hooks/useDesigns';`
  * `{ Design } ⬅️ '@/types';`
  * `DesignPreview ⬅️ '@/components/DesignPreview';`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useDesigns` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/guests/page.tsx`
**Composant :** `GuestsPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useState, useEffect, useMemo, useRef } ⬅️ 'react';`
  * `{ useRouter } ⬅️ 'next/navigation';`
  * `{ HeaderMobile } ⬅️ '@/components/HeaderMobile';`
  * `{ useGuests } ⬅️ '@/hooks/useGuests';`
  * `{ useInvitations } ⬅️ '@/hooks/useInvitations';`
- Logique & Hooks :
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useInvitations` pour manager l'état réactif de la page.
  * Utilise `useGuests` pour manager l'état réactif de la page.
  * Utilise `useMemo` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/guests/scan/page.tsx`
**Composant :** `ScanPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useState, useEffect, useRef } ⬅️ "react";`
  * `{ useRouter } ⬅️ "next/navigation";`
  * `{ ArrowLeft, Camera, Check, X, AlertTriangle, User } ⬅️ "lucide-react";`
  * `{ Html5Qrcode } ⬅️ "html5-qrcode";`
  * `{ apiClient } ⬅️ "@/lib/api/apiClient";`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/invitations/create/page.tsx`
**Composant :** `CreateInvitationPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useEffect, useState, useRef } ⬅️ 'react';`
  * `{ useRouter, useSearchParams } ⬅️ 'next/navigation';`
  * `dynamic ⬅️ 'next/dynamic';`
  * `{ HeaderMobile } ⬅️ '@/components/HeaderMobile';`
  * `{ InvitationEventFormModal, EventFormData } ⬅️ '@/components/InvitationEventFormModal';`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useSearchParams` pour manager l'état réactif de la page.
  * Utilise `useAuth` pour manager l'état réactif de la page.
  * Utilise `useDesigns` pour manager l'état réactif de la page.
  * Utilise `useToast` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/invitations/page.tsx`
**Composant :** `InvitationsPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useState, useEffect, useMemo } ⬅️ 'react';`
  * `{ useRouter, useSearchParams } ⬅️ 'next/navigation';`
  * `{ HeaderMobile } ⬅️ '@/components/HeaderMobile';`
  * `{ useInvitations } ⬅️ '@/hooks/useInvitations';`
  * `{ useDesigns } ⬅️ '@/hooks/useDesigns';`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useSearchParams` pour manager l'état réactif de la page.
  * Utilise `useToast` pour manager l'état réactif de la page.
  * Utilise `useInvitations` pour manager l'état réactif de la page.
  * Utilise `useDesigns` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/invitations/[id]/edit/page.tsx`
**Composant :** `InvitationEditPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ 'react';`
  * `{ useParams, useRouter } ⬅️ 'next/navigation';`
  * `{ HeaderMobile } ⬅️ '@/components/HeaderMobile';`
  * `{ useInvitations } ⬅️ '@/hooks/useInvitations';`
  * `{ useDesigns } ⬅️ '@/hooks/useDesigns';`
- Logique & Hooks :
  * Utilise `useParams` pour manager l'état réactif de la page.
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useInvitations` pour manager l'état réactif de la page.
  * Utilise `useDesigns` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/invitations/[id]/page.tsx`
**Composant :** `InvitationDetailPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ 'react';`
  * `{ useParams, useRouter } ⬅️ 'next/navigation';`
  * `{ HeaderMobile } ⬅️ '@/components/HeaderMobile';`
  * `{ useInvitations } ⬅️ '@/hooks/useInvitations';`
  * `{ useDesigns } ⬅️ '@/hooks/useDesigns';`
- Logique & Hooks :
  * Utilise `useParams` pour manager l'état réactif de la page.
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useInvitations` pour manager l'état réactif de la page.
  * Utilise `useDesigns` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/messages/page.tsx`
**Composant :** `MessagesPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect, useMemo } ⬅️ 'react';`
  * `{ useRouter } ⬅️ 'next/navigation';`
  * `{ useRSVPMessages } ⬅️ '@/hooks/useRSVPMessages';`
  * `{ useInvitations } ⬅️ '@/hooks/useInvitations';`
  * `{ RSVPMessage } ⬅️ '@/types';`
- Logique & Hooks :
  * Utilise `useInvitations` pour manager l'état réactif de la page.
  * Utilise `useRSVPMessages` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useMemo` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/photos/page.tsx`
**Composant :** `PhotosPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ 'react';`
  * `{ useRouter } ⬅️ 'next/navigation';`
  * `{ useInvitations } ⬅️ '@/hooks/useInvitations';`
  * `{ usePhotoAlbums, PhotoAlbum } ⬅️ '@/hooks/usePhotoAlbums';`
  * `{ HeaderMobile } ⬅️ '@/components/HeaderMobile';`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useInvitations` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/profile/page.tsx`
**Composant :** `ProfilePage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ "react";`
  * `{ useRouter } ⬅️ "next/navigation";`
  * `{ useAuth } ⬅️ "@/hooks/useAuth";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile";`
  * `{ ConfirmModal } ⬅️ "@/components/ui/modal";`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useAuth` pour manager l'état réactif de la page.
  * Utilise `useToast` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/providers/all/page.tsx`
**Composant :** `ProvidersPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ 'react';`
  * `{ useRouter } ⬅️ 'next/navigation';`
  * `{ useProviderSearch } ⬅️ '@/hooks/useProviders';`
  * `{`
  * `styles ⬅️ './providers.module.css';`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useProviderSearch` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/providers/discussions/page.tsx`
**Composant :** `ClientDiscussionsPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, {`
  * `{ useSearchParams } ⬅️ "next/navigation";`
  * `{ useAuth } ⬅️ "@/hooks/useAuth";`
  * `{`
  * `{ ProviderMessage } ⬅️ "@/lib/api/providerConversations";`
- Logique & Hooks :
  * Utilise `useAuth` pour manager l'état réactif de la page.
  * Utilise `useSearchParams` pour manager l'état réactif de la page.
  * Utilise `useProviderConversations` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useProviderConversation` pour manager l'état réactif de la page.
  * Utilise `useCallback` pour manager l'état réactif de la page.
  * Utilise `useMemo` pour manager l'état réactif de la page.
  * Utilise `useRef` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/providers/[id]/book/page.tsx`
**Composant :** `BookServicePage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useState, useEffect } ⬅️ "react";`
  * `{ useParams, useRouter, useSearchParams } ⬅️ "next/navigation";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile";`
  * `{ useProviderDetail } ⬅️ "@/hooks/useProviderDetail";`
  * `{`
- Logique & Hooks :
  * Utilise `useParams` pour manager l'état réactif de la page.
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useSearchParams` pour manager l'état réactif de la page.
  * Utilise `useAuth` pour manager l'état réactif de la page.
  * Utilise `useProviderDetail` pour manager l'état réactif de la page.
  * Utilise `useProviderConversations` pour manager l'état réactif de la page.
  * Utilise `useProviderConversation` pour manager l'état réactif de la page.
  * Utilise `useBookingInfo` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/providers/[id]/page.tsx`
**Composant :** `ProviderDetailPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useState } ⬅️ "react";`
  * `{ useParams, useRouter } ⬅️ "next/navigation";`
  * `{ ProviderProfile, Service } ⬅️ "@/lib/api/providers";`
  * `{ useProviderDetail } ⬅️ "@/hooks/useProviderDetail";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile";`
- Logique & Hooks :
  * Utilise `useParams` pour manager l'état réactif de la page.
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useToast` pour manager l'état réactif de la page.
  * Utilise `useProviderDetail` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/tools/budget/page.tsx`
**Composant :** `BudgetPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState } ⬅️ 'react';`
  * `{ Card } ⬅️ '@/components/ui/card';`
  * `styles ⬅️ './budget.module.css';`
- Logique & Hooks :
  * Utilise `useState` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/tools/page.tsx`
**Composant :** `ToolsPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React ⬅️ 'react';`
  * `Link ⬅️ 'next/link';`
  * `{ useAuth } ⬅️ '@/hooks/useAuth';`
  * `{ HeaderMobile } ⬅️ '@/components/HeaderMobile/HeaderMobile';`
  * `{`
- Logique & Hooks :
  * Utilise `useAuth` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/tools/planning/page.tsx`
**Composant :** `PlanningPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect, useCallback } ⬅️ 'react';`
  * `{ useAuth } ⬅️ '@/hooks/useAuth';`
  * `{ todosApi, TodoItem, TodoCategory, TodoStatus, TodoPriority, CreateTodoDto, UpdateTodoDto } ⬅️ '@/lib/api/todos';`
  * `{ invitationsApi } ⬅️ '@/lib/api/invitations';`
  * `{ HeaderMobile } ⬅️ '@/components/HeaderMobile/HeaderMobile';`
- Logique & Hooks :
  * Utilise `useAuth` pour manager l'état réactif de la page.
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useAI` pour manager l'état réactif de la page.
  * Utilise `useServicePurchaseLimits` pour manager l'état réactif de la page.
  * Utilise `useCallback` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/client/tools/support-client/page.tsx`
**Composant :** `ClientDiscussionsPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ "react";`
  * `{ useRouter } ⬅️ "next/navigation";`
  * `{ ChatBox } ⬅️ "@/components/Messages/ChatBox";`
  * `{ useMessages } ⬅️ "@/hooks/useMessages";`
  * `{ useAuth } ⬅️ "@/hooks/useAuth";`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useAuth` pour manager l'état réactif de la page.
  * Utilise `useInvitations` pour manager l'état réactif de la page.
  * Utilise `useMessages` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/provider/billing/page.tsx`
**Composant :** `ProviderBillingPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useState, useEffect } ⬅️ "react";`
  * `{ useAuth } ⬅️ "@/hooks/useAuth";`
  * `{ stripeApi } ⬅️ "@/lib/api/stripe";`
  * `{ Button } ⬅️ "@/components/ui/button";`
  * `{ Badge } ⬅️ "@/components/ui/badge";`
- Logique & Hooks :
  * Utilise `useAuth` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/provider/bookings/page.tsx`
**Composant :** `ProviderBookingsPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ "react";`
  * `{ useRouter, useSearchParams } ⬅️ "next/navigation";`
  * `{ bookingsApi, Booking } ⬅️ "@/lib/api/bookings";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile/HeaderMobile";`
  * `{`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useSearchParams` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/provider/bookings/[id]/page.tsx`
**Composant :** `BookingDetailPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ "react";`
  * `{ useParams, useRouter } ⬅️ "next/navigation";`
  * `{ bookingsApi, Booking } ⬅️ "@/lib/api/bookings";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile/HeaderMobile";`
  * `{`
- Logique & Hooks :
  * Utilise `useParams` pour manager l'état réactif de la page.
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/provider/dashboard/page.tsx`
**Composant :** `ProviderDashboard`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ "react";`
  * `Link ⬅️ "next/link";`
  * `{ useProviderProfile } ⬅️ "@/hooks/useProviderProfile";`
  * `{ useProviderServices } ⬅️ "@/hooks/useProviderServices";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile/HeaderMobile";`
- Logique & Hooks :
  * Utilise `useProviderProfile` pour manager l'état réactif de la page.
  * Utilise `useProviderServices` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/provider/messages/page.tsx`
**Composant :** `ProviderMessagesPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, {`
  * `{ useProviderProfile } ⬅️ "@/hooks/useProviderProfile";`
  * `{`
  * `{ ProviderMessage } ⬅️ "@/lib/api/providerConversations";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile";`
- Logique & Hooks :
  * Utilise `useProviderProfile` pour manager l'état réactif de la page.
  * Utilise `useProviderConversations` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useProviderConversation` pour manager l'état réactif de la page.
  * Utilise `useCallback` pour manager l'état réactif de la page.
  * Utilise `useMemo` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.
  * Utilise `useRef` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/provider/page.tsx`
**Composant :** `ProviderPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useEffect } ⬅️ 'react';`
  * `{ useRouter } ⬅️ 'next/navigation';`
  * `{ useProviderProfile } ⬅️ '@/hooks/useProviderProfile';`
  * `{ useAuth } ⬅️ '@/hooks/useAuth';`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useProviderProfile` pour manager l'état réactif de la page.
  * Utilise `useAuth` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/provider/profile/page.tsx`
**Composant :** `ProviderProfilePage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ "react";`
  * `{ useRouter } ⬅️ "next/navigation";`
  * `{ useProviderProfile } ⬅️ "@/hooks/useProviderProfile";`
  * `{ useServiceCategories } ⬅️ "@/hooks/useServiceCategories";`
  * `{ CreateProviderProfileDto } ⬅️ "@/lib/api/providers";`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useAuth` pour manager l'état réactif de la page.
  * Utilise `useProviderProfile` pour manager l'état réactif de la page.
  * Utilise `useServiceCategories` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/provider/services/create/page.tsx`
**Composant :** `CreateServicePage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState } ⬅️ "react";`
  * `{ useRouter } ⬅️ "next/navigation";`
  * `{ useProviderServices } ⬅️ "@/hooks/useProviderServices";`
  * `{ CreateServiceDto } ⬅️ "@/lib/api/providers";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile/HeaderMobile";`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useProviderServices` pour manager l'état réactif de la page.
  * Utilise `useAI` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/provider/services/page.tsx`
**Composant :** `ProviderServicesPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState } ⬅️ "react";`
  * `Link ⬅️ "next/link";`
  * `{ useProviderServices } ⬅️ "@/hooks/useProviderServices";`
  * `{ Service } ⬅️ "@/lib/api/providers";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile/HeaderMobile";`
- Logique & Hooks :
  * Utilise `useProviderServices` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/provider/services/[id]/edit/page.tsx`
**Composant :** `EditServicePage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ "react";`
  * `{ useRouter, useParams } ⬅️ "next/navigation";`
  * `{ useProviderServices } ⬅️ "@/hooks/useProviderServices";`
  * `{ UpdateServiceDto, Service } ⬅️ "@/lib/api/providers";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile/HeaderMobile";`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useParams` pour manager l'état réactif de la page.
  * Utilise `useProviderServices` pour manager l'état réactif de la page.
  * Utilise `useAI` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/provider/services/[id]/page.tsx`
**Composant :** `ServiceDetailPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ 'react';`
  * `{ useParams, useRouter } ⬅️ 'next/navigation';`
  * `Link ⬅️ 'next/link';`
  * `{ useProviderServices } ⬅️ '@/hooks/useProviderServices';`
  * `{ Service } ⬅️ '@/lib/api/providers';`
- Logique & Hooks :
  * Utilise `useParams` pour manager l'état réactif de la page.
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useProviderServices` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/provider/support/page.tsx`
**Composant :** `ProviderSupportPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ "react";`
  * `{ useRouter } ⬅️ "next/navigation";`
  * `{ ChatBox } ⬅️ "@/components/Messages/ChatBox";`
  * `{ useMessages } ⬅️ "@/hooks/useMessages";`
  * `{ useAuth } ⬅️ "@/hooks/useAuth";`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useAuth` pour manager l'état réactif de la page.
  * Utilise `useProviderServices` pour manager l'état réactif de la page.
  * Utilise `useMessages` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/super-admin/dashboard/page.tsx`
**Composant :** `SuperAdminDashboard`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useMemo } ⬅️ "react";`
  * `Link ⬅️ "next/link";`
  * `styles ⬅️ "./dashboard.module.css";`
  * `{ useAdminStats } ⬅️ "@/hooks/useAdminStats";`
  * `{ useAdminUsers } ⬅️ "@/hooks/useAdminUsers";`
- Logique & Hooks :
  * Utilise `useAdminStats` pour manager l'état réactif de la page.
  * Utilise `useAdminUsers` pour manager l'état réactif de la page.
  * Utilise `useAuth` pour manager l'état réactif de la page.
  * Utilise `useMemo` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/super-admin/design/create-canva/page.tsx`
**Composant :** `CreateCanvaDesignPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useEffect, useState } ⬅️ "react";`
  * `{ useRouter, useSearchParams } ⬅️ "next/navigation";`
  * `dynamic ⬅️ "next/dynamic";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile/HeaderMobile";`
  * `{ useDesigns } ⬅️ "@/hooks/useDesigns";`
- Logique & Hooks :
  * Utilise `useToast` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useSearchParams` pour manager l'état réactif de la page.
  * Utilise `useDesigns` pour manager l'état réactif de la page.
  * Utilise `useEditorStore` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/super-admin/design/page.tsx`
**Composant :** `SuperAdminDesignPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState } ⬅️ "react";`
  * `{ useRouter } ⬅️ "next/navigation";`
  * `{ useDesigns } ⬅️ "@/hooks/useDesigns";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile/HeaderMobile";`
  * `{ Design } ⬅️ "@/types";`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useDesigns` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/super-admin/discussions/page.tsx`
**Composant :** `AdminDiscussionsPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ "react";`
  * `{ useRouter, useSearchParams } ⬅️ "next/navigation";`
  * `{ ChatBox } ⬅️ "@/components/Messages/ChatBox";`
  * `{ useAuth } ⬅️ "@/hooks/useAuth";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile";`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useAuth` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useSearchParams` pour manager l'état réactif de la page.
  * Utilise `useSocket` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/super-admin/help/page.tsx`
**Composant :** `SuperAdminHelpPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useState } ⬅️ 'react';`
  * `{ Card } ⬅️ '@/components/ui/card';`
  * `{ Button } ⬅️ '@/components/Button/Button';`

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/super-admin/invitations/page.tsx`
**Composant :** `AdminInvitationsPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ "react";`
  * `{ useRouter } ⬅️ "next/navigation";`
  * `{ apiClient } ⬅️ "@/lib/api/apiClient";`
  * `{ useDesigns } ⬅️ "@/hooks/useDesigns";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile";`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useDesigns` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/super-admin/invitations/[id]/design/page.tsx`
**Composant :** `InvitationDesignPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ "react";`
  * `{ useParams, useRouter } ⬅️ "next/navigation";`
  * `{ apiClient } ⬅️ "@/lib/api/apiClient";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile";`
  * `DesignPreview ⬅️ "@/components/DesignPreview";`
- Logique & Hooks :
  * Utilise `useParams` pour manager l'état réactif de la page.
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/super-admin/invitations/[id]/page.tsx`
**Composant :** `InvitationDetailPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ 'react';`
  * `{ useParams, useRouter } ⬅️ 'next/navigation';`
  * `{ apiClient } ⬅️ '@/lib/api/apiClient';`
  * `{ HeaderMobile } ⬅️ '@/components/HeaderMobile';`
  * `styles ⬅️ './invitation-detail.module.css';`
- Logique & Hooks :
  * Utilise `useParams` pour manager l'état réactif de la page.
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/super-admin/newsletters/create/page.tsx`
**Composant :** `CreateNewsletterPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ "react";`
  * `{ useRouter } ⬅️ "next/navigation";`
  * `{ useNewsletters } ⬅️ "@/hooks/useNewsletters";`
  * `{`
  * `styles ⬅️ "./page.module.css";`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useNewsletters` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/super-admin/newsletters/page.tsx`
**Composant :** `NewslettersPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ "react";`
  * `{ useRouter } ⬅️ "next/navigation";`
  * `{ useNewsletters } ⬅️ "@/hooks/useNewsletters";`
  * `{ newslettersApi } ⬅️ "@/lib/api/newsletters";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile";`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useNewsletters` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/super-admin/newsletters/[id]/page.tsx`
**Composant :** `NewsletterDetailPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ "react";`
  * `{ useRouter, useParams } ⬅️ "next/navigation";`
  * `{ useNewsletters } ⬅️ "@/hooks/useNewsletters";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile";`
  * `{`
- Logique & Hooks :
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useParams` pour manager l'état réactif de la page.
  * Utilise `useNewsletters` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/super-admin/providers/page.tsx`
**Composant :** `AdminProvidersPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ "react";`
  * `Link ⬅️ "next/link";`
  * `{ useAdminProviders } ⬅️ "@/hooks/useAdminProviders";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile";`
  * `{`
- Logique & Hooks :
  * Utilise `useAdminProviders` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/super-admin/providers/[id]/page.tsx`
**Composant :** `ProviderDetailPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect } ⬅️ "react";`
  * `{ useParams, useRouter } ⬅️ "next/navigation";`
  * `{ providersApi, ProviderProfile } ⬅️ "@/lib/api/providers";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile";`
  * `{`
- Logique & Hooks :
  * Utilise `useParams` pour manager l'état réactif de la page.
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/super-admin/service-packs/page.tsx`
**Composant :** `ServicePacksAdminPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useEffect, useMemo, useState } ⬅️ "react";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile";`
  * `{`
  * `styles ⬅️ "./service-packs.module.css";`
  * `{`
- Logique & Hooks :
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.
  * Utilise `useMemo` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/super-admin/settings/page.tsx`
**Composant :** `SettingsPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `styles ⬅️ './settings.module.css';`
  * `Image ⬅️ 'next/image';`

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/super-admin/stats/page.tsx`
**Composant :** `StatsPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState } ⬅️ "react";`
  * `styles ⬅️ "./stats.module.css";`
  * `{ useAdminStats } ⬅️ "@/hooks/useAdminStats";`
  * `{`
  * `{`
- Logique & Hooks :
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useAdminStats` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(extranet)/super-admin/users/page.tsx`
**Composant :** `UsersPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState } ⬅️ "react";`
  * `styles ⬅️ "./users.module.css";`
  * `{ useAdminUsers } ⬅️ "@/hooks/useAdminUsers";`
  * `{ HeaderMobile } ⬅️ "@/components/HeaderMobile";`
  * `{`
- Logique & Hooks :
  * Utilise `useAdminUsers` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(site)/auth/forgot-password/page.tsx`
**Composant :** `ForgotPasswordPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState } ⬅️ 'react';`
  * `{ useAuth } ⬅️ '@/hooks/useAuth';`
  * `Link ⬅️ 'next/link';`
  * `{ ArrowLeft } ⬅️ 'lucide-react';`
  * `styles ⬅️ '@/styles/site/auth.module.css';`
- Logique & Hooks :
  * Utilise `useAuth` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(site)/auth/login/page.tsx`
**Composant :** `LoginPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState } ⬅️ 'react';`
  * `{ useRouter } ⬅️ 'next/navigation';`
  * `Link ⬅️ 'next/link';`
  * `{ useAuth } ⬅️ '@/hooks/useAuth';`
  * `{ Eye, EyeOff } ⬅️ 'lucide-react';`
- Logique & Hooks :
  * Utilise `useAuth` pour manager l'état réactif de la page.
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(site)/auth/register/page.tsx`
**Composant :** `RegisterPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, useEffect, Suspense } ⬅️ 'react';`
  * `{ useRouter, useSearchParams } ⬅️ 'next/navigation';`
  * `Link ⬅️ 'next/link';`
  * `{ useAuth } ⬅️ '@/hooks/useAuth';`
  * `{ Eye, EyeOff } ⬅️ 'lucide-react';`
- Logique & Hooks :
  * Utilise `useAuth` pour manager l'état réactif de la page.
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useSearchParams` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(site)/auth/reset-password/page.tsx`
**Composant :** `ResetPasswordPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, Suspense } ⬅️ 'react';`
  * `{ useSearchParams } ⬅️ 'next/navigation';`
  * `Link ⬅️ 'next/link';`
  * `{ Eye, EyeOff, Check, X, ArrowLeft } ⬅️ 'lucide-react';`
  * `styles ⬅️ '@/styles/site/auth.module.css';`
- Logique & Hooks :
  * Utilise `useSearchParams` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(site)/auth/verify-email/page.tsx`
**Composant :** `VerifyEmailPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState, Suspense } ⬅️ 'react';`
  * `{ useSearchParams, useRouter } ⬅️ 'next/navigation';`
  * `Link ⬅️ 'next/link';`
  * `{ useAuth } ⬅️ '@/hooks/useAuth';`
  * `{ ArrowLeft, CheckCircle, AlertCircle } ⬅️ 'lucide-react';`
- Logique & Hooks :
  * Utilise `useAuth` pour manager l'état réactif de la page.
  * Utilise `useSearchParams` pour manager l'état réactif de la page.
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(site)/blog/host/page.tsx`
**Composant :** `HostBlogPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React ⬅️ 'react';`
  * `Link ⬅️ 'next/link';`
  * `Image ⬅️ 'next/image';`
  * `{ ArrowRight, Calendar, Heart, Star } ⬅️ 'lucide-react';`
  * `styles ⬅️ '../blog.module.css';`

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(site)/blog/host/[slug]/page.tsx`
**Composant :** `BlogPostPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React ⬅️ 'react';`
  * `{ notFound } ⬅️ 'next/navigation';`
  * `Image ⬅️ 'next/image';`
  * `Link ⬅️ 'next/link';`
  * `{ ArrowLeft, Calendar, User } ⬅️ 'lucide-react';`

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(site)/blog/provider/page.tsx`
**Composant :** `ProviderBlogPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React ⬅️ 'react';`
  * `Link ⬅️ 'next/link';`
  * `Image ⬅️ 'next/image';`
  * `{ ArrowRight, Calendar, TrendingUp } ⬅️ 'lucide-react';`
  * `styles ⬅️ '../blog.module.css'; // Reuse styles`

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(site)/blog/provider/[slug]/page.tsx`
**Composant :** `BlogPostPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React ⬅️ 'react';`
  * `{ notFound } ⬅️ 'next/navigation';`
  * `Image ⬅️ 'next/image';`
  * `Link ⬅️ 'next/link';`
  * `{ ArrowLeft, Calendar, User } ⬅️ 'lucide-react';`

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(site)/conditions-utilisation/page.tsx`
**Composant :** `ConditionsUtilisationPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React ⬅️ 'react';`
  * `{ Calendar, Mail, FileText, AlertCircle, CheckCircle, XCircle } ⬅️ 'lucide-react';`
  * `styles ⬅️ '../mentions-legales/legal.module.css';`

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(site)/mentions-legales/page.tsx`
**Composant :** `MentionsLegalesPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React ⬅️ 'react';`
  * `{ Calendar, Mail, Globe, Server } ⬅️ 'lucide-react';`
  * `styles ⬅️ './legal.module.css';`

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(site)/page.tsx`
**Composant :** `Home`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `{ useState } ⬅️ 'react';`
  * `{ Hero } ⬅️ '@/components/Kavent/Hero';`
  * `{ Features } ⬅️ '@/components/Kavent/Features';`
  * `{ HowItWorks } ⬅️ '@/components/Kavent/HowItWorks';`
  * `{ Testimonials } ⬅️ '@/components/Kavent/Testimonials';`
- Logique & Hooks :
  * Utilise `useState` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(site)/politique-confidentialite/page.tsx`
**Composant :** `PolitiqueConfidentialitePage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React ⬅️ 'react';`
  * `{ Calendar, Mail, Shield, Lock, Database, Eye, UserCheck, FileText } ⬅️ 'lucide-react';`
  * `styles ⬅️ '../mentions-legales/legal.module.css';`

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(site)/rsvp/shared/[shareableToken]/merci/page.tsx`
**Composant :** `SharedRSVPThankYouPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useState, useEffect } ⬅️ "react";`
  * `{`
  * `{ toPng } ⬅️ "html-to-image";`
  * `jsPDF ⬅️ "jspdf";`
  * `styles ⬅️ "./merci.module.css";`
- Logique & Hooks :
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(site)/rsvp/shared/[shareableToken]/page.tsx`
**Composant :** `SharedRSVPPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useState, useEffect } ⬅️ 'react';`
  * `{ useParams, useRouter } ⬅️ 'next/navigation';`
  * `{ Button } ⬅️ '@/components/ui/button';`
  * `DesignPreview ⬅️ '@/components/DesignPreview';`
  * `GuestProfilePhotoUpload ⬅️ '@/components/GuestProfilePhotoUpload/GuestProfilePhotoUpload';`
- Appels API Backend :
  * Appel vers `/api/rsvp/shared/${shareableToken}/invitation`
  * Appel vers `/api/rsvp/shared/${shareableToken}/status?phone=${encodeURIComponent(savedPhone)}`
  * Appel vers `/api/rsvp/shared/${shareableToken}/respond`
- Logique & Hooks :
  * Utilise `useParams` pour manager l'état réactif de la page.
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useNotifications` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(site)/rsvp/[token]/merci/page.tsx`
**Composant :** `RSVPThankYouPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useState, useEffect, use } ⬅️ "react";`
  * `{`
  * `{ toPng } ⬅️ "html-to-image";`
  * `jsPDF ⬅️ "jspdf";`
  * `{ rsvpApi } ⬅️ "@/lib/api/rsvp";`
- Logique & Hooks :
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(site)/rsvp/[token]/page.tsx`
**Composant :** `RSVPPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useState, useEffect } ⬅️ "react";`
  * `EnvelopeWrapper ⬅️ "@/components/rsvp/EnvelopeWrapper";`
  * `{ useParams, useRouter } ⬅️ "next/navigation";`
  * `{ rsvpApi, type RSVPStatus as ApiRSVPStatus } ⬅️ "@/lib/api/rsvp";`
  * `DesignPreview ⬅️ "@/components/DesignPreview";`
- Logique & Hooks :
  * Utilise `useParams` pour manager l'état réactif de la page.
  * Utilise `useRouter` pour manager l'état réactif de la page.
  * Utilise `useNotifications` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

### 📍 Route : `(site)/share-album/[id]/page.tsx`
**Composant :** `ShareAlbumPage`

**Description Fonctionnelle :**
- Rôle : Pilote l'interface associée à cette route pour l'utilisateur.
- Librairies & Composants :
  * `React, { useState, useEffect } ⬅️ 'react';`
  * `{ useParams } ⬅️ 'next/navigation';`
  * `{`
  * `{ uploadToFirebase } ⬅️ '@/lib/firebase';`
  * `imageCompression ⬅️ 'browser-image-compression';`
- Appels API Backend :
  * Appel vers `/api/photos/albums/${albumId}/photos`
  * Appel vers `/api/photos/albums/${albumId}/photos/guest`
- Logique & Hooks :
  * Utilise `useParams` pour manager l'état réactif de la page.
  * Utilise `useState` pour manager l'état réactif de la page.
  * Utilise `useEffect` pour manager l'état réactif de la page.

**Ingéniosité Tech :**
- Permet un affichage dynamique et un chargement asynchrone non-bloquant.
- Améliore la réactivité de l'application via des rafraîchissements sélectifs.

---

