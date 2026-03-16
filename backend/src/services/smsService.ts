import twilio from 'twilio';

interface SMSConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

interface SMSMessage {
  to: string;
  body: string;
  from?: string;
}

interface SMSDeliveryStatus {
  messageId: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  errorCode?: string;
  errorMessage?: string;
}

class SMSService {
  private client: twilio.Twilio;
  private config: SMSConfig;

  constructor() {
    this.config = {
      accountSid: process.env.TWILIO_ACCOUNT_SID!,
      authToken: process.env.TWILIO_AUTH_TOKEN!,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER!
    };

    this.client = twilio(this.config.accountSid, this.config.authToken);
  }

  /**
   * Envoie un SMS simple
   */
  async sendSMS(message: SMSMessage): Promise<SMSDeliveryStatus> {
    try {
      const result = await this.client.messages.create({
        body: message.body,
        from: message.from || this.config.phoneNumber,
        to: message.to
      });

      return {
        messageId: result.sid,
        status: result.status as any
      };
    } catch (error: any) {
      console.error('Erreur envoi SMS:', error);
      throw new Error(`Erreur SMS: ${error.message}`);
    }
  }

  /**
   * Envoie un SMS de rappel pour RSVP
   */
  async sendRSVPReminder(guestPhone: string, guestName: string, eventDate: string): Promise<SMSDeliveryStatus> {
    const message = `Bonjour ${guestName}, nous attendons votre réponse pour notre mariage le ${eventDate}. Répondez ici: [LIEN_RSVP]`;
    
    return this.sendSMS({
      to: guestPhone,
      body: message
    });
  }

  /**
   * Envoie une confirmation de RSVP
   */
  async sendRSVPConfirmation(guestPhone: string, guestName: string, response: 'confirmed' | 'declined'): Promise<SMSDeliveryStatus> {
    const status = response === 'confirmed' ? 'confirmé' : 'décliné';
    const message = `Merci ${guestName} ! Votre réponse (${status}) a bien été enregistrée.`;
    
    return this.sendSMS({
      to: guestPhone,
      body: message
    });
  }

  /**
   * Envoie un rappel de mariage
   */
  async sendWeddingReminder(guestPhone: string, guestName: string, eventDate: string, eventTime: string): Promise<SMSDeliveryStatus> {
    const message = `Bonjour ${guestName}, nous avons hâte de vous voir demain à ${eventTime} pour notre mariage ! 🎉`;
    
    return this.sendSMS({
      to: guestPhone,
      body: message
    });
  }

  /**
   * Vérifie le statut de livraison d'un SMS
   */
//   async checkDeliveryStatus(messageId: string): Promise<SMSDeliveryStatus> {
//     try {
//       const message = await this.client.messages(messageId).fetch();
      
//       return {
//         messageId: message.sid,
//         status: message.status as any,
//         errorCode: message.errorCode,
//         errorMessage: message.errorMessage
//       };
//     } catch (error: any) {
//       console.error('Erreur vérification statut:', error);
//       throw new Error(`Erreur vérification: ${error.message}`);
//     }
//   }

  /**
   * Valide un numéro de téléphone
   */
  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      // Formatage basique
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      
      // Validation française
      if (cleanNumber.startsWith('33') && cleanNumber.length === 11) {
        return true;
      }
      
      // Validation internationale basique
      if (cleanNumber.length >= 10 && cleanNumber.length <= 15) {
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calcule le coût estimé d'un SMS
   */
  getEstimatedCost(phoneNumber: string): number {
    // Prix approximatifs Twilio France
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    if (cleanNumber.startsWith('33')) {
      return 0.05; // 5 centimes pour la France
    }
    
    return 0.08; // Prix international par défaut
  }
}

export default new SMSService(); 