'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Type, FileText } from 'lucide-react';
import styles from './InvitationEventFormModal.module.css';

export interface EventFormData {
  eventTitle: string;
  eventDate: string; // Format YYYY-MM-DD
  eventTime?: string; // Format HH:mm
  location: string;
  eventType: 'WEDDING' | 'BIRTHDAY' | 'BAPTISM' | 'CORPORATE' | 'OTHER';
  customText?: string;
  moreInfo?: string;
  description?: string;
}

interface InvitationEventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => void;
  initialData?: Partial<EventFormData>;
  loading?: boolean;
}

export function InvitationEventFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false
}: InvitationEventFormModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    eventTitle: initialData?.eventTitle || '',
    eventDate: initialData?.eventDate || '',
    eventTime: initialData?.eventTime || '',
    location: initialData?.location || '',
    eventType: initialData?.eventType || 'WEDDING',
    customText: initialData?.customText || '',
    moreInfo: initialData?.moreInfo || '',
    description: initialData?.description || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};

    if (!formData.eventTitle.trim()) {
      newErrors.eventTitle = 'Le titre de l\'événement est obligatoire';
    }

    if (!formData.eventDate) {
      newErrors.eventDate = 'La date de l\'événement est obligatoire';
    } else {
      const date = new Date(formData.eventDate);
      if (isNaN(date.getTime())) {
        newErrors.eventDate = 'Date invalide';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Le lieu est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Informations de l'événement</h2>
          <button className={styles.closeButton} onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Titre de l'événement - OBLIGATOIRE */}
          <div className={styles.field}>
            <label className={styles.label}>
              <Type size={16} />
              Titre de l'événement <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={formData.eventTitle}
              onChange={(e) => handleChange('eventTitle', e.target.value)}
              placeholder="Ex: Emma & Lucas"
              className={styles.input}
              disabled={loading}
            />
            {errors.eventTitle && <span className={styles.error}>{errors.eventTitle}</span>}
          </div>

          {/* Date de l'événement - OBLIGATOIRE */}
          <div className={styles.field}>
            <label className={styles.label}>
              <Calendar size={16} />
              Date de l'événement <span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              value={formData.eventDate}
              onChange={(e) => handleChange('eventDate', e.target.value)}
              className={styles.input}
              disabled={loading}
            />
            {errors.eventDate && <span className={styles.error}>{errors.eventDate}</span>}
          </div>

          {/* Heure de l'événement - OPTIONNEL */}
          <div className={styles.field}>
            <label className={styles.label}>
              <Clock size={16} />
              Heure de l'événement
            </label>
            <input
              type="time"
              value={formData.eventTime}
              onChange={(e) => handleChange('eventTime', e.target.value)}
              className={styles.input}
              disabled={loading}
            />
          </div>

          {/* Lieu - OBLIGATOIRE */}
          <div className={styles.field}>
            <label className={styles.label}>
              <MapPin size={16} />
              Lieu <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Ex: Château de la Roseraie, Paris"
              className={styles.input}
              disabled={loading}
            />
            {errors.location && <span className={styles.error}>{errors.location}</span>}
          </div>

          {/* Type d'événement */}
          <div className={styles.field}>
            <label className={styles.label}>
              Type d'événement
            </label>
            <select
              value={formData.eventType}
              onChange={(e) => handleChange('eventType', e.target.value as EventFormData['eventType'])}
              className={styles.select}
              disabled={loading}
            >
              <option value="WEDDING">Mariage</option>
              <option value="BIRTHDAY">Anniversaire</option>
              <option value="BAPTISM">Baptême</option>
              <option value="CORPORATE">Événement d'entreprise</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>

          {/* Description - OPTIONNEL */}
          <div className={styles.field}>
            <label className={styles.label}>
              <FileText size={16} />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description de l'invitation..."
              rows={3}
              className={styles.textarea}
              disabled={loading}
            />
          </div>

          {/* Texte personnalisé - OPTIONNEL */}
          <div className={styles.field}>
            <label className={styles.label}>
              Texte personnalisé
            </label>
            <textarea
              value={formData.customText}
              onChange={(e) => handleChange('customText', e.target.value)}
              placeholder="Texte libre personnalisable..."
              rows={2}
              className={styles.textarea}
              disabled={loading}
            />
          </div>

          {/* Informations supplémentaires - OPTIONNEL */}
          <div className={styles.field}>
            <label className={styles.label}>
              Informations supplémentaires
            </label>
            <textarea
              value={formData.moreInfo}
              onChange={(e) => handleChange('moreInfo', e.target.value)}
              placeholder="Détails additionnels..."
              rows={2}
              className={styles.textarea}
              disabled={loading}
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !formData.eventTitle.trim() || !formData.eventDate || !formData.location.trim()}
            >
              {loading ? 'Enregistrement...' : 'Continuer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

