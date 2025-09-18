'use client';

import { useState } from 'react';
import styles from './users.module.css';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff, 
  Shield, 
  Heart, 
  User,
  CheckCircle,
  Calendar,
  Mail
} from 'lucide-react';

export default function UsersPage() {
  const { 
    users, 
    loading, 
    error, 
    filters, 
    setFilters, 
    toggleUserStatus, 
    changeUserRole, 
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

  const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'HOST' | 'GUEST' | 'PROVIDER') => {
    try {
      await changeUserRole(userId, newRole);
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
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
      case 'HOST': return 'Organisateur';
      case 'PROVIDER': return 'Prestataire';
      case 'GUEST': return 'Invité';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield style={{ width: '14px', height: '14px' }} />;
      case 'HOST': return <Heart style={{ width: '14px', height: '14px' }} />;
      case 'PROVIDER': return <User style={{ width: '14px', height: '14px' }} />;
      case 'GUEST': return <User style={{ width: '14px', height: '14px' }} />;
      default: return <User style={{ width: '14px', height: '14px' }} />;
    }
  };

  if (loading) {
    return (
      <div className={styles.usersContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.usersContainer}>
        <div className={styles.errorContainer}>
          <p>Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.usersContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.badge}>
          <Users style={{ width: '16px', height: '16px' }} />
          Gestion des utilisateurs
        </div>
        
        <h1 className={styles.title}>
          Vos <span className={styles.titleAccent}>utilisateurs</span>
        </h1>
        
        <p className={styles.subtitle}>
          Gérez les comptes et les permissions de votre plateforme Kawepla
        </p>
      </div>

      {/* Filters */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={filters.search || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterContainer}>
          <Filter className={styles.filterIcon} />
          <select 
            className={styles.filterSelect}
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
        </div>

        <div className={styles.filterContainer}>
          <Filter className={styles.filterIcon} />
          <select 
            className={styles.filterSelect}
            value={filters.role || 'all'}
            onChange={(e) => {
              const value = e.target.value;
              setFilters(prev => ({ 
                ...prev, 
                role: value === 'all' ? undefined : value as 'ADMIN' | 'HOST' | 'GUEST' | 'PROVIDER'
              }));
            }}
          >
            <option value="all">Tous les rôles</option>
            <option value="HOST">Organisateurs</option>
            <option value="PROVIDER">Prestataires</option>
            <option value="ADMIN">Admins</option>
            <option value="GUEST">Invités</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      <div className={styles.usersGrid}>
        {users.map((user) => (
          <div key={user.id} className={styles.userCard}>
            {/* User Header */}
            <div className={styles.userHeader}>
              <div className={styles.userAvatar}>
                <div className={styles.avatarContent}>
                  {user.email.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className={styles.userInfo}>
                <h3 className={styles.userName}>{user.firstName} {user.lastName}</h3>
                <div className={styles.userEmail}>
                  <Mail style={{ width: '14px', height: '14px' }} />
                  {user.email}
                </div>
              </div>
            </div>

            {/* User Badges */}
            <div className={styles.userBadges}>
              <span className={`${styles.roleBadge} ${user.role === 'ADMIN' ? styles.roleAdmin : user.role === 'HOST' ? styles.roleorganisateur : user.role === 'PROVIDER' ? styles.roleProvider : styles.roleGuest}`}>
                {getRoleIcon(user.role)}
                {getRoleLabel(user.role)}
              </span>
              <span className={`${styles.statusBadge} ${user.isActive ? styles.statusActive : styles.statusInactive}`}>
                {user.isActive ? 'Actif' : 'Inactif'}
              </span>
              {user.emailVerified && (
                <span className={styles.verifiedBadge}>
                  <CheckCircle style={{ width: '12px', height: '12px' }} />
                  Vérifié
                </span>
              )}
            </div>

            {/* User Meta */}
            <div className={styles.userMeta}>
              <div className={styles.metaItem}>
                <Calendar style={{ width: '14px', height: '14px' }} />
                <span>Créé le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actionsContainer}>
              {editingUser === user.id ? (
                <>
                  <select 
                    className={styles.roleSelect}
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as 'ADMIN' | 'HOST' | 'GUEST' | 'PROVIDER')}
                  >
                    <option value="HOST">Organisateur</option>
                    <option value="PROVIDER">Prestataire</option>
                    <option value="ADMIN">Admin</option>
                    <option value="GUEST">Invité</option>
                  </select>
                  <button 
                    className={styles.closeButton} 
                    onClick={() => setEditingUser(null)}
                  >
                    Fermer
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className={styles.editButton}
                    onClick={() => setEditingUser(user.id)}
                  >
                    <Edit style={{ width: '14px', height: '14px' }} />
                    Éditer
                  </button>
                  
                  <button 
                    className={styles.toggleButton}
                    onClick={() => handleStatusToggle(user.id)}
                  >
                    {user.isActive ? (
                      <>
                        <PowerOff style={{ width: '14px', height: '14px' }} />
                        Désactiver
                      </>
                    ) : (
                      <>
                        <Power style={{ width: '14px', height: '14px' }} />
                        Activer
                      </>
                    )}
                  </button>
                  
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                    Supprimer
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className={styles.emptyState}>
          <Users style={{ width: '64px', height: '64px', marginBottom: 'var(--space-md)' }} />
          <h3>Aucun utilisateur trouvé</h3>
          <p>
            {filters.search || filters.role || filters.isActive !== undefined
              ? 'Aucun utilisateur ne correspond à vos critères de recherche' 
              : 'Aucun utilisateur enregistré pour le moment'
            }
          </p>
        </div>
      )}
    </div>
  );
} 