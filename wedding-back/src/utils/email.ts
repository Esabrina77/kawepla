import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // console.log('Configuration email:', {
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT,
    //   user: process.env.SMTP_USER,
    //   hasPassword: !!process.env.SMTP_PASSWORD
    // });

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'whethefoot@gmail.com',
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `"Wedding Planner" <${process.env.SMTP_USER || 'whethefoot@gmail.com'}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email envoyé avec succès à ${options.to}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw new Error('Impossible d\'envoyer l\'email');
    }
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Code de vérification</title>
          <style>
            body { font-family: 'Dancing Script', cursive; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d4af37, #f4e4bc); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
            .code { font-size: 32px; font-weight: bold; color: #d4af37; text-align: center; padding: 20px; background: #f9f9f9; border-radius: 8px; margin: 20px 0; letter-spacing: 4px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
            .warning { color: #e74c3c; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white; margin: 0;">KaWePla</h1>
              <p style="color: white; margin: 10px 0 0 0;">Confirmez votre adresse email</p>
            </div>
            
            <div class="content">
              <h2>Bonjour !</h2>
              <p>Merci de vous être inscrit sur KaWePla. Pour finaliser votre inscription, veuillez utiliser le code de vérification suivant :</p>
              
              <div class="code">${code}</div>
              
              <p>Ce code est valable pendant <strong>10 minutes</strong>.</p>
              
              <p class="warning">Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email.</p>
              
              <p>Cordialement,<br>L'équipe KaWePla</p>
            </div>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      KaWePla - Code de vérification
      
      Bonjour !
      
      Merci de vous être inscrit sur Wedding Planner. Pour finaliser votre inscription, veuillez utiliser le code de vérification suivant :
      
      ${code}
      
      Ce code est valable pendant 10 minutes.
      
      Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email.
      
      Cordialement,
      L'équipe KaWePla 😎
    `;

    await this.sendEmail({
      to: email,
      subject: 'Code de vérification - KaWePla',
      html,
      text,
    });
  }

  async sendInvitation(
    guestEmail: string, 
    guestName: string, 
    invitationTitle: string, 
    inviteToken: string, 
    weddingDate: string,
    venueName: string,
    coupleNames: string
  ): Promise<void> {
    const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/rsvp/${inviteToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invitation de mariage</title>
          <style>
            body { font-family: 'Dancing Script', cursive; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d4af37, #f4e4bc); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
            .invitation-card { background: #f9f9f9; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; }
            .couple-names { font-size: 24px; font-weight: bold; color: #d4af37; margin: 15px 0; }
            .wedding-date { font-size: 18px; color: #666; margin: 10px 0; }
            .venue { font-size: 16px; color: #666; margin: 10px 0; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #d4af37, #f4e4bc); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .cta-button:hover { background: linear-gradient(135deg, #b8941f, #e6d4a3); }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
            .warning { color: #e74c3c; font-weight: bold; font-size: 14px; margin: 15px 0; }
            .hearts { font-size: 20px; color: #d4af37; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white; margin: 0;">💕 Invitation de Mariage 💕</h1>
              <p style="color: white; margin: 10px 0 0 0;">Vous êtes cordialement invité(e)</p>
            </div>
            
            <div class="content">
              <h2>Cher(e) ${guestName},</h2>
              
              <div class="invitation-card">
                <div class="hearts">💕 ✨ 💕</div>
                <div class="couple-names">${coupleNames}</div>
                <p>ont l'honneur de vous inviter à célébrer leur union</p>
                <div class="wedding-date">📅 ${weddingDate}</div>
                <div class="venue">📍 ${venueName}</div>
                <div class="hearts">💕 ✨ 💕</div>
              </div>
              
              <p>Nous serions ravis de partager ce moment magique avec vous !</p>
              
              <div style="text-align: center;">
                <a href="${invitationUrl}" class="cta-button">
                  Voir l'invitation & Confirmer ma présence
                </a>
              </div>
              
              <div class="warning">
                ⚠️ Cette invitation est personnelle et ne peut pas être transférée à une autre personne.
                <br>
                Chaque invité dispose de son propre lien d'invitation sécurisé.
              </div>
              
              <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
              
              <p>Avec toute notre affection,<br>
              <strong>${coupleNames}</strong></p>
            </div>
            
            <div class="footer">
              <p>Cet email a été envoyé via KaWePla - Wedding Planner</p>
              <p>Lien d'invitation : ${invitationUrl}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Invitation de Mariage - ${coupleNames}
      
      Cher(e) ${guestName},
      
      ${coupleNames} ont l'honneur de vous inviter à célébrer leur union le ${weddingDate} à ${venueName}.
      
      Nous serions ravis de partager ce moment magique avec vous !
      
      Pour voir l'invitation complète et confirmer votre présence, cliquez sur le lien suivant :
      ${invitationUrl}
      
      ⚠️ IMPORTANT : Cette invitation est personnelle et ne peut pas être transférée à une autre personne.
      Chaque invité dispose de son propre lien d'invitation sécurisé.
      
      Si vous avez des questions, n'hésitez pas à nous contacter.
      
      Avec toute notre affection,
      ${coupleNames}
      
      ---
      Cet email a été envoyé via KaWePla - Wedding Planner
    `;

    await this.sendEmail({
      to: guestEmail,
      subject: `💕 Invitation de Mariage - ${coupleNames}`,
      html,
      text,
    });
  }

  async sendInvitationReminder(
    guestEmail: string, 
    guestName: string, 
    invitationTitle: string, 
    inviteToken: string, 
    weddingDate: string,
    coupleNames: string
  ): Promise<void> {
    const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/rsvp/${inviteToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Rappel - Invitation de mariage</title>
          <style>
            body { font-family: 'Dancing Script', cursive; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d4af37, #f4e4bc); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
            .reminder-card { background: #fff3cd; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; border: 2px solid #ffeaa7; }
            .couple-names { font-size: 24px; font-weight: bold; color: #d4af37; margin: 15px 0; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #d4af37, #f4e4bc); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white; margin: 0;">🔔 Rappel - Invitation de Mariage</h1>
            </div>
            
            <div class="content">
              <h2>Cher(e) ${guestName},</h2>
              
              <div class="reminder-card">
                <h3>⏰ Nous n'avons pas encore reçu votre réponse</h3>
                <div class="couple-names">${coupleNames}</div>
                <p>Mariage le ${weddingDate}</p>
                <p>Nous espérons que vous pourrez être présent(e) pour célébrer avec nous !</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${invitationUrl}" class="cta-button">
                  Confirmer ma présence maintenant
                </a>
              </div>
              
              <p>Merci de nous faire savoir si vous pourrez être des nôtres.</p>
              
              <p>Avec toute notre affection,<br>
              <strong>${coupleNames}</strong></p>
            </div>
            
            <div class="footer">
              <p>Cet email a été envoyé via KaWePla - Wedding Planner</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: guestEmail,
      subject: `🔔 Rappel - Invitation de Mariage - ${coupleNames}`,
      html,
    });
  }
}

export const emailService = new EmailService(); 