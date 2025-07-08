import { Card } from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';
import styles from '@/styles/site/contact.module.css';

export default function ContactPage() {
  return (
    <div className={styles.contact}>
      <section className={styles.header}>
        <div className="container">
          <h1>Contactez-nous</h1>
          <p>Notre équipe est à votre disposition pour répondre à toutes vos questions</p>
        </div>
      </section>

      <section className={styles.content}>
        <div className="container">
          <div className={styles.grid}>
            <div title="Nos coordonnées">
              <Card className={styles.contactInfo}>
                <h2>Informations de contact</h2>
                <div className={styles.infoList}>
                  <a 
                    href="mailto:whethefoot@gmail.com" 
                    className={styles.infoItem}
                    title="Nous envoyer un email"
                  >
                    <svg
                      className={styles.icon}
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22 6L12 13L2 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div>
                      <h3>Email</h3>
                      <p>whethefoot@gmail.com</p>
                    </div>
                  </a>
                  <a 
                    href="tel:+33123456789" 
                    className={styles.infoItem}
                    title="Nous appeler"
                  >
                    <svg
                      className={styles.icon}
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 16.92V19.92C22 20.4704 21.7893 20.9987 21.4142 21.3738C21.0391 21.7489 20.5109 21.9596 19.96 21.96C16.4 22.21 12.94 21.54 9.82 19.98C6.94 18.57 4.44 16.07 3.03 13.19C1.46 10.06 0.79 6.59 1.04 3.02C1.04042 2.47018 1.25065 1.94297 1.62541 1.56881C2.00018 1.19464 2.52669 0.985315 3.07 0.985992H6.07C7.06184 0.975556 7.87741 1.71271 8 2.69C8.12 3.73 8.34 4.75 8.66 5.73C8.93345 6.51756 8.77501 7.38877 8.24 8L6.91 9.33C8.21332 12.3385 10.6615 14.7867 13.67 16.09L15 14.76C15.6112 14.225 16.4824 14.0665 17.27 14.34C18.25 14.66 19.27 14.88 20.31 15C21.2959 15.1237 22.0353 15.9471 22 16.92Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div>
                      <h3>Téléphone</h3>
                      <p>+33 1 23 45 67 89</p>
                    </div>
                  </a>
                  <a 
                    href="https://maps.google.com/?q=123+Avenue+des+Mariages+75001+Paris+France" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.infoItem}
                    title="Voir notre adresse sur Google Maps"
                  >
                    <svg
                      className={styles.icon}
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div>
                      <h3>Adresse</h3>
                      <p>123 Avenue des Mariages<br />75001 Paris, France</p>
                    </div>
                  </a>
                </div>
              </Card>
            </div>

            <div title="Formulaire de contact">
              <Card className={styles.contactForm}>
                <h2>Envoyez-nous un message</h2>
                <form className={styles.form}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Nom complet</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      required 
                      title="Entrez votre nom complet"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      required 
                      title="Entrez votre adresse email"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="subject">Sujet</label>
                    <input 
                      type="text" 
                      id="subject" 
                      name="subject" 
                      required 
                      title="Entrez le sujet de votre message"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="message">Message</label>
                    <textarea 
                      id="message" 
                      name="message" 
                      rows={5} 
                      required
                      title="Écrivez votre message"
                    ></textarea>
                  </div>
                  <Button 
                    type="submit" 
                    size="large" 
                    fullWidth
                    title="Envoyer votre message"
                  >
                    Envoyer le message
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 