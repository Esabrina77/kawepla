import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY non définie. Les fonctionnalités AI seront désactivées.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface GenerateChecklistRequest {
  invitationId?: string; // Optionnel car peut être passé depuis le controller
  eventType: string;
  eventDate: string;
  guestCount?: number;
  budget?: number;
  additionalInfo?: string;
}

export interface ChecklistItem {
  title: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string; // Date relative (ex: "3 months before", "1 week before")
  suggestedDate?: string; // Date calculée basée sur eventDate
  actionLink?: string; // Lien vers la page correspondante (ex: /client/providers/all)
}

export interface GenerateChecklistResponse {
  items: ChecklistItem[];
}

export interface ImproveDescriptionRequest {
  currentDescription: string;
  serviceName: string;
  category?: string;
  price?: number;
}

export interface ImproveDescriptionResponse {
  improvedDescription: string;
  suggestions?: string[];
}

export class GeminiService {
  /**
   * Détecte la langue du texte en utilisant Gemini
   */
  private static async detectLanguage(text: string): Promise<string> {
    if (!genAI) {
      return 'fr'; // Par défaut français
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
      const prompt = `Détecte la langue de ce texte et réponds UNIQUEMENT avec le code ISO de la langue (ex: fr, en, ar, es, de, it, pt, etc.). Si tu ne peux pas détecter, réponds "fr".

Texte: "${text.substring(0, 200)}"

Réponds UNIQUEMENT avec le code langue (2 lettres), rien d'autre.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const detectedLang = response.text().trim().toLowerCase().substring(0, 2);

      // Valider que c'est un code langue valide (2 lettres)
      if (/^[a-z]{2}$/.test(detectedLang)) {
        return detectedLang;
      }
      return 'fr';
    } catch (error) {
      console.error('Erreur détection langue:', error);
      return 'fr';
    }
  }

  /**
   * Génère une checklist de planning basée sur les informations de l'événement
   */
  static async generateChecklist(data: GenerateChecklistRequest): Promise<GenerateChecklistResponse> {
    if (!genAI) {
      throw new Error('Service Gemini non configuré. Vérifiez GEMINI_API_KEY.');
    }

    try {
      // Détecter la langue à partir des champs texte
      const textToAnalyze = [
        data.eventType,
        data.additionalInfo
      ].filter(Boolean).join(' ');

      const detectedLang = textToAnalyze ? await this.detectLanguage(textToAnalyze) : 'fr';

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

      // Adapter le prompt selon la langue détectée
      const languageInstructions: Record<string, string> = {
        'fr': 'Réponds en français.',
        'en': 'Respond in English.',
        'ar': 'أجب بالعربية.',
        'es': 'Responde en español.',
        'de': 'Antworte auf Deutsch.',
        'it': 'Rispondi in italiano.',
        'pt': 'Responda em português.',
      };

      const langInstruction = languageInstructions[detectedLang] || `Respond in the same language as the input text (detected: ${detectedLang}).`;

      // Calculer le nombre de jours entre aujourd'hui et l'événement
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const eventDateObj = new Date(data.eventDate);
      eventDateObj.setHours(0, 0, 0, 0);
      const daysUntilEvent = Math.ceil((eventDateObj.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
      const monthsUntilEvent = Math.floor(daysUntilEvent / 30);
      const weeksUntilEvent = Math.floor(daysUntilEvent / 7);
      const todayStr = todayDate.toISOString().split('T')[0];

      const prompt = `You are an expert event planning assistant. Generate a complete checklist of tasks to organize an event.

IMPORTANT: ${langInstruction} All titles, descriptions, and text must be in the same language as the input.

Event information:
- Type: ${data.eventType}
- Date: ${data.eventDate}
${data.guestCount ? `- Guest count: ${data.guestCount}` : ''}
${data.budget ? `- Budget: ${data.budget}€` : ''}
${data.additionalInfo ? `- Additional info: ${data.additionalInfo}` : ''}

CRITICAL DATE CALCULATION:
- Today's date: ${todayStr}
- Event date: ${data.eventDate}
- Days until event: ${daysUntilEvent} days (${monthsUntilEvent} months, ${weeksUntilEvent} weeks)

CHRONOLOGICAL ORDER - TASKS MUST FOLLOW LOGICAL SEQUENCE:
Tasks must be ordered chronologically from earliest to latest. Follow this logical sequence:

PHASE 1 - INITIAL PLANNING (Earliest - ${monthsUntilEvent >= 3 ? '3-6 months before' : 'as soon as possible'}):
- Define theme/concept
- Establish detailed budget
- These are FOUNDATION tasks that must come FIRST

PHASE 2 - GUEST LIST & INVITATIONS (Early - ${monthsUntilEvent >= 2 ? '2-3 months before' : 'early'}):
- Create guest list FIRST
- Create invitation design SECOND (after guest list)
- Send invitations THIRD (after design is created)
- Manage RSVP AFTER invitations are sent

PHASE 3 - VENUE & MAJOR PROVIDERS (Early - ${monthsUntilEvent >= 2 ? '2-3 months before' : 'early'}):
- Select and book venue FIRST (everything depends on venue)
- Book major providers (caterer, photographer, DJ) - can be done in parallel after venue

PHASE 4 - DETAILS & PREPARATIONS (Mid-term - ${monthsUntilEvent >= 1 ? '1-2 months before' : 'mid-term'}):
- Plan decoration details
- Create seating plan
- Organize transport
- Buy supplies

PHASE 5 - CONFIRMATIONS (Late - ${weeksUntilEvent >= 2 ? '2-4 weeks before' : 'late'}):
- Confirm all reservations with providers
- Confirm final guest count
- Contact guests who haven't responded

PHASE 6 - FINAL PREPARATIONS (Very late - ${weeksUntilEvent >= 1 ? '1 week before' : 'days before'}):
- Final venue preparation
- Last-minute details
- Enjoy the event!

RULES FOR DUE DATES:
1. ALL due dates MUST be >= ${todayStr} (today). NEVER generate dates in the past.
2. Follow the chronological phases above - earlier phases MUST have earlier dates than later phases
3. Adapt the timing based on how far the event is:
   - If event is in ${daysUntilEvent} days (${monthsUntilEvent} months), tasks should be scheduled from TODAY onwards
   - If a task would normally be "6 months before" but the event is only ${monthsUntilEvent} months away, schedule it for TODAY or within the next few days
4. CRITICAL: Tasks that are prerequisites for others MUST have earlier dates:
   - Guest list BEFORE sending invitations
   - Invitation design BEFORE sending invitations
   - Venue selection BEFORE booking providers (providers need to know the venue)
   - Sending invitations BEFORE managing RSVP
   - Booking providers BEFORE confirming reservations
5. Generate realistic dates that make sense given the time remaining until the event

PLATFORM TOOLS - USE INTEGRATED FEATURES INSTEAD OF EXTERNAL SOLUTIONS:
The user has access to a platform with integrated tools. Mention using platform tools naturally when relevant, but avoid repeating the platform name multiple times in the same description:

1. GUEST MANAGEMENT (/client/guests):
   - Adding/managing guest list: "Utiliser les outils de gestion d'invités" or "Gérer la liste via la plateforme"
   - Sending invitations to guests: "Envoyer les invitations via la plateforme" or "Utiliser les outils d'envoi"
   - RSVP management: "Gérer les réponses via la page de gestion d'invités" or "Suivre les RSVP avec les outils intégrés"
   - Guest registration/inscription: "Utiliser la fonctionnalité d'inscription des invités" or "Gérer les inscriptions via la plateforme"
   - NEVER suggest creating external websites, registration pages, or third-party tools - use the platform's built-in guest management

2. INVITATIONS (/client/invitations):
   - Creating invitation design: "Créer le design de l'invitation" or "Utiliser les outils de création d'invitations"
   - Customizing invitation: "Personnaliser l'invitation avec les templates disponibles" or "Utiliser les modèles de la plateforme"
   - NEVER suggest external invitation creation tools or websites

3. PROVIDERS (/client/providers/all):
   - Finding providers: "Rechercher des prestataires via la plateforme" or "Utiliser l'annuaire de prestataires"
   - Contacting providers: "Contacter les prestataires via la plateforme" or "Utiliser les outils de communication"
   - Booking services: "Réserver les services via la plateforme" or "Effectuer la réservation en ligne"
   - NEVER suggest external provider directories or third-party booking platforms

IMPORTANT: 
- Mention platform tools naturally, but avoid repeating "Kawepla" or "plateforme" multiple times in the same description
- Use varied formulations: "via la plateforme", "utiliser les outils intégrés", "avec les fonctionnalités disponibles", etc.
- Keep descriptions concise and natural - one mention per description is enough
- Do NOT suggest external tools, websites, or services when the platform has built-in functionality

Generate a structured task list with:
- Task title (short and clear) - IN THE SAME LANGUAGE AS INPUT
- Description (1-2 sentences) - IN THE SAME LANGUAGE AS INPUT - Mention platform tools naturally when relevant (only once per description, avoid repetition)
- Category (PROVIDER, ADMIN, DECORATION, CATERING, PHOTOGRAPHY, MUSIC, TRANSPORT, VENUE, GUEST_MANAGEMENT, OTHER) - keep in English
- Priority (LOW, MEDIUM, HIGH, URGENT) - keep in English
- Due date relative (examples: "6 months before", "3 months before", "1 month before", "2 weeks before", "1 week before", "3 days before", "1 day before") - keep in English format but adapt the time unit words if needed

Respond ONLY with valid JSON in the following format (no markdown, no code blocks):
{
  "items": [
    {
      "title": "Task title in input language",
      "description": "Task description in input language - mention Kawepla tools when relevant",
      "category": "CATEGORY",
      "priority": "PRIORITY",
      "dueDate": "X months/weeks/days before"
    }
  ]
}

Generate EXACTLY 20 highly relevant and essential tasks, distributed across the entire preparation period from today until the event date. Focus on the most important tasks only.

CRITICAL: Ensure tasks are in CHRONOLOGICAL ORDER. Examples of correct sequence:
1. "Établir le budget" → 3-6 months before (FIRST)
2. "Définir le thème" → 3-6 months before (FIRST)
3. "Établir la liste des invités" → 2-3 months before (BEFORE invitation design)
4. "Créer le design de l'invitation" → 2-3 months before (BEFORE sending)
5. "Sélectionner le lieu" → 2-3 months before (BEFORE booking providers)
6. "Réserver le traiteur" → 2-3 months before (AFTER venue)
7. "Envoyer les invitations" → 1-2 months before (AFTER design is created)
8. "Gérer les RSVP" → 1-2 months before (AFTER invitations sent)
9. "Confirmer les réservations" → 2-4 weeks before (AFTER bookings)
10. "Préparer le lieu" → 1 week before (BEFORE event)

The JSON items should be ordered from earliest due date to latest due date.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Nettoyer la réponse (enlever markdown si présent)
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(cleanedText);

      // Calculer les dates suggérées basées sur la date de l'événement
      const eventDate = new Date(data.eventDate);
      eventDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Réinitialiser l'heure pour la comparaison

      // Fonction pour déterminer le lien d'action selon le contexte (utilise Gemini)
      const getActionLink = async (category: string, title: string, description: string): Promise<string | undefined> => {
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

          const prompt = `Analyse cette tâche d'organisation d'événement et détermine le lien de page le plus approprié selon le CONTEXTE principal de la tâche.

Tâche:
- Titre: "${title}"
- Description: "${description}"
- Catégorie: "${category}"

Pages disponibles:
1. /client/providers/all - Pour trouver, contacter ou gérer des prestataires (traiteur, photographe, DJ, décorateur, etc.)
2. /client/invitations - Pour créer, modifier ou personnaliser le design des invitations (création d'invitation, design, template)
3. /client/guests - Pour gérer la liste des invités, ajouter/modifier des invités, voir les RSVP, envoyer des invitations aux invités

IMPORTANT: Analyse le CONTEXTE principal de la tâche:
- Si la tâche concerne principalement la GESTION DES INVITÉS (liste, ajout, modification, RSVP, envoyer invitations aux invités), même si le mot "invitation" apparaît, c'est /client/guests
- Si la tâche concerne la CRÉATION/DESIGN d'invitations (créer une invitation, personnaliser le design), c'est /client/invitations
- Si la tâche concerne les PRESTATAIRES (trouver, contacter, réserver), c'est /client/providers/all

Exemples:
- "Finaliser la liste des invités et envoyer les invitations" → /client/guests (contexte: gestion des invités)
- "Créer le design de l'invitation" → /client/invitations (contexte: création/design)
- "Trouver un traiteur" → /client/providers/all (contexte: prestataires)

Réponds UNIQUEMENT avec le chemin (ex: /client/guests) ou "none" si aucun lien n'est approprié. Pas d'explication, juste le chemin ou "none".`;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const link = response.text().trim().toLowerCase();

          // Nettoyer la réponse
          const cleanLink = link.replace(/['"]/g, '').trim();

          // Valider les liens possibles
          const validLinks = ['/client/providers/all', '/client/invitations', '/client/guests'];
          if (validLinks.includes(cleanLink)) {
            return cleanLink;
          }

          return undefined;
        } catch (error) {
          console.error('Erreur lors de la détection du lien contextuel:', error);
          // Fallback sur une logique simple si Gemini échoue
          return undefined;
        }
      };

      // Traiter les items avec dates et liens (en parallèle pour optimiser)
      const itemsWithDates = await Promise.all(
        parsed.items.map(async (item: ChecklistItem) => {
          const suggestedDate = this.calculateSuggestedDate(eventDate, item.dueDate);
          const actionLink = await getActionLink(item.category, item.title, item.description);

          // Si la date calculée est dans le passé ou nulle, utiliser aujourd'hui comme date minimum
          if (!suggestedDate) {
            return {
              ...item,
              suggestedDate: today.toISOString().split('T')[0],
              actionLink
            };
          }

          // Normaliser la date suggérée (enlever l'heure)
          suggestedDate.setHours(0, 0, 0, 0);

          // Si la date calculée est dans le passé, utiliser aujourd'hui
          if (suggestedDate < today) {
            console.log(`⚠️ Date passée détectée: ${suggestedDate.toISOString().split('T')[0]} pour "${item.title}", remplacée par aujourd'hui`);
            return {
              ...item,
              suggestedDate: today.toISOString().split('T')[0],
              actionLink
            };
          }

          return {
            ...item,
            suggestedDate: suggestedDate.toISOString().split('T')[0],
            actionLink
          };
        })
      );

      // Trier les tâches par date chronologique (du plus tôt au plus tard)
      const sortedItems = itemsWithDates.sort((a, b) => {
        if (!a.suggestedDate) return 1;
        if (!b.suggestedDate) return -1;
        return new Date(a.suggestedDate).getTime() - new Date(b.suggestedDate).getTime();
      });

      return {
        items: sortedItems
      };
    } catch (error) {
      console.error('Erreur lors de la génération de checklist:', error);
      throw new Error('Erreur lors de la génération de la checklist. Veuillez réessayer.');
    }
  }

  /**
   * Améliore une description de service pour les providers
   */
  static async improveDescription(data: ImproveDescriptionRequest): Promise<ImproveDescriptionResponse> {
    if (!genAI) {
      throw new Error('Service Gemini non configuré. Vérifiez GEMINI_API_KEY.');
    }

    try {
      // Détecter la langue à partir de la description actuelle
      const textToAnalyze = `${data.serviceName} ${data.currentDescription}`;
      const detectedLang = await this.detectLanguage(textToAnalyze);

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

      // Adapter le prompt selon la langue détectée
      const languageInstructions: Record<string, string> = {
        'fr': 'Réponds en français.',
        'en': 'Respond in English.',
        'ar': 'أجب بالعربية.',
        'es': 'Responde en español.',
        'de': 'Antworte auf Deutsch.',
        'it': 'Rispondi in italiano.',
        'pt': 'Responda em português.',
      };

      const langInstruction = languageInstructions[detectedLang] || `Respond in the same language as the input text (detected: ${detectedLang}).`;

      const prompt = `You are an expert in marketing copywriting for event services. Improve this service description to make it more attractive, professional, and optimized for conversion.

IMPORTANT: ${langInstruction} All text must be in the same language as the input.

Service: ${data.serviceName}
${data.category ? `Category: ${data.category}` : ''}
${data.price ? `Price: ${data.price}€` : ''}

Current description:
${data.currentDescription}

Improve this description by:
1. Making it more engaging and professional
2. Highlighting benefits for the client
3. Using vocabulary appropriate for the event industry
4. Keeping a warm but professional tone
5. Optimizing for SEO with relevant keywords
6. Keeping a similar length (do not exceed 300 words)

Respond ONLY with valid JSON in the following format (no markdown, no code blocks):
{
  "improvedDescription": "Improved description in input language",
  "suggestions": ["Suggestion 1 in input language", "Suggestion 2 in input language", "Suggestion 3 in input language"]
}

Suggestions should be short tips (1 sentence) to further improve the service, all in the same language as the input.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Nettoyer la réponse
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(cleanedText);

      return {
        improvedDescription: parsed.improvedDescription,
        suggestions: parsed.suggestions || []
      };
    } catch (error) {
      console.error('Erreur lors de l\'amélioration de description:', error);
      throw new Error('Erreur lors de l\'amélioration de la description. Veuillez réessayer.');
    }
  }

  /**
   * Calcule une date suggérée basée sur la date de l'événement et une date relative
   * Retourne null si la date calculée est dans le passé
   */
  private static calculateSuggestedDate(eventDate: Date, relativeDate: string): Date | null {
    const date = new Date(eventDate);
    date.setHours(0, 0, 0, 0);
    const lower = relativeDate.toLowerCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let calculatedDate: Date | null = null;

    if (lower.includes('month')) {
      const months = parseInt(lower.match(/(\d+)\s*month/i)?.[1] || '0');
      calculatedDate = new Date(date);
      calculatedDate.setMonth(calculatedDate.getMonth() - months);
    } else if (lower.includes('week')) {
      const weeks = parseInt(lower.match(/(\d+)\s*week/i)?.[1] || '0');
      calculatedDate = new Date(date);
      calculatedDate.setDate(calculatedDate.getDate() - (weeks * 7));
    } else if (lower.includes('day')) {
      const days = parseInt(lower.match(/(\d+)\s*day/i)?.[1] || '0');
      calculatedDate = new Date(date);
      calculatedDate.setDate(calculatedDate.getDate() - days);
    } else {
      return null;
    }

    // Normaliser la date calculée
    if (calculatedDate) {
      calculatedDate.setHours(0, 0, 0, 0);

      // Si la date calculée est dans le passé, retourner null (sera remplacée par aujourd'hui)
      if (calculatedDate < today) {
        return null;
      }
    }

    return calculatedDate;
  }

  /**
   * Chat conversationnel avec Gemini 2.0 Flash Lite
   */
  static async chat(data: {
    message: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    context?: {
      page?: string;
      role?: 'HOST' | 'PROVIDER' | 'ADMIN';
      userId?: string;
    };
  }): Promise<{ message: string }> {
    if (!genAI) {
      throw new Error('Service Gemini non configuré. Vérifiez GEMINI_API_KEY.');
    }

    try {
      // Détecter la langue du message utilisateur
      const detectedLang = await this.detectLanguage(data.message);

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

      // Adapter le prompt selon la langue détectée
      const languageInstructions: Record<string, string> = {
        'fr': 'Réponds en français.',
        'en': 'Respond in English.',
        'ar': 'أجب بالعربية.',
        'es': 'Responde en español.',
        'de': 'Antworte auf Deutsch.',
        'it': 'Rispondi in italiano.',
        'pt': 'Responda em português.',
      };

      const langInstruction = languageInstructions[detectedLang] || `Respond in the same language as the input text (detected: ${detectedLang}).`;

      // Déterminer le contexte de la page
      const pageContext = data.context?.page || 'unknown';
      const userRole = data.context?.role || 'HOST'; // Par défaut HOST

      let contextSpecificPrompt = "";

      // Logique spécifique par rôle et par page
      if (userRole === 'HOST') {
        contextSpecificPrompt += `\nCONTEXTE UTILISATEUR : Tu parles à un ORGANISATEUR D'ÉVÉNEMENT (Hôte). Il organise un événement (Mariage, Anniversaire, Baptême, Soirée d'entreprise, etc.).\n`;

        if (pageContext.includes('dashboard')) {
          contextSpecificPrompt += `PAGE ACTUELLE : TABLEAU DE BORD (/client/dashboard)
Rôle de cette page : Vue d'ensemble de l'organisation.
Ce que l'utilisateur peut faire ici : Voir le compte à rebours, le résumé du budget, les tâches urgentes, et les dernières notifications.
Aide possible : "Comment avancer dans mon planning ?", "Où en est mon budget ?", "Quelles sont les prochaines étapes ?"`;
        } else if (pageContext.includes('invitations')) {
          contextSpecificPrompt += `PAGE ACTUELLE : INVITATIONS (/client/invitations)
Rôle de cette page : Création, personnalisation et envoi des faire-part.
Ce que l'utilisateur peut faire ici : Choisir un modèle, utiliser l'éditeur de design (style Canva), gérer les envois (email/SMS), suivre les statuts.
Aide possible : "Comment modifier le texte ?", "Comment importer mes propres photos ?", "Quand envoyer les invitations ?", "Comment suivre les ouvertures ?"`;
        } else if (pageContext.includes('guests')) {
          contextSpecificPrompt += `PAGE ACTUELLE : INVITÉS (/client/guests)
Rôle de cette page : Gestion de la liste des invités et des réponses (RSVP).
Ce que l'utilisateur peut faire ici : Ajouter des invités (manuellement ou import Excel), créer des groupes (famille, amis, collègues), suivre les RSVP (présent/absent), gérer les régimes alimentaires.
Aide possible : "Comment importer une liste Excel ?", "Comment relancer les retardataires ?", "Comment gérer les +1 ?"`;
        } else if (pageContext.includes('providers')) {
          contextSpecificPrompt += `PAGE ACTUELLE : PRESTATAIRES (/client/providers)
Rôle de cette page : Recherche et gestion des fournisseurs (Traiteur, DJ, Photographe, Lieu...).
Ce que l'utilisateur peut faire ici : Parcourir l'annuaire, voir les détails/prix, contacter les prestataires, valider les devis, gérer les paiements.
Aide possible : "Quel budget pour un photographe ?", "Quelles questions poser au traiteur ?", "Comment sécuriser une réservation ?"`;
        } else if (pageContext.includes('tools') || pageContext.includes('planning')) {
          contextSpecificPrompt += `PAGE ACTUELLE : OUTILS DE PLANNING (/client/tools)
Rôle de cette page : Outils d'organisation (Checklist, Budget, Plan de table).
Ce que l'utilisateur peut faire ici : Cocher des tâches, suivre les dépenses, placer les invités sur le plan de table.
Aide possible : "Aide-moi à établir mon budget", "Quelles tâches faire 6 mois avant ?", "Comment organiser les tables ?"`;
        }
      } else if (userRole === 'PROVIDER') {
        contextSpecificPrompt += `\nCONTEXTE UTILISATEUR : Tu parles à un PRESTATAIRE ÉVÉNEMENTIEL (Provider). Il vend ses services.\n`;

        if (pageContext.includes('dashboard')) {
          contextSpecificPrompt += `PAGE ACTUELLE : TABLEAU DE BORD PRO (/provider/dashboard)
Rôle de cette page : Vue d'ensemble de l'activité.
Ce que l'utilisateur peut faire ici : Voir les demandes de réservation en attente, le chiffre d'affaires, les prochains événements.
Aide possible : "Comment augmenter ma visibilité ?", "Comment répondre à une demande ?", "Mes statistiques sont-elles bonnes ?"`;
        } else if (pageContext.includes('services')) {
          contextSpecificPrompt += `PAGE ACTUELLE : MES SERVICES (/provider/services)
Rôle de cette page : Gestion du catalogue de prestations.
Ce que l'utilisateur peut faire ici : Créer/Modifier des services, définir les prix, ajouter des photos, améliorer les descriptions (avec ton aide !).
Aide possible : "Aide-moi à rédiger une description vendeuse", "Quels prix pratiquer ?", "Quelles photos mettre en avant ?"`;
        } else if (pageContext.includes('bookings')) {
          contextSpecificPrompt += `PAGE ACTUELLE : RÉSERVATIONS (/provider/bookings)
Rôle de cette page : Gestion des contrats et du calendrier.
Ce que l'utilisateur peut faire ici : Accepter/Refuser des demandes, envoyer des devis/contrats, voir le calendrier des événements.
Aide possible : "Comment gérer un conflit de date ?", "Que faire si un client annule ?", "Comment envoyer une facture ?"`;
        } else if (pageContext.includes('profile')) {
          contextSpecificPrompt += `PAGE ACTUELLE : MON PROFIL (/provider/profile)
Rôle de cette page : Vitrine publique de l'entreprise.
Ce que l'utilisateur peut faire ici : Modifier les infos de l'entreprise, logo, zone d'intervention, liens réseaux sociaux.
Aide possible : "Comment rendre mon profil plus attractif ?", "Quelles infos sont essentielles ?"`;
        }
      } else if (userRole === 'ADMIN') {
        contextSpecificPrompt += `\nCONTEXTE UTILISATEUR : Tu parles à un ADMINISTRATEUR (Admin). Il gère la plateforme Kawepla.\n`;

        if (pageContext.includes('dashboard')) {
          contextSpecificPrompt += `PAGE ACTUELLE : TABLEAU DE BORD ADMIN (/super-admin/dashboard)
Rôle de cette page : Vue globale de la santé de la plateforme.
Ce que l'utilisateur peut faire ici : Voir les statistiques globales (utilisateurs, événements, revenus), modérer les contenus, gérer les alertes.
Aide possible : "Combien de nouveaux utilisateurs cette semaine ?", "Y a-t-il des signalements à traiter ?", "Quel est le chiffre d'affaires du mois ?"`;
        } else if (pageContext.includes('users')) {
          contextSpecificPrompt += `PAGE ACTUELLE : GESTION UTILISATEURS (/super-admin/users)
Rôle de cette page : Administration des comptes.
Ce que l'utilisateur peut faire ici : Rechercher un utilisateur, bannir/débannir, voir les détails d'un compte, gérer les rôles.
Aide possible : "Comment bannir un utilisateur ?", "Comment voir les détails d'un prestataire ?"`;
        } else if (pageContext.includes('design')) {
          contextSpecificPrompt += `PAGE ACTUELLE : GESTION DESIGN (/super-admin/design)
Rôle de cette page : Gestion des templates et assets graphiques.
Ce que l'utilisateur peut faire ici : Ajouter des nouveaux modèles d'invitation, gérer les polices, les couleurs par défaut.
Aide possible : "Comment ajouter un nouveau template ?", "Quelles sont les polices les plus utilisées ?"`;
        }
      }

      // Créer le prompt système complet
      const systemPrompt = `Tu es Kawebot, l'assistant expert de la plateforme Kawepla.
Ton but est d'aider l'utilisateur à réussir son projet (Organisation d'événement pour l'Hôte, Business pour le Prestataire, Gestion de la plateforme pour l'Admin).

IMPORTANT: ${langInstruction} Réponds toujours dans la même langue que l'utilisateur.

${contextSpecificPrompt}

RÈGLES DE COMPORTEMENT :
1. Sois un expert : Donne des conseils concrets et actionnables. Ne reste pas vague.
2. Contexte : Utilise les informations de la page actuelle pour donner une réponse précise. Si l'utilisateur est sur la page "Invités", parle-lui de gestion d'invités.
3. Navigation : Si l'utilisateur demande comment faire une action qui se trouve sur une autre page, indique-lui le chemin (ex: "Pour cela, allez dans l'onglet 'Prestataires'").
4. Fonctionnalités : Mets en avant les outils de Kawepla (Checklist intelligente, Éditeur de design, Gestionnaire de budget, etc.).
5. Ton : Professionnel, empathique, encourageant et proactif.
6. Adaptabilité : Kawepla gère TOUS types d'événements (Mariage, Anniversaire, Baptême, Soirée d'entreprise, etc.). Adapte tes conseils au type d'événement si l'utilisateur le précise.

Si tu ne sais pas répondre ou si la demande est hors-sujet, ramène gentiment la conversation vers l'organisation de l'événement ou l'utilisation de la plateforme.`;

      // Construire l'historique de conversation pour Gemini
      const history = data.conversationHistory || [];

      let filteredHistory = history;
      if (filteredHistory.length > 0 && filteredHistory[0].role === 'assistant') {
        filteredHistory = filteredHistory.slice(1);
      }

      const chatHistory = filteredHistory.length > 0 && filteredHistory[0].role === 'user'
        ? filteredHistory.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }))
        : [];

      let result;

      if (chatHistory.length === 0) {
        const fullPrompt = `${systemPrompt}\n\nUtilisateur: ${data.message}`;
        result = await model.generateContent(fullPrompt);
      } else {
        const firstMessage = chatHistory[0];
        // On injecte toujours le nouveau contexte système mis à jour
        const historyToUse = [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUtilisateur: ${firstMessage.parts[0].text}` }],
          },
          ...chatHistory.slice(1),
        ];

        const chat = model.startChat({
          history: historyToUse,
        });
        result = await chat.sendMessage(data.message);
      }

      const response = await result.response;
      const text = response.text();

      return {
        message: text,
      };
    } catch (error) {
      console.error('Erreur lors du chat:', error);
      throw new Error('Erreur lors de la génération de la réponse. Veuillez réessayer.');
    }
  }
}

