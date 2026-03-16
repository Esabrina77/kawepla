import { prisma } from '../lib/prisma';
import { PushNotificationService } from './pushNotificationService';

export interface NotificationData {
  type: 'rsvp_confirmed' | 'rsvp_declined' | 'new_guest' | 'new_message';
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
}

export class NotificationService {
  private static io: any = null;

  /**
   * Initialiser le service de notifications avec Socket.IO
   */
  static initialize(io: any) {
    this.io = io;
    console.log('🔔 Service de notifications initialisé');
  }

  /**
   * Envoyer une notification à un utilisateur spécifique
   */
  static async sendToUser(userId: string, notification: NotificationData) {
    if (!this.io) {
      console.warn('⚠️ Socket.IO non initialisé, notification ignorée');
      return;
    }

    try {
      console.log(`🔔 Tentative d'envoi de notification à l'utilisateur ${userId}`);
      console.log(`🔔 Salle cible: user_${userId}`);
      console.log(`🔔 Notification:`, notification);
      
      // Envoyer via WebSocket (temps réel)
      this.io.to(`user_${userId}`).emit('notification', notification);
      console.log(`✅ Notification WebSocket envoyée à l'utilisateur ${userId}:`, notification.title);
      
      // Envoyer aussi une push notification (même si l'app est fermée)
      await PushNotificationService.sendPushNotification(userId, notification);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de notification:', error);
    }
  }

  /**
   * Envoyer une notification RSVP
   */
  static async sendRSVPNotification(rsvpData: any) {
    try {
      // Récupérer les détails de l'invitation et de l'invité
      const invitation = await prisma.invitation.findUnique({
        where: { id: rsvpData.invitationId },
        include: { user: true }
      });

      const guest = await prisma.guest.findUnique({
        where: { id: rsvpData.guestId }
      });

      if (!invitation || !guest) {
        console.warn('⚠️ Invitation ou invité non trouvé pour la notification');
        return;
      }

      const guestName = `${guest.firstName} ${guest.lastName}`;
      const invitationName = invitation.eventTitle || 'votre événement';

      let notification: NotificationData;

      if (rsvpData.status === 'CONFIRMED') {
        notification = {
          type: 'rsvp_confirmed',
          title: '🎉 RSVP Confirmé !',
          body: `${guestName} a confirmé sa présence pour ${invitationName}`,
          data: { rsvpId: rsvpData.id, guestId: guest.id, invitationId: invitation.id },
          sound: true
        };
      } else if (rsvpData.status === 'DECLINED') {
        notification = {
          type: 'rsvp_declined',
          title: '😔 RSVP Refusé',
          body: `${guestName} a décliné l'invitation pour ${invitationName}`,
          data: { rsvpId: rsvpData.id, guestId: guest.id, invitationId: invitation.id },
          sound: true
        };
      } else {
        return; // Statut non reconnu
      }

      // Envoyer à l'utilisateur propriétaire de l'invitation
      await this.sendToUser(invitation.userId, notification);

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de notification RSVP:', error);
    }
  }

  /**
   * Envoyer une notification pour un nouvel invité
   */
  static async sendNewGuestNotification(guestData: any) {
    try {
      const invitation = await prisma.invitation.findUnique({
        where: { id: guestData.invitationId },
        include: { user: true }
      });

      if (!invitation) {
        console.warn('⚠️ Invitation non trouvée pour la notification nouvel invité');
        return;
      }

      const guestName = `${guestData.firstName} ${guestData.lastName}`;
      const invitationName = invitation.eventTitle || 'votre événement';

      const notification: NotificationData = {
        type: 'new_guest',
        title: '👥 Nouvel invité',
        body: `${guestName} s'est ajouté à la liste d'invités de ${invitationName}`,
        data: { guestId: guestData.id, invitationId: invitation.id },
        sound: true
      };

      await this.sendToUser(invitation.userId, notification);

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de notification nouvel invité:', error);
    }
  }

  /**
   * Envoyer une notification pour un nouveau message
   */
  static async sendNewMessageNotification(messageData: any) {
    try {
      const invitation = await prisma.invitation.findUnique({
        where: { id: messageData.invitationId },
        include: { user: true }
      });

      if (!invitation) {
        console.warn('⚠️ Invitation non trouvée pour la notification nouveau message');
        return;
      }

      const senderName = messageData.senderName || 'Un invité';
      const messagePreview = messageData.content?.substring(0, 50) || '';
      const truncatedMessage = messagePreview.length > 50 ? `${messagePreview}...` : messagePreview;

      const notification: NotificationData = {
        type: 'new_message',
        title: '💬 Nouveau message',
        body: `${senderName}: ${truncatedMessage}`,
        data: { messageId: messageData.id, invitationId: invitation.id },
        sound: true
      };

      await this.sendToUser(invitation.userId, notification);

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de notification nouveau message:', error);
    }
  }
}
