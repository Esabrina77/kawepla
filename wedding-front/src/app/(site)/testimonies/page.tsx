import { Card } from '@/components/Card/Card';
import styles from '@/styles/site/testimonies.module.css';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Sophie & Thomas',
    date: 'Juin 2023',
    image: '/images/testimonials/sophie-thomas.jpg',
    content: 'Kawepla nous a permis de créer des invitations magnifiques et de gérer facilement nos 150 invités. Le suivi des RSVP en temps réel était particulièrement pratique !',
    rating: 5
  },
  {
    name: 'Marie & Jean',
    date: 'Septembre 2023',
    image: '/images/testimonials/marie-jean.jpg',
    content: 'Un outil complet et élégant qui nous a fait gagner beaucoup de temps. Nos invités ont adoré le design personnalisé et la facilité de réponse en ligne.',
    rating: 5
  },
  {
    name: 'Léa & Pierre',
    date: 'Juillet 2023',
    image: '/images/testimonials/lea-pierre.jpg',
    content: 'Le meilleur investissement pour notre mariage ! La plateforme est intuitive et le support client est très réactif. Je recommande vivement.',
    rating: 5
  },
  {
    name: 'Claire & Antoine',
    date: 'Août 2023',
    image: '/images/testimonials/claire-antoine.jpg',
    content: 'Nous avons opté pour la formule Premium et nous ne le regrettons pas. Les animations et la vidéo d\'invitation ont vraiment impressionné nos invités.',
    rating: 5
  },
  {
    name: 'Emma & Lucas',
    date: 'Mai 2023',
    image: '/images/testimonials/emma-lucas.jpg',
    content: 'Un grand merci à l\'équipe Kawepla ! Le site était magnifique et la gestion des invités très simple. Tout était parfait !',
    rating: 5
  },
  {
    name: 'Julie & Nicolas',
    date: 'Octobre 2023',
    image: '/images/testimonials/julie-nicolas.jpg',
    content: 'La personnalisation poussée nous a permis de créer des invitations qui nous ressemblent vraiment. Le résultat final était au-delà de nos espérances.',
    rating: 5
  }
];

export default function TestimoniesPage() {
  return (
    <div className={styles.testimonies}>
      <section className={styles.header}>
        <div className="container">
          <h1>Témoignages</h1>
          <p>Découvrez ce que nos clients disent de nous</p>
        </div>
      </section>

      <section className={styles.testimonialsList}>
        <div className="container">
          <div className={styles.grid}>
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className={styles.testimonialCard}>
                <div className={styles.testimonialHeader}>
                  <div className={styles.testimonialImage}>
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={80}
                      height={80}
                    />
                  </div>
                  <div className={styles.testimonialInfo}>
                    <h3>{testimonial.name}</h3>
                    <p className={styles.date}>{testimonial.date}</p>
                    <div className={styles.rating}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <svg
                          key={i}
                          className={styles.star}
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={styles.testimonialContent}>
                  <p>{testimonial.content}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className="container">
          <h2>Prêt à créer votre invitation de mariage ?</h2>
          <p>Rejoignez les nombreux couples qui nous font confiance</p>
          <button className={styles.ctaButton}>
            Commencer maintenant
          </button>
        </div>
      </section>
    </div>
  );
} 