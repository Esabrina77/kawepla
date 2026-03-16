import { prisma } from '../lib/prisma';
import webpush from 'web-push';

export interface PushServicePurchase {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationService {
  private static initialized = false;

  /**
   * Initialiser web-push avec les clés VAPID
   */
  static initialize() {
    if (this.initialized) return;

    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT;

    if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
      console.warn('⚠️ Clés VAPID manquantes, push notifications désactivées');
      return;
    }

    webpush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    );

    this.initialized = true;
    console.log('📱 Service de push notifications initialisé avec VAPID');
  }

  /**
   * Enregistrer une subscription push pour un utilisateur
   */
  static async saveServicePurchase(userId: string, subscription: PushServicePurchase) {
    try {
      await prisma.pushSubscription.upsert({
        where: { userId },
        update: {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        create: {
          userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      });
      
      console.log(`📱 Push subscription enregistrée pour l'utilisateur ${userId}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement de la subscription:', error);
    }
  }

  /**
   * Envoyer une push notification
   */
  static async sendPushNotification(userId: string, notification: any) {
    if (!this.initialized) {
      console.warn('⚠️ Service de push notifications non initialisé');
      return;
    }

    try {
      const pushSubscription = await prisma.pushSubscription.findUnique({
        where: { userId }
      });

      if (!pushSubscription) {
        console.log(`⚠️ Aucune push subscription trouvée pour l'utilisateur ${userId}`);
        return;
      }

      const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        type: notification.type, // Ajouter le type pour le service worker
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.type,
        data: notification.data || {},
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'Voir',
            icon: '/favicon.ico'
          },
          {
            action: 'close',
            title: 'Fermer',
            icon: '/favicon.ico'
          }
        ]
      });

      await webpush.sendNotification({
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: pushSubscription.p256dh,
          auth: pushSubscription.auth
        }
      }, payload);
      
      console.log(`📱 Push notification envoyée à l'utilisateur ${userId}:`, notification.title);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la push notification:', error);
      
      // Si la subscription est invalide, la supprimer
      if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 410) {
        console.log(`🗑️ Suppression de la subscription invalide pour l'utilisateur ${userId}`);
        await prisma.pushSubscription.delete({
          where: { userId }
        });
      }
    }
  }

  /**
   * Obtenir la clé publique VAPID
   */
  static getVapidPublicKey(): string | null {
    return process.env.VAPID_PUBLIC_KEY || null;
  }
}
