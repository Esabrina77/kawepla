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
        from: `"KAWEPLA" <${process.env.SMTP_USER || 'whethefoot@gmail.com'}>`,
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
              <h1 style="color: white; margin: 0;">Kawepla</h1>
              <p style="color: white; margin: 10px 0 0 0;">Confirmez votre adresse email</p>
            </div>
            
            <div class="content">
              <h2>Bonjour !</h2>
              <p>Merci de vous être inscrit sur Kawepla. Pour finaliser votre inscription, veuillez utiliser le code de vérification suivant :</p>
              
              <div class="code">${code}</div>
              
              <p>Ce code est valable pendant <strong>10 minutes</strong>.</p>
              
              <p class="warning">Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email.</p>
              
              <p>Cordialement,<br>L'équipe Kawepla</p>
            </div>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Kawepla - Code de vérification
      
      Bonjour !
      
      Merci de vous être inscrit sur Kawepla. Pour finaliser votre inscription, veuillez utiliser le code de vérification suivant :
      
      ${code}
      
      Ce code est valable pendant 10 minutes.
      
      Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email.
      
      Cordialement,
      L'équipe Kawepla 😎
    `;

    await this.sendEmail({
      to: email,
      subject: 'Code de vérification - Kawepla',
      html,
      text,
    });
  }

  async sendInvitation(
    guestEmail: string, 
    guestName: string, 
    eventTitle: string, 
    inviteToken: string, 
    eventDate: string,
    location: string,
    eventType: string = 'WEDDING',
    customText?: string
  ): Promise<void> {
    const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/rsvp/${inviteToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invitation</title>
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
              <p style="color: white; margin: 10px 0 0 0;">Vous êtes cordialement invité(e)</p>
            </div>
            
            <div class="content">
              <h2>Cher(e) ${guestName},</h2>
              
              <div class="invitation-card">
                <div class="hearts">💕 ✨ 💕</div>
                <div class="couple-names">${eventTitle}</div>
                <p>${customText || 'Vous êtes cordialement invités à célébrer avec nous'}</p>
                <div class="wedding-date">📅 ${eventDate}</div>
                <div class="venue">📍 ${location}</div>
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
              <strong>${eventTitle}</strong></p>
            </div>
            
            <div class="footer">
              <p>Cet email a été envoyé via Kawepla</p>
              <p>Lien d'invitation : ${invitationUrl}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: guestEmail,
      subject: `Invitation - ${eventTitle}`,
      html,
    });
  }

  async sendInvitationReminder(
    guestEmail: string, 
    guestName: string, 
    eventTitle: string, 
    inviteToken: string, 
    eventDate: string,
    eventType: string = 'WEDDING'
  ): Promise<void> {
    const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/rsvp/${inviteToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Rappel - Invitation </title>
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
              <h1 style="color: white; margin: 0;">🔔 Rappel - Invitation </h1>
            </div>
            
            <div class="content">
              <h2>Cher(e) ${guestName},</h2>
              
              <div class="reminder-card">
                <h3>⏰ Nous n'avons pas encore reçu votre réponse</h3>
                <div class="couple-names">${eventTitle}</div>
                <p>Événement le ${eventDate}</p>
                <p>Nous espérons que vous pourrez être présent(e) pour célébrer avec nous !</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${invitationUrl}" class="cta-button">
                  Confirmer ma présence maintenant
                </a>
              </div>
              
              <p>Merci de nous faire savoir si vous pourrez être des nôtres.</p>
              
              <p>Avec toute notre affection,<br>
              <strong>${eventTitle}</strong></p>
            </div>
            
            <div class="footer">
              <p>Cet email a été envoyé via Kawepla</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: guestEmail,
      subject: `🔔 Rappel - Invitation - ${eventTitle}`,
      html,
    });
  }

  async sendNewsletter(
    userEmail: string,
    userName: string,
    subject: string,
    content: string,
    htmlContent: string,
    newsletterTitle: string
  ): Promise<void> {
    const unsubscribeUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
          <style>
            body { 
              font-family: Inter,-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background-color: #f5f5f5; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 10px; 
              overflow: hidden; 
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #d4af37, #f4e4bc); 
              padding: 30px; 
              text-align: center; 
            }
            .header h1 {
              color: white; 
              margin: 0; 
              font-size: 28px; 
              font-weight: 300;
            }
            .header .subtitle {
              color: rgba(255, 255, 255, 0.9); 
              margin: 10px 0 0 0; 
              font-size: 16px;
            }
            .content { 
              padding: 40px 30px; 
              background: #fff; 
            }
            .content h2 {
              color: #d4af37;
              font-size: 24px;
              font-weight: 400;
              margin: 0 0 20px 0;
              border-bottom: 2px solid #f4e4bc;
              padding-bottom: 10px;
            }
            .newsletter-content {
              font-size: 16px;
              line-height: 1.7;
              color: #444;
              margin: 20px 0;
            }
            .newsletter-content p {
              margin: 16px 0;
            }
            .newsletter-content h3 {
              color: #d4af37;
              font-size: 20px;
              margin: 30px 0 15px 0;
            }
            .newsletter-content ul, .newsletter-content ol {
              padding-left: 20px;
            }
            .newsletter-content li {
              margin: 8px 0;
            }
            .highlight-box {
              background: linear-gradient(135deg, #f4e4bc, #faf7e6);
              border-left: 4px solid #d4af37;
              padding: 20px;
              margin: 25px 0;
              border-radius: 0 8px 8px 0;
            }
            .cta-button { 
              display: inline-block; 
              background: linear-gradient(135deg, #d4af37, #f4e4bc); 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: 600; 
              margin: 25px 0;
              font-size: 16px;
              text-align: center;
              transition: all 0.3s ease;
            }
            .cta-button:hover {
              background: linear-gradient(135deg, #b8941f, #e6d4a3);
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(212, 175, 55, 0.3);
            }
            .footer { 
              background: #f8f9fa; 
              padding: 30px; 
              text-align: center; 
              font-size: 14px; 
              color: #666; 
              border-top: 1px solid #eee;
            }
            .footer a {
              color: #d4af37;
              text-decoration: none;
            }
            .footer a:hover {
              text-decoration: underline;
            }
            .social-links {
              margin: 20px 0;
            }
            .social-links a {
              display: inline-block;
              margin: 0 10px;
              padding: 10px;
              background: #d4af37;
              color: white;
              border-radius: 50%;
              text-decoration: none;
              width: 40px;
              height: 40px;
              line-height: 20px;
              text-align: center;
            }
            .unsubscribe {
              margin-top: 20px;
              font-size: 12px;
              color: #999;
            }
            .unsubscribe a {
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Kawepla Newsletter</h1>
              <p class="subtitle">${newsletterTitle}</p>
            </div>
            
            <div class="content">
              <h2>Bonjour ${userName} 👋</h2>
              
              <div class="newsletter-content">
                ${htmlContent}
              </div>
              

              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/dashboard" class="cta-button">
                  Accéder à mon tableau de bord
                </a>
              </div>
            </div>
            

              
              <p>
                Cet email vous a été envoyé par <strong>Kawepla</strong><br>
                La plateforme complète pour organiser vos événements parfaits
              </p>
              
              <p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Visiter Kawepla</a> | 
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/support">Support</a> | 
              </p>
              

            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Kawepla Newsletter - ${newsletterTitle}
      
      Bonjour ${userName},
      
      ${content}
      
      ---
      
      Accédez à votre tableau de bord : ${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/dashboard
      
      Cet email vous a été envoyé par Kawepla - La plateforme complète pour organiser vos événements parfaits
      
      Pour vous désabonner : ${unsubscribeUrl}
    `;

    await this.sendEmail({
      to: userEmail,
      subject: `📧 ${subject}`,
      html,
      text,
    });
  }

  async sendPromoCode(
    userEmail: string,
    userName: string,
    promoCode: string,
    discount: string,
    expiryDate: string,
    description?: string
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>🎉 Code Promo Exclusif - Kawepla</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background-color: #f5f5f5; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 10px; 
              overflow: hidden; 
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #d4af37, #f4e4bc); 
              padding: 30px; 
              text-align: center; 
            }
            .content { 
              padding: 40px 30px; 
              background: #fff; 
            }
            .promo-card {
              background: linear-gradient(135deg, #f4e4bc, #faf7e6);
              border: 2px dashed #d4af37;
              border-radius: 15px;
              padding: 30px;
              text-align: center;
              margin: 25px 0;
            }
            .promo-code {
              font-size: 32px;
              font-weight: bold;
              color: #d4af37;
              background: white;
              padding: 15px 25px;
              border-radius: 10px;
              border: 2px solid #d4af37;
              display: inline-block;
              letter-spacing: 3px;
              margin: 15px 0;
              font-family: 'Courier New', monospace;
            }
            .discount {
              font-size: 24px;
              font-weight: bold;
              color: #d4af37;
              margin: 10px 0;
            }
            .cta-button { 
              display: inline-block; 
              background: linear-gradient(135deg, #d4af37, #f4e4bc); 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: 600; 
              margin: 25px 0;
              font-size: 16px;
            }
            .footer { 
              background: #f8f9fa; 
              padding: 20px; 
              text-align: center; 
              font-size: 12px; 
              color: #666; 
            }
            .expiry-warning {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              color: #856404;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white; margin: 0;">🎉 Code Promo Exclusif</h1>
              <p style="color: white; margin: 10px 0 0 0;">Profitez de cette offre spéciale !</p>
            </div>
            
            <div class="content">
              <h2>Bonjour ${userName} !</h2>
              
              <p>Nous avons une excellente nouvelle pour vous ! Profitez de cette offre exclusive pour organiser vos événements avec Kawepla.</p>
              
              ${description ? `<p><strong>Offre spéciale :</strong> ${description}</p>` : ''}
              
              <div class="promo-card">
                <h3 style="margin-top: 0; color: #d4af37;">🏷️ Votre Code Promo</h3>
                <div class="promo-code">${promoCode}</div>
                <div class="discount">${discount} de réduction</div>
                <p style="margin-bottom: 0;">Copiez ce code et utilisez-le lors de votre commande</p>
              </div>
              
              <div class="expiry-warning">
                <strong>⏰ Attention :</strong> Cette offre est valable jusqu'au <strong>${expiryDate}</strong>. Ne la manquez pas !
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/billing" class="cta-button">
                  Utiliser mon code promo
                </a>
              </div>
              
              <p>Avec Kawepla, organisez vos événements en toute simplicité :</p>
              <ul>
                <li>✨ Invitations élégantes et personnalisées</li>
                <li>📱 Gestion complète des invités</li>
                <li>📸 Albums photos partagés</li>
                <li>🎯 Prestataires vérifiés</li>
                <li>📊 Statistiques détaillées</li>
              </ul>
              
              <p>Merci de faire confiance à Kawepla pour vos événements !</p>
              
              <p>L'équipe Kawepla 💕</p>
            </div>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement par Kawepla</p>
              <p>Code valable jusqu'au ${expiryDate} - Offre non cumulable</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      🎉 Code Promo Exclusif - Kawepla
      
      Bonjour ${userName} !
      
      Nous avons une excellente nouvelle pour vous ! Profitez de cette offre exclusive pour organiser vos événements avec Kawepla.
      
      ${description ? `Offre spéciale : ${description}` : ''}
      
      🏷️ VOTRE CODE PROMO : ${promoCode}
      ${discount} de réduction
      
      ⏰ Valable jusqu'au ${expiryDate}
      
      Utilisez ce code lors de votre commande : ${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/billing
      
      Avec Kawepla, organisez vos événements en toute simplicité :
      - Invitations élégantes et personnalisées
      - Gestion complète des invités  
      - Albums photos partagés
      - Prestataires vérifiés
      - Statistiques détaillées
      
      Merci de faire confiance à Kawepla pour vos événements !
      
      L'équipe Kawepla
    `;

    await this.sendEmail({
      to: userEmail,
      subject: `🎉 Code Promo Exclusif ${discount} - Kawepla`,
      html,
      text,
    });
  }
}

export const emailService = new EmailService(); 