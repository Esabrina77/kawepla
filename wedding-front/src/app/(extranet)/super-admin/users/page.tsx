'use client';

import { useState } from 'react';
import styles from './users.module.css';
import Image from 'next/image';
import { useAdminUsers } from '@/hooks/useAdminUsers';

export default function UsersPage() {
  const { 
    users, 
    loading, 
    error, 
    filters, 
    setFilters, 
    toggleUserStatus, 
    changeUserRole, 
    changeUserSubscriptionTier,
    deleteUser 
  } = useAdminUsers();

  const [editingUser, setEditingUser] = useState<string | null>(null);

  const handleStatusToggle = async (userId: string) => {
    try {
      await toggleUserStatus(userId);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'COUPLE' | 'GUEST') => {
    try {
      await changeUserRole(userId, newRole);
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
    }
  };

  const handleSubscriptionTierChange = async (userId: string, newTier: 'FREE' | 'ESSENTIAL' | 'ELEGANT' | 'PREMIUM' | 'LUXE') => {
    try {
      await changeUserSubscriptionTier(userId, newTier);
    } catch (error) {
      console.error('Erreur lors du changement de forfait:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'COUPLE': return 'Couple';
      case 'GUEST': return 'Invité';
      default: return role;
    }
  };

  const getSubscriptionTierLabel = (tier: string) => {
    switch (tier) {
      case 'FREE': return 'Découverte';
      case 'ESSENTIAL': return 'Essentiel';
      case 'ELEGANT': return 'Élégant';
      case 'PREMIUM': return 'Premium';
      case 'LUXE': return 'Luxe';
      default: return tier;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>
            <Image
              src="/icons/guests.svg"
              alt=""
              width={32}
              height={32}
            />
            Gestion des utilisateurs
          </h1>
        </div>
        <div className={styles.loading}>Chargement des utilisateurs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>
            <Image
              src="/icons/guests.svg"
              alt=""
              width={32}
              height={32}
            />
            Gestion des utilisateurs
          </h1>
        </div>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          <Image
            src="/icons/guests.svg"
            alt=""
            width={32}
            height={32}
          />
          Gestion des utilisateurs
        </h1>
        <p>{users.length} utilisateur{users.length > 1 ? 's' : ''}</p>
      </div>

      <div className={styles.filters}>
        <input
          type="search"
          placeholder="Rechercher un utilisateur..."
          className={styles.filterInput}
          value={filters.search || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
        />
        <select 
          className={styles.filterInput}
          value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
          onChange={(e) => {
            const value = e.target.value;
            setFilters(prev => ({ 
              ...prev, 
              isActive: value === 'all' ? undefined : value === 'active' 
            }));
          }}
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
        <select 
          className={styles.filterInput}
          value={filters.role || 'all'}
          onChange={(e) => {
            const value = e.target.value;
            setFilters(prev => ({ 
              ...prev, 
              role: value === 'all' ? undefined : value as 'ADMIN' | 'COUPLE' | 'GUEST'
            }));
          }}
        >
          <option value="all">Tous les rôles</option>
          <option value="COUPLE">Couples</option>
          <option value="ADMIN">Admins</option>
          <option value="GUEST">Invités</option>
        </select>
      </div>

      <div className={styles.userGrid}>
        {users.map((user) => (
          <div key={user.id} className={styles.userCard}>
            <div className={styles.userHeader}>
              <div className={styles.userAvatar}>
                <div style={{width: 48, height: 48, background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, color: '#64748b'}}>
                  {user.email.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <div className={styles.userName}>{user.firstName} {user.lastName}</div>
                <div className={styles.userEmail}>{user.email}</div>
                <div className={styles.badges}>
                  <span className={`${styles.roleBadge} ${user.role === 'ADMIN' ? styles.roleAdmin : user.role === 'COUPLE' ? styles.roleCouple : styles.roleGuest}`}>{getRoleLabel(user.role)}</span>
                  <span className={`${styles.statusBadge} ${user.isActive ? '' : styles.statusInactive}`}>{user.isActive ? 'Actif' : 'Inactif'}</span>
                  <span className={`${styles.subscriptionBadge} ${styles[`tier${user.subscriptionTier}`]}`}>{getSubscriptionTierLabel(user.subscriptionTier)}</span>
                  {user.emailVerified && (
                    <span className={styles.verifiedBadge}>Email vérifié</span>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.userMeta}>
              <span><strong>Créé le</strong> {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span> &nbsp;|&nbsp; 
              <span><strong>Modifié le</strong> {new Date(user.updatedAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className={styles.actions}>
              {editingUser === user.id ? (
                <>
                  <div className={styles.editSection}>
                    <label className={styles.editLabel}>Rôle:</label>
                    <select 
                      className={styles.filterInput}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as 'ADMIN' | 'COUPLE' | 'GUEST')}
                    >
                      <option value="COUPLE">Couple</option>
                      <option value="ADMIN">Admin</option>
                      <option value="GUEST">Invité</option>
                    </select>
                  </div>
                  <div className={styles.editSection}>
                    <label className={styles.editLabel}>Forfait:</label>
                    <select 
                      className={styles.filterInput}
                      value={user.subscriptionTier}
                      onChange={(e) => handleSubscriptionTierChange(user.id, e.target.value as 'FREE' | 'ESSENTIAL' | 'ELEGANT' | 'PREMIUM' | 'LUXE')}
                    >
                      <option value="FREE">Découverte</option>
                      <option value="ESSENTIAL">Essentiel</option>
                      <option value="ELEGANT">Élégant</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="LUXE">Luxe</option>
                    </select>
                  </div>
                  <button className={`${styles.actionButton} ${styles.secondary}`} onClick={() => setEditingUser(null)}>Fermer</button>
                </>
              ) : (
                <>
                  <button className={`${styles.actionButton} ${styles.secondary}`} onClick={() => setEditingUser(user.id)}>Éditer</button>
                  <button className={`${styles.actionButton} ${user.isActive ? styles.secondary : ''}`} onClick={() => handleStatusToggle(user.id)}>
                    {user.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                  <button className={`${styles.actionButton} ${styles.danger}`} onClick={() => handleDelete(user.id)}>Supprimer</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className={styles.error}>
          <p>Aucun utilisateur trouvé</p>
        </div>
      )}
    </div>
  );
} 