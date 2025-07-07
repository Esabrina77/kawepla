'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGuests } from '@/hooks/useGuests';
import { useInvitations } from '@/hooks/useInvitations';
import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import styles from './guests.module.css';

// Hook pour récupérer l'ID de l'invitation active
function useActiveInvitation() {
  const { activeInvitation, loading } = useInvitations();
  return { invitationId: activeInvitation?.id || null, loading };
}

export default function GuestsPage() {
  const { invitationId, loading: loadingInvitation } = useActiveInvitation();
  
  if (loadingInvitation) {
    return <div>Chargement de l'invitation...</div>;
  }

  if (!invitationId) {
    return (
      <div className={styles.noInvitation}>
        <Card>
          <h2>Aucune invitation active</h2>
          <p>Vous devez d'abord créer une invitation avant de pouvoir gérer vos invités.</p>
          <Link href="/client/invitations" className="inline-block">
            <Button variant="primary">
              Créer une invitation
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return <GuestsList invitationId={invitationId} />;
}

function GuestsList({ invitationId }: { invitationId: string }) {
  const {
    guests,
    statistics,
    loading,
    error,
    createGuest,
    updateGuest,
    deleteGuest,
    importGuests
  } = useGuests(invitationId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isVip: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGuest(formData);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        isVip: false
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Erreur lors de la création de l\'invité:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await importGuests(file);
      console.log(`${result.imported} invités importés`);
      if (result.errors.length > 0) {
        console.error('Erreurs lors de l\'import:', result.errors);
      }
    } catch (error) {
      console.error('Erreur lors de l\'import du fichier:', error);
    }
  };

  const handleStatusChange = async (guestId: string, status: 'confirmed' | 'declined' | 'pending') => {
    try {
      await updateGuest(guestId, { status });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet invité ?')) return;
    try {
      await deleteGuest(guestId);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'invité:', error);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Une erreur est survenue</div>;
  }

  return (
    <div className={styles.guestsPage}>
      <div className={styles.header}>
        <h1>Gestion des invités</h1>
        <div className={styles.actions}>
          <Button onClick={() => setShowAddForm(true)} variant="primary">
            Ajouter un invité
          </Button>
          <div className={styles.importContainer}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="csvUpload"
            />
            <Button onClick={() => document.getElementById('csvUpload')?.click()} variant="outline">
              Importer CSV
            </Button>
          </div>
        </div>
      </div>

      {statistics && (
        <div className={styles.statistics}>
          <Card>
            <h2>Statistiques</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span>Total</span>
                <strong>{statistics.total}</strong>
              </div>
              <div className={styles.statItem}>
                <span>Confirmés</span>
                <strong>{statistics.confirmed}</strong>
              </div>
              <div className={styles.statItem}>
                <span>En attente</span>
                <strong>{statistics.pending}</strong>
              </div>
              <div className={styles.statItem}>
                <span>Refusés</span>
                <strong>{statistics.declined}</strong>
              </div>
              <div className={styles.statItem}>
                <span>Taux de réponse</span>
                <strong>{statistics.responseRate}%</strong>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showAddForm && (
        <div className={styles.addForm}>
          <Card>
            <h2>Ajouter un invité</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Prénom"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Nom"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Téléphone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                <label>
                  <input
                    type="checkbox"
                    name="isVip"
                    checked={formData.isVip}
                    onChange={handleInputChange}
                  />
                  Invité VIP
                </label>
              </div>
              <div className={styles.formActions}>
                <Button type="submit" variant="primary">
                  Ajouter
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <div className={styles.guestsList}>
        {guests.map(guest => (
          <Card key={guest.id} className={styles.guestCard}>
            <div className={styles.guestInfo}>
              <h3>{guest.firstName} {guest.lastName}</h3>
              <p>{guest.email}</p>
              {guest.phone && <p>{guest.phone}</p>}
              {guest.isVip && <span className={styles.vipBadge}>VIP</span>}
              {guest.dietaryRestrictions && (
                <p className={styles.dietaryRestrictions}>
                  Régime : {guest.dietaryRestrictions}
                </p>
              )}
            </div>
            <div className={styles.guestActions}>
              <select
                value={guest.status}
                onChange={(e) => handleStatusChange(guest.id, e.target.value as any)}
                className={styles.statusSelect}
              >
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmé</option>
                <option value="declined">Refusé</option>
              </select>
              <Button
                variant="danger"
                onClick={() => handleDeleteGuest(guest.id)}
                size="small"
              >
                Supprimer
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 