# 🤖 Intégration Google Gemini AI

## Installation

1. Installer le package nécessaire :
```bash
cd wedding-back
npm install @google/generative-ai
```

2. Ajouter la clé API dans votre fichier `.env` :
```env
GEMINI_API_KEY="AIzaSyBDrTEY-0ah15O5YPqP4cvnyQG0fx4Z-_s"
```

## Fonctionnalités

### 1. Génération de checklist de planning (pour les HOSTS)

**Endpoint:** `POST /api/ai/generate-checklist`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "invitationId": "uuid-de-l-invitation",
  "guestCount": 150,
  "budget": 15000,
  "additionalInfo": "Cérémonie en extérieur, réception dans une grange"
}
```

**Note:** Le `eventType` et `eventDate` sont automatiquement récupérés depuis l'invitation sélectionnée.

**Response:**
```json
{
  "message": "Checklist générée avec succès",
  "items": [
    {
      "title": "Réserver le lieu de réception",
      "description": "Réserver le lieu principal pour la cérémonie et la réception",
      "category": "VENUE",
      "priority": "HIGH",
      "dueDate": "6 months before",
      "suggestedDate": "2024-12-15",
      "actionLink": "/client/guests"
    },
    // ... autres tâches
  ]
}
```

**Note:** Chaque tâche peut inclure un `actionLink` qui redirige vers la page appropriée :
- `/client/providers/all` - Pour les tâches liées aux prestataires
- `/client/invitations` - Pour les tâches de création/design d'invitations
- `/client/guests` - Pour les tâches de gestion des invités

### 2. Amélioration de description de service (pour les PROVIDERS)

**Endpoint:** `POST /api/ai/improve-description`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "serviceName": "Photographie de mariage",
  "currentDescription": "Je prends des photos de mariage",
  "category": "PHOTOGRAPHY",
  "price": 1500
}
```

**Response:**
```json
{
  "message": "Description améliorée avec succès",
  "improvedDescription": "Photographe professionnel spécialisé dans les mariages...",
  "suggestions": [
    "Ajoutez des exemples de votre portfolio",
    "Mentionnez votre style photographique unique",
    "Précisez ce qui est inclus dans le forfait"
  ]
}
```

## Catégories de tâches disponibles

- `PROVIDER` - Prestataires
- `ADMIN` - Administratif
- `DECORATION` - Décoration
- `CATERING` - Traiteur
- `PHOTOGRAPHY` - Photographie
- `MUSIC` - Musique
- `TRANSPORT` - Transport
- `VENUE` - Lieu
- `GUEST_MANAGEMENT` - Gestion invités
- `OTHER` - Autre

## Priorités

- `LOW` - Basse
- `MEDIUM` - Moyenne
- `HIGH` - Haute
- `URGENT` - Urgente

## 🌍 Détection automatique de la langue

Le service détecte automatiquement la langue de l'input et répond dans la même langue.

**Langues supportées :**
- Français (fr)
- Anglais (en)
- Arabe (ar)
- Espagnol (es)
- Allemand (de)
- Italien (it)
- Portugais (pt)
- Et toutes les autres langues détectées par Gemini

**Exemples :**

Input en anglais :
```json
{
  "eventType": "Wedding",
  "eventDate": "2025-06-15",
  "additionalInfo": "Outdoor ceremony, reception in a barn"
}
```
→ La réponse sera en anglais

Input en arabe :
```json
{
  "serviceName": "تصوير الأعراس",
  "currentDescription": "أقدم خدمات التصوير الفوتوغرافي للأعراس"
}
```
→ La réponse sera en arabe

## 🎯 Détection contextuelle des liens d'action

Le service analyse intelligemment le contexte de chaque tâche générée pour déterminer le lien de page le plus approprié :

- **Gestion des invités** → `/client/guests` (même si le mot "invitation" apparaît, si le contexte principal concerne la gestion des invités)
- **Création/Design d'invitations** → `/client/invitations` (pour créer ou personnaliser le design)
- **Prestataires** → `/client/providers/all` (pour trouver, contacter ou réserver des prestataires)

**Exemple :**
- "Finaliser la liste des invités et envoyer les invitations" → `/client/guests` (contexte: gestion des invités)
- "Créer le design de l'invitation" → `/client/invitations` (contexte: création/design)

## Notes

- Les deux endpoints nécessitent une authentification (token JWT)
- Le service utilise le modèle `gemini-2.0-flash-lite` de Google (ultra rapide, optimisé pour le débit élevé)
- La détection de langue est automatique basée sur le contenu de l'input
- La détection contextuelle des liens utilise l'IA pour analyser le contexte réel de chaque tâche
- En cas d'erreur, vérifiez que `GEMINI_API_KEY` est bien définie dans votre `.env`

