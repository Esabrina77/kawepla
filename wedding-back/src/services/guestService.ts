/**
 * Service métier pour la gestion des invités.
 * Contient la logique d'accès à la base de données via Prisma.
 */
import { prisma } from '../lib/prisma';
import { Guest } from '@prisma/client';
import { emailService } from '../utils/email';
import csv from 'csv-parser';
import { Readable } from 'stream';

type GuestCreateInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isVIP?: boolean;
  dietaryRestrictions?: string;
  plusOne?: boolean;
  plusOneName?: string;
  invitationId: string;
};

type GuestUpdateInput = Partial<GuestCreateInput>;

export class GuestService {
  /**
   * Créer un nouvel invité
   */
  static async createGuest(userId: string, data: GuestCreateInput): Promise<Guest> {
    // Vérifier que l'invitation appartient à l'utilisateur
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: data.invitationId,
        userId
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée ou accès non autorisé');
    }

    // Vérifier l'unicité de l'email pour cette invitation (si email fourni)
    if (data.email) {
      const existingGuest = await prisma.guest.findFirst({
        where: {
          invitationId: data.invitationId,
          email: data.email
        }
      });

      if (existingGuest) {
        throw new Error('Cet email est déjà utilisé par un autre invité pour cette invitation');
      }
    }

    // Générer un token unique pour l'invité
    const inviteToken = `${Date.now()}-${Math.random().toString(36).substring(2)}`;

    return prisma.guest.create({
      data: {
        ...data,
        userId,
        inviteToken
      }
    });
  }

  /**
   * Récupérer un invité par son ID
   */
  static async getGuestById(id: string, userId: string): Promise<Guest | null> {
    return prisma.guest.findFirst({
      where: {
        id,
        userId
      }
    });
  }

  /**
   * Mettre à jour un invité
   */
  static async updateGuest(id: string, userId: string, data: GuestUpdateInput): Promise<Guest> {
    const guest = await prisma.guest.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!guest) {
      throw new Error('Invité non trouvé ou accès non autorisé');
    }

    // Vérifier l'unicité de l'email pour cette invitation (si email fourni et différent de l'actuel)
    if (data.email && data.email !== guest.email) {
      const existingGuest = await prisma.guest.findFirst({
        where: {
          invitationId: guest.invitationId,
          email: data.email,
          id: { not: id } // Exclure l'invité actuel
        }
      });

      if (existingGuest) {
        throw new Error('Cet email est déjà utilisé par un autre invité pour cette invitation');
      }
    }

    return prisma.guest.update({
      where: { id },
      data
    });
  }

  /**
   * Mettre à jour la photo de profil d'un invité
   */
  static async updateGuestProfilePhoto(id: string, userId: string, profilePhotoUrl: string | null): Promise<Guest> {
    const guest = await prisma.guest.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!guest) {
      throw new Error('Invité non trouvé ou accès non autorisé');
    }

    return prisma.guest.update({
      where: { id },
      data: { profilePhotoUrl }
    });
  }

  /**
   * Supprimer un invité
   */
  static async deleteGuest(id: string, userId: string): Promise<void> {
    const guest = await prisma.guest.findFirst({
      where: {
        id,
        userId
      },
      include: {
        rsvp: true
      }
    });

    if (!guest) {
      throw new Error('Invité non trouvé ou accès non autorisé');
    }

    // Utiliser une transaction pour s'assurer que tout est supprimé correctement
    await prisma.$transaction(async (tx) => {
      // Supprimer d'abord les RSVP associés (si ils existent)
      if (guest.rsvp) {
        await tx.rSVP.delete({
          where: { guestId: id }
        });
      }

      // Supprimer l'invité
      await tx.guest.delete({
        where: { id }
      });
    });
  }

  /**
   * Liste des invités d'une invitation
   */
  static async listGuests(invitationId: string, userId: string): Promise<Guest[]> {
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        userId
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée ou accès non autorisé');
    }

    return prisma.guest.findMany({
      where: {
        invitationId
      },
      include: {
        rsvp: true
      }
    });
  }

  /**
   * Statistiques des invités d'une invitation
   */
  static async getGuestStatistics(invitationId: string, userId: string): Promise<{
    total: number;
    withEmail: number;
    invitationsSent: number;
    confirmed: number;
    declined: number;
    pending: number;
    vip: number;
    withPlusOne: number;
  }> {
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        userId
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée ou accès non autorisé');
    }

    const guests = await prisma.guest.findMany({
      where: {
        invitationId
      },
      include: {
        rsvp: true
      }
    });

    const stats = {
      total: guests.length,
      withEmail: guests.filter(g => g.email).length,
      invitationsSent: guests.filter(g => g.invitationSentAt).length,
      confirmed: guests.filter(g => g.rsvp?.status === 'CONFIRMED').length,
      declined: guests.filter(g => g.rsvp?.status === 'DECLINED').length,
      pending: guests.filter(g => !g.rsvp || g.rsvp?.status === 'PENDING').length,
      vip: guests.filter(g => g.isVIP).length,
      withPlusOne: guests.filter(g => g.plusOne).length
    };

    return stats;
  }

  /**
   * Envoyer une invitation par email à un invité
   */
  static async sendInvitationEmail(guestId: string, userId: string): Promise<void> {
    // Récupérer l'invité avec les détails de l'invitation
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        invitation: {
          include: {
            user: true
          }
        }
      }
    });

    if (!guest) {
      throw new Error('Invité non trouvé');
    }

    // Vérifier que l'invitation appartient à l'utilisateur
    if (guest.invitation.userId !== userId) {
      throw new Error('Accès non autorisé');
    }

    // Vérifier que l'invitation est publiée
    if (guest.invitation.status !== 'PUBLISHED') {
      throw new Error('L\'invitation doit être publiée avant d\'envoyer les emails');
    }

    // Vérifier que l'invité a une adresse email
    if (!guest.email) {
      throw new Error('L\'invité n\'a pas d\'adresse email');
    }

    // Préparer les données pour l'email
    const guestName = `${guest.firstName} ${guest.lastName}`;
    const coupleNames = guest.invitation.coupleName || `${guest.invitation.user.firstName} ${guest.invitation.user.lastName}`;
    const weddingDate = guest.invitation.weddingDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Envoyer l'email
    await emailService.sendInvitation(
      guest.email,
      guestName,
      guest.invitation.title || 'Invitation de mariage',
      guest.inviteToken,
      weddingDate,
      guest.invitation.venueName,
      coupleNames
    );

    // Mettre à jour la date d'envoi de l'invitation
    await prisma.guest.update({
      where: { id: guestId },
      data: {
        invitationSentAt: new Date()
      }
    });
  }

  /**
   * Envoyer toutes les invitations d'une invitation
   */
  static async sendAllInvitations(invitationId: string, userId: string): Promise<{
    sent: number;
    failed: Array<{ guestId: string; guestName: string; error: string }>;
  }> {
    // Vérifier que l'invitation appartient à l'utilisateur
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        userId
      },
      include: {
        guests: true,
        user: true
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée ou accès non autorisé');
    }

    // Vérifier que l'invitation est publiée
    if (invitation.status !== 'PUBLISHED') {
      throw new Error('L\'invitation doit être publiée avant d\'envoyer les emails');
    }

    const results = {
      sent: 0,
      failed: [] as Array<{ guestId: string; guestName: string; error: string }>
    };

    // Envoyer les invitations une par une
    for (const guest of invitation.guests) {
      try {
        if (!guest.email) {
          results.failed.push({
            guestId: guest.id,
            guestName: `${guest.firstName} ${guest.lastName}`,
            error: 'Pas d\'adresse email'
          });
          continue;
        }

        // Préparer les données pour l'email
        const guestName = `${guest.firstName} ${guest.lastName}`;
        const coupleNames = invitation.coupleName || `${invitation.user.firstName} ${invitation.user.lastName}`;
        const weddingDate = invitation.weddingDate.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Envoyer l'email
        await emailService.sendInvitation(
          guest.email,
          guestName,
          invitation.title || 'Invitation de mariage',
          guest.inviteToken,
          weddingDate,
          invitation.venueName,
          coupleNames
        );

        // Mettre à jour la date d'envoi
        await prisma.guest.update({
          where: { id: guest.id },
          data: {
            invitationSentAt: new Date()
          }
        });

        results.sent++;
      } catch (error) {
        results.failed.push({
          guestId: guest.id,
          guestName: `${guest.firstName} ${guest.lastName}`,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }

    return results;
  }

  /**
   * Envoyer un rappel à un invité
   */
  static async sendReminderEmail(guestId: string, userId: string): Promise<void> {
    // Récupérer l'invité avec les détails de l'invitation et du RSVP
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        invitation: {
          include: {
            user: true
          }
        },
        rsvp: true
      }
    });

    if (!guest) {
      throw new Error('Invité non trouvé');
    }

    // Vérifier que l'invitation appartient à l'utilisateur
    if (guest.invitation.userId !== userId) {
      throw new Error('Accès non autorisé');
    }

    // Vérifier que l'invité a une adresse email
    if (!guest.email) {
      throw new Error('L\'invité n\'a pas d\'adresse email');
    }

    // Vérifier que l'invité n'a pas encore répondu
    if (guest.rsvp && guest.rsvp.status !== 'PENDING') {
      throw new Error('L\'invité a déjà répondu à l\'invitation');
    }

    // Préparer les données pour l'email
    const guestName = `${guest.firstName} ${guest.lastName}`;
    const coupleNames = guest.invitation.coupleName || `${guest.invitation.user.firstName} ${guest.invitation.user.lastName}`;
    const weddingDate = guest.invitation.weddingDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Envoyer l'email de rappel
    await emailService.sendInvitationReminder(
      guest.email,
      guestName,
      guest.invitation.title || 'Invitation de mariage',
      guest.inviteToken,
      weddingDate,
      coupleNames
    );
  }

  /**
   * Prévisualisation d'import avec vérification des doublons
   */
  static async previewGuestImport(
    invitationId: string,
    userId: string,
    fileBuffer: Buffer,
    fileName: string
  ): Promise<{
    totalGuests: number;
    validGuests: number;
    errors: Array<{ line: number; error: string; data?: any }>;
    preview: Array<{
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      isVIP?: boolean;
      plusOne?: boolean;
      dietaryRestrictions?: string;
      plusOneName?: string;
    }>;
  }> {
    // Vérifier que l'invitation appartient à l'utilisateur
    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId, userId }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée ou accès non autorisé');
    }

    // Parser le fichier
    const { guests: parsedGuests, errors: parseErrors } = await this.parseGuestFile(fileBuffer, fileName);

    const results = {
      totalGuests: parsedGuests.length,
      validGuests: 0,
      errors: [...parseErrors],
      preview: [] as any[]
    };

    // Récupérer les emails existants pour cette invitation
    const existingGuests = await prisma.guest.findMany({
      where: { invitationId },
      select: { email: true }
    });
    const existingEmails = new Set(
      existingGuests
        .filter(g => g.email)
        .map(g => g.email!.toLowerCase())
    );

    // Vérifier les doublons dans le fichier lui-même
    const fileEmails = new Set<string>();

    for (let i = 0; i < parsedGuests.length; i++) {
      const guestData = parsedGuests[i];
      let hasError = false;
      
      if (guestData.email) {
        const emailLower = guestData.email.toLowerCase();
        
        // Vérifier si l'email existe déjà dans la base
        if (existingEmails.has(emailLower)) {
          results.errors.push({
            line: i + 2, // +2 car ligne 1 = headers, index commence à 0
            error: `Email ${guestData.email} déjà utilisé par un invité existant`,
            data: guestData
          });
          hasError = true;
        }
        
        // Vérifier si l'email est dupliqué dans le fichier
        if (fileEmails.has(emailLower)) {
          results.errors.push({
            line: i + 2,
            error: `Email ${guestData.email} apparaît plusieurs fois dans le fichier`,
            data: guestData
          });
          hasError = true;
        }
        
        if (!hasError) {
          fileEmails.add(emailLower);
        }
      }
      
      if (!hasError) {
        results.validGuests++;
        // Ajouter à la prévisualisation (limité aux 10 premiers)
        if (results.preview.length < 10) {
          results.preview.push(guestData);
        }
      }
    }

    return results;
  }

  /**
   * Parser pour les différents formats de fichiers
   */
  static async parseGuestFile(fileBuffer: Buffer, fileName: string): Promise<{
    guests: Array<{
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      isVIP?: boolean;
      dietaryRestrictions?: string;
      plusOne?: boolean;
      plusOneName?: string;
    }>;
    errors: Array<{ line: number; error: string; data?: any }>;
  }> {
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const results = {
      guests: [] as any[],
      errors: [] as Array<{ line: number; error: string; data?: any }>
    };

    try {
      switch (fileExtension) {
        case 'csv':
          return await this.parseCSV(fileBuffer);
        case 'json':
          return await this.parseJSON(fileBuffer);
        case 'txt':
          return await this.parseTXT(fileBuffer);
        default:
          throw new Error('Format de fichier non supporté. Utilisez CSV, JSON ou TXT.');
      }
    } catch (error) {
      results.errors.push({
        line: 0,
        error: error instanceof Error ? error.message : 'Erreur de parsing'
      });
      return results;
    }
  }

  /**
   * Parser CSV
   */
  private static async parseCSV(fileBuffer: Buffer): Promise<{
    guests: any[];
    errors: Array<{ line: number; error: string; data?: any }>;
  }> {
    return new Promise((resolve) => {
      const results = { guests: [] as any[], errors: [] as any[] };
      const stream = Readable.from(fileBuffer.toString());
      let lineNumber = 0;
      let isFirstLine = true;

      stream
        .pipe(csv({
          separator: ',',
          headers: ['firstName', 'lastName', 'email', 'phone', 'isVIP', 'dietaryRestrictions', 'plusOne', 'plusOneName']
        }))
        .on('data', (data: any) => {
          lineNumber++;
          
          // Ignorer la première ligne si c'est l'en-tête
          if (isFirstLine) {
            isFirstLine = false;
            // Vérifier si c'est vraiment une ligne d'en-tête
            if (data.firstName === 'firstName' || data.firstName === 'prénom') {
              return; // Ignorer cette ligne
            }
          }
          
          try {
            const guest = this.validateAndCleanGuestData(data, lineNumber);
            if (guest) {
              results.guests.push(guest);
            }
          } catch (error) {
            results.errors.push({
              line: lineNumber,
              error: error instanceof Error ? error.message : 'Erreur de validation',
              data
            });
          }
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error: any) => {
          results.errors.push({
            line: lineNumber,
            error: `Erreur CSV: ${error.message}`
          });
          resolve(results);
        });
    });
  }

  /**
   * Parser JSON
   */
  private static async parseJSON(fileBuffer: Buffer): Promise<{
    guests: any[];
    errors: Array<{ line: number; error: string; data?: any }>;
  }> {
    const results = { guests: [] as any[], errors: [] as any[] };
    
    try {
      const jsonData = JSON.parse(fileBuffer.toString());
      
      if (!Array.isArray(jsonData)) {
        results.errors.push({
          line: 0,
          error: 'Le fichier JSON doit contenir un tableau d\'invités'
        });
        return results;
      }

      jsonData.forEach((data, index) => {
        try {
          const guest = this.validateAndCleanGuestData(data, index + 1);
          if (guest) {
            results.guests.push(guest);
          }
        } catch (error) {
          results.errors.push({
            line: index + 1,
            error: error instanceof Error ? error.message : 'Erreur de validation',
            data
          });
        }
      });

      return results;
    } catch (error) {
      results.errors.push({
        line: 0,
        error: `Erreur JSON: ${error instanceof Error ? error.message : 'Format invalide'}`
      });
      return results;
    }
  }

  /**
   * Parser TXT (format: prénom,nom,email,téléphone par ligne)
   */
  private static async parseTXT(fileBuffer: Buffer): Promise<{
    guests: any[];
    errors: Array<{ line: number; error: string; data?: any }>;
  }> {
    const results = { guests: [] as any[], errors: [] as any[] };
    const lines = fileBuffer.toString().split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();
      
      if (!trimmedLine) return; // Ignorer les lignes vides

      // Ignorer la ligne d'en-tête si elle contient des noms de colonnes
      if (index === 0 && (trimmedLine.includes('firstName') || trimmedLine.includes('prénom'))) {
        return;
      }

      try {
        const parts = trimmedLine.split(',').map(part => part.trim());
        
        if (parts.length < 2) {
          results.errors.push({
            line: lineNumber,
            error: 'Format invalide. Minimum requis: prénom,nom',
            data: { line: trimmedLine }
          });
          return;
        }

        const data = {
          firstName: parts[0],
          lastName: parts[1],
          email: parts[2] || '',
          phone: parts[3] || '',
          isVIP: parts[4] === 'true' || parts[4] === '1',
          dietaryRestrictions: parts[5] || '',
          plusOne: parts[6] === 'true' || parts[6] === '1',
          plusOneName: parts[7] || ''
        };

        const guest = this.validateAndCleanGuestData(data, lineNumber);
        if (guest) {
          results.guests.push(guest);
        }
      } catch (error) {
        results.errors.push({
          line: lineNumber,
          error: error instanceof Error ? error.message : 'Erreur de validation',
          data: { line: trimmedLine }
        });
      }
    });

    return results;
  }

  /**
   * Valider et nettoyer les données d'un invité
   */
  private static validateAndCleanGuestData(data: any, lineNumber: number) {
    const firstName = data.firstName?.toString().trim();
    const lastName = data.lastName?.toString().trim();
    const email = data.email?.toString().trim();
    const phone = data.phone?.toString().trim();

    // Validation obligatoire
    if (!firstName || firstName.length < 2) {
      throw new Error(`Ligne ${lineNumber}: Prénom requis (minimum 2 caractères)`);
    }
    if (!lastName || lastName.length < 2) {
      throw new Error(`Ligne ${lineNumber}: Nom requis (minimum 2 caractères)`);
    }

    // Validation email
    if (email && !this.isValidEmail(email)) {
      throw new Error(`Ligne ${lineNumber}: Email invalide "${email}"`);
    }

    // Validation téléphone
    if (phone && !this.isValidPhone(phone)) {
      throw new Error(`Ligne ${lineNumber}: Numéro de téléphone invalide "${phone}"`);
    }

    // Au moins un moyen de contact
    if (!email && !phone) {
      throw new Error(`Ligne ${lineNumber}: Email ou téléphone requis`);
    }

    return {
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      isVIP: data.isVIP === true || data.isVIP === 'true' || data.isVIP === '1',
      dietaryRestrictions: data.dietaryRestrictions?.toString().trim() || null,
      plusOne: data.plusOne === true || data.plusOne === 'true' || data.plusOne === '1',
      plusOneName: data.plusOneName?.toString().trim() || null
    };
  }

  /**
   * Valider un email
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valider un numéro de téléphone
   */
  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Import en masse avec création des invités
   */
  static async bulkImportGuests(
    invitationId: string, 
    userId: string, 
    fileBuffer: Buffer, 
    fileName: string,
    subscriptionLimits?: { maxGuests: number; currentGuests: number }
  ): Promise<{
    imported: number;
    failed: number;
    errors: Array<{ line: number; error: string; data?: any }>;
    guests: any[];
  }> {
    // Vérifier que l'invitation appartient à l'utilisateur
    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId, userId }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée ou accès non autorisé');
    }

    // Parser le fichier
    const { guests: parsedGuests, errors: parseErrors } = await this.parseGuestFile(fileBuffer, fileName);

    const results = {
      imported: 0,
      failed: 0,
      errors: [...parseErrors],
      guests: [] as any[]
    };

    // Récupérer les invités existants pour cette invitation
    const existingGuests = await prisma.guest.findMany({
      where: { invitationId },
      select: { email: true }
    });
    
    const existingEmails = new Set(
      existingGuests
        .filter(g => g.email)
        .map(g => g.email!.toLowerCase())
    );

    // Vérifier les limites d'abonnement si elles sont fournies
    if (subscriptionLimits) {
      const { maxGuests, currentGuests } = subscriptionLimits;
      const availableSlots = maxGuests - currentGuests;
      
      if (parsedGuests.length > availableSlots) {
        throw new Error(
          `Limite d'abonnement atteinte: vous ne pouvez ajouter que ${availableSlots} invité(s) supplémentaire(s). ` +
          `Votre fichier contient ${parsedGuests.length} invités. ` +
          `Passez à un abonnement premium pour inviter plus de personnes.`
        );
      }
    }

    // Vérifier les doublons dans le fichier lui-même
    const fileEmails = new Set<string>();
    const validatedGuests = [];

    for (let i = 0; i < parsedGuests.length; i++) {
      const guestData = parsedGuests[i];
      
      if (guestData.email) {
        const emailLower = guestData.email.toLowerCase();
        
        // Vérifier si l'email existe déjà dans la base
        if (existingEmails.has(emailLower)) {
          results.failed++;
          results.errors.push({
            line: i + 2, // +2 car ligne 1 = headers, index commence à 0
            error: `Email ${guestData.email} déjà utilisé par un invité existant`,
            data: guestData
          });
          continue;
        }
        
        // Vérifier si l'email est dupliqué dans le fichier
        if (fileEmails.has(emailLower)) {
          results.failed++;
          results.errors.push({
            line: i + 2,
            error: `Email ${guestData.email} apparaît plusieurs fois dans le fichier`,
            data: guestData
          });
          continue;
        }
        
        fileEmails.add(emailLower);
      }
      
      validatedGuests.push(guestData);
    }

    // Créer les invités validés un par un
    for (const guestData of validatedGuests) {
      try {
        // Générer un token unique
        const inviteToken = `${Date.now()}-${Math.random().toString(36).substring(2)}`;

        const guest = await prisma.guest.create({
          data: {
            ...guestData,
            invitationId,
            userId,
            inviteToken
          }
        });

        results.imported++;
        results.guests.push(guest);
      } catch (error) {
        results.failed++;
        results.errors.push({
          line: 0,
          error: `Erreur création invité ${guestData.firstName} ${guestData.lastName}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
          data: guestData
        });
      }
    }

    return results;
  }

  /**
   * Envoi en masse après import
   */
  static async bulkSendInvitations(
    invitationId: string, 
    userId: string, 
    guestIds?: string[]
  ): Promise<{
    sent: number;
    failed: Array<{ guestId: string; guestName: string; error: string }>;
    skipped: Array<{ guestId: string; guestName: string; reason: string }>;
  }> {
    // Vérifier que l'invitation appartient à l'utilisateur et est publiée
    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId, userId },
      include: {
        guests: guestIds ? { where: { id: { in: guestIds } } } : true,
        user: true
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée ou accès non autorisé');
    }

    if (invitation.status !== 'PUBLISHED') {
      throw new Error('L\'invitation doit être publiée avant d\'envoyer les emails');
    }

    const results = {
      sent: 0,
      failed: [] as Array<{ guestId: string; guestName: string; error: string }>,
      skipped: [] as Array<{ guestId: string; guestName: string; reason: string }>
    };

    // Envoyer les invitations
    for (const guest of invitation.guests) {
      const guestName = `${guest.firstName} ${guest.lastName}`;

      try {
        // Vérifications
        if (!guest.email) {
          results.skipped.push({
            guestId: guest.id,
            guestName,
            reason: 'Pas d\'adresse email'
          });
          continue;
        }

        if (guest.invitationSentAt) {
          results.skipped.push({
            guestId: guest.id,
            guestName,
            reason: 'Invitation déjà envoyée'
          });
          continue;
        }

        // Préparer les données pour l'email
        const coupleNames = invitation.coupleName || `${invitation.user.firstName} ${invitation.user.lastName}`;
        const weddingDate = invitation.weddingDate.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Envoyer l'email
        await emailService.sendInvitation(
          guest.email,
          guestName,
          invitation.title || 'Invitation de mariage',
          guest.inviteToken,
          weddingDate,
          invitation.venueName,
          coupleNames
        );

        // Mettre à jour la date d'envoi
        await prisma.guest.update({
          where: { id: guest.id },
          data: { invitationSentAt: new Date() }
        });

        results.sent++;
      } catch (error) {
        results.failed.push({
          guestId: guest.id,
          guestName,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }

    return results;
  }
} 