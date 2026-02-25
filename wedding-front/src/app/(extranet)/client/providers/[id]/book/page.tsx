'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { HeaderMobile } from '@/components/HeaderMobile';
import { useProviderDetail } from '@/hooks/useProviderDetail';
import { useProviderConversation, useBookingInfo } from '@/hooks/useProviderConversations';
import { bookingsApi, CreateBookingDto } from '@/lib/api/bookings';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, Users, MessageCircle, Euro, CheckCircle, X } from 'lucide-react';
import styles from './book.module.css';
import Link from 'next/link';

const EVENT_TYPES = [
  { value: 'WEDDING', label: 'Mariage' },
  { value: 'BIRTHDAY', label: 'Anniversaire' },
  { value: 'BAPTISM', label: 'Baptême' },
  { value: 'CORPORATE', label: 'Événement d\'entreprise' },
  { value: 'OTHER', label: 'Autre' }
];

export default function BookServicePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const providerId = params.id as string;
  const serviceId = searchParams.get('serviceId') || '';
  const conversationIdParam = searchParams.get('conversationId') || '';

  const { user } = useAuth();
  const { provider, services, loading: providerLoading } = useProviderDetail(providerId);
  const { conversation, loading: conversationLoading } = useProviderConversation(conversationIdParam || null);
  const { bookingInfo, fetchBookingInfo } = useBookingInfo(conversationIdParam || null);

  const [selectedService, setSelectedService] = useState<any>(null);
  const [useCustomService, setUseCustomService] = useState(false);
  const [formData, setFormData] = useState({
    eventDate: '',
    eventTime: '',
    eventType: 'WEDDING',
    guestCount: '',
    message: '',
    clientPhone: '',
    customServiceName: '',
    customServiceDescription: '',
    customServicePrice: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger le service sélectionné
  useEffect(() => {
    if (services && serviceId) {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        setSelectedService(service);
      }
    } else if (services && services.length > 0) {
      setSelectedService(services[0]);
    }
  }, [services, serviceId]);

  // Pré-remplir depuis la conversation
  useEffect(() => {
    if (conversationIdParam && !bookingInfo) {
      fetchBookingInfo();
    }
  }, [conversationIdParam, bookingInfo, fetchBookingInfo]);

  useEffect(() => {
    if (bookingInfo) {
      setFormData(prev => ({
        ...prev,
        eventDate: bookingInfo.eventDate || prev.eventDate,
        eventTime: bookingInfo.eventTime || prev.eventTime,
        eventType: bookingInfo.eventType || prev.eventType,
        guestCount: bookingInfo.guestCount?.toString() || prev.guestCount,
        message: bookingInfo.message || prev.message
      }));
    }
  }, [bookingInfo]);

  // Vérifier qu'une conversation existe
  useEffect(() => {
    if (!conversationIdParam && !conversationLoading) {
      setError('Vous devez d\'abord contacter le prestataire avant de réserver.');
    }
  }, [conversationIdParam, conversationLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!conversationIdParam) {
      setError('Vous devez d\'abord contacter le prestataire avant de réserver.');
      return;
    }

    // Vérifier qu'un service est sélectionné OU qu'un service personnalisé est fourni
    if (!selectedService && !useCustomService) {
      setError('Veuillez sélectionner un service ou créer un service personnalisé');
      return;
    }

    if (useCustomService && !formData.customServiceName.trim()) {
      setError('Veuillez indiquer le nom du service personnalisé');
      return;
    }

    if (!formData.eventDate) {
      setError('Veuillez sélectionner une date');
      return;
    }

    if (!user) {
      setError('Vous devez être connecté pour réserver');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Calculer le prix total
      let totalPrice = 0;
      if (selectedService && !useCustomService) {
        totalPrice = selectedService.price;
        if (selectedService.priceType === 'PER_PERSON' && formData.guestCount) {
          totalPrice = selectedService.price * parseInt(formData.guestCount);
        } else if (selectedService.priceType === 'PER_HOUR' && selectedService.duration) {
          // Estimation basée sur la durée du service
          totalPrice = selectedService.price * (selectedService.duration / 60);
        }
      } else if (useCustomService) {
        // Pour un service personnalisé, utiliser le montant saisi par le client
        if (!formData.customServicePrice || parseFloat(formData.customServicePrice) <= 0) {
          setError('Veuillez indiquer le montant estimé pour le service personnalisé');
          return;
        }
        totalPrice = parseFloat(formData.customServicePrice);
      }

      const bookingData: CreateBookingDto = {
        clientId: user.id,
        providerId: providerId,
        serviceId: useCustomService ? undefined : selectedService?.id,
        customServiceName: useCustomService ? formData.customServiceName : undefined,
        customServiceDescription: useCustomService ? formData.customServiceDescription : undefined,
        conversationId: conversationIdParam,
        clientName: `${user.firstName} ${user.lastName}`,
        clientEmail: user.email || '',
        clientPhone: formData.clientPhone || undefined,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime || undefined,
        eventType: formData.eventType,
        guestCount: formData.guestCount ? parseInt(formData.guestCount) : undefined,
        message: formData.message || undefined,
        totalPrice: totalPrice
      };

      const result = await bookingsApi.createBooking(bookingData);

      // Rediriger vers la page de messages avec le conversationId
      if (conversationIdParam) {
        router.replace(`/client/providers/${providerId}/messages?conversationId=${conversationIdParam}&bookingSuccess=true`);
      } else {
        // Si pas de conversationId, rediriger vers la liste des providers
        router.replace(`/client/providers?bookingSuccess=true&bookingId=${result.booking.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number, priceType: string) => {
    switch (priceType) {
      case 'FIXED':
        return `${price}€`;
      case 'PER_HOUR':
        return `${price}€/h`;
      case 'PER_PERSON':
        return `${price}€/pers`;
      case 'CUSTOM':
        return 'Sur devis';
      default:
        return `${price}€`;
    }
  };

  if (providerLoading || conversationLoading) {
    return (
      <div className={styles.bookPage}>
        <HeaderMobile title="Réserver un service" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!provider || !conversationIdParam) {
    return (
      <div className={styles.bookPage}>
        <HeaderMobile title="Réserver un service" />
        <div className={styles.errorContainer}>
          <X size={48} />
          <h2>Réservation impossible</h2>
          <p>Vous devez d'abord contacter le prestataire avant de réserver.</p>
          <Link href={`/client/providers/${providerId}/messages`} className={styles.contactButton}>
            <MessageCircle size={16} />
            Contacter le prestataire
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bookPage}>
      <HeaderMobile title="Réserver un service" />

      <div className={styles.bookContainer}>
        {/* En-tête Prestataire */}
        <div className={styles.providerHeader}>
          <h2>{provider.businessName}</h2>
          {provider.category && (
            <p className={styles.category}>{provider.category.name}</p>
          )}
        </div>

        {/* Section 1: Service */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Sélection du service</h3>
          
          <div className={styles.serviceSelection}>
            <div className={styles.serviceOptions}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="serviceType"
                  className={styles.radioInput}
                  checked={!useCustomService}
                  onChange={() => {
                    setUseCustomService(false);
                    if (services.length > 0 && !selectedService) {
                      setSelectedService(services[0]);
                    }
                  }}
                />
                <span>Catalogue</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="serviceType"
                  className={styles.radioInput}
                  checked={useCustomService}
                  onChange={() => {
                    setUseCustomService(true);
                    setSelectedService(null);
                  }}
                />
                <span>Sur mesure</span>
              </label>
            </div>

            {!useCustomService ? (
              <select
                value={selectedService?.id || ''}
                onChange={(e) => {
                  const service = services.find(s => s.id === e.target.value);
                  setSelectedService(service || null);
                }}
                className={styles.select}
              >
                <option value="">Choisir un service...</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} — {formatPrice(service.price, service.priceType)}
                  </option>
                ))}
              </select>
            ) : (
              <div className={styles.customServiceFields}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nom du service personnalisé *</label>
                  <input
                    type="text"
                    value={formData.customServiceName}
                    onChange={(e) => setFormData({ ...formData, customServiceName: e.target.value })}
                    className={styles.input}
                    placeholder="Ex: Décoration florale"
                  />
                </div>
                <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                  <label className={styles.label}>Montant convenu (€) *</label>
                  <input
                    type="number"
                    value={formData.customServicePrice}
                    onChange={(e) => setFormData({ ...formData, customServicePrice: e.target.value })}
                    className={styles.input}
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}

            {selectedService && (
              <div className={styles.serviceInfo}>
                <p className={styles.serviceDescription}>{selectedService.description}</p>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  {selectedService.duration && (
                    <div className={styles.serviceDetail}>
                      <Clock size={14} />
                      <span>{selectedService.duration} min</span>
                    </div>
                  )}
                  {selectedService.capacity && (
                    <div className={styles.serviceDetail}>
                      <Users size={14} />
                      <span>Max. {selectedService.capacity} pers.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Détails de l'événement */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Détails de l'événement</h3>
          
          <form onSubmit={handleSubmit} className={styles.bookingForm}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Calendar size={14} /> Date *
              </label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className={styles.input}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Clock size={14} /> Heure
              </label>
              <input
                type="time"
                value={formData.eventTime}
                onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Type d'événement *</label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className={styles.select}
                required
              >
                {EVENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Users size={14} /> Invités
              </label>
              <input
                type="number"
                value={formData.guestCount}
                onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                className={styles.input}
                min="1"
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Message au prestataire (optionnel)</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className={styles.textarea}
                rows={3}
                placeholder="Précisez vos besoins..."
              />
            </div>

            {/* Actions & Résumé */}
            <div className={styles.footerActions}>
              {(selectedService || (useCustomService && formData.customServicePrice)) && (
                <div className={styles.priceSummary}>
                  <div className={styles.priceRow}>
                    <span>{useCustomService ? formData.customServiceName : selectedService.name}</span>
                    <span>{useCustomService ? `${formData.customServicePrice}€` : formatPrice(selectedService.price, selectedService.priceType)}</span>
                  </div>
                  <div className={styles.priceTotal}>
                    <span>Total estimé</span>
                    <span>
                      {useCustomService 
                        ? `${formData.customServicePrice}€`
                        : selectedService.priceType === 'PER_PERSON' && formData.guestCount
                          ? `${(selectedService.price * parseInt(formData.guestCount)).toFixed(2)}€`
                          : `${selectedService.price}€`
                      }
                    </span>
                  </div>
                </div>
              )}

              {error && <div className={styles.errorMessage}>{error}</div>}

              <button
                type="submit"
                disabled={submitting}
                className={styles.submitButton}
              >
                {submitting ? (
                  <div className={styles.loadingSpinner}></div>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Confirmer la réservation
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

