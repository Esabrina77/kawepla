'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNewsletters } from '@/hooks/useNewsletters';
import { 
  Mail, 
  ArrowLeft, 
  Save, 
  Send, 
  Calendar, 
  Users, 
  Eye, 
  Search,
  X,
  Plus,
  AlertCircle
} from 'lucide-react';
import styles from '../newsletters.module.css';

export default function CreateNewsletterPage() {
  const router = useRouter();
  const { createNewsletter, sendNewsletter, fetchTargetUsers, targetUsers, loading, error } = useNewsletters();

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    content: '',
    htmlContent: '',
    targetAudience: 'ALL_USERS' as 'ALL_USERS' | 'HOSTS_ONLY' | 'PROVIDERS_ONLY' | 'ADMINS_ONLY' | 'SPECIFIC_USERS',
    specificUserIds: [] as string[],
    scheduledAt: '',
  });

  const [showUserSelector, setShowUserSelector] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Charger les utilisateurs si audience spécifique
  useEffect(() => {
    if (formData.targetAudience === 'SPECIFIC_USERS') {
      fetchTargetUsers({ search: userSearch, limit: 50 });
    }
  }, [formData.targetAudience, userSearch, fetchTargetUsers]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUserToggle = (user: any) => {
    const isSelected = selectedUsers.some(u => u.id === user.id);
    if (isSelected) {
      setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
      setFormData(prev => ({
        ...prev,
        specificUserIds: prev.specificUserIds.filter(id => id !== user.id)
      }));
    } else {
      setSelectedUsers(prev => [...prev, user]);
      setFormData(prev => ({
        ...prev,
        specificUserIds: [...prev.specificUserIds, user.id]
      }));
    }
  };

  const handleSave = async (sendImmediately = false) => {
    if (!formData.title.trim() || !formData.subject.trim() || !formData.content.trim()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.targetAudience === 'SPECIFIC_USERS' && formData.specificUserIds.length === 0) {
      alert('Veuillez sélectionner au moins un utilisateur');
      return;
    }

    setSaving(true);
    try {
      const newsletter = await createNewsletter({
        ...formData,
        htmlContent: formData.htmlContent || undefined,
        scheduledAt: formData.scheduledAt || undefined,
      });

      if (newsletter) {
        if (sendImmediately) {
          // Envoyer directement la newsletter
          try {
            const result = await sendNewsletter(newsletter.id, true);
            if (result) {
              alert(`Newsletter envoyée avec succès à ${result.sentCount} destinataires`);
            }
          } catch (sendError) {
            console.error('Erreur lors de l\'envoi:', sendError);
            alert('Newsletter créée mais erreur lors de l\'envoi');
          }
        }
        
        // Rediriger vers la liste des newsletters
        router.push('/super-admin/newsletters');
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    } finally {
      setSaving(false);
    }
  };

  const getAudienceDescription = () => {
    switch (formData.targetAudience) {
      case 'ALL_USERS': return 'Tous les utilisateurs actifs de la plateforme';
      case 'HOSTS_ONLY': return 'Uniquement les organisateurs d\'événements';
      case 'PROVIDERS_ONLY': return 'Uniquement les prestataires de services';
      case 'ADMINS_ONLY': return 'Uniquement les administrateurs';
      case 'SPECIFIC_USERS': return `${selectedUsers.length} utilisateur(s) sélectionné(s)`;
      default: return '';
    }
  };

  return (
    <div className={styles.createPage}>
      {/* Header */}
      <div className={styles.createHeader}>
        <div className={styles.headerLeft}>
          <button 
            className={styles.backButton}
            onClick={() => router.push('/super-admin/newsletters')}
          >
            <ArrowLeft size={20} />
            Retour
          </button>
          <div>
            <h1>Nouvelle Newsletter</h1>
            <p>Créez et envoyez une newsletter à vos utilisateurs</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.previewButton}
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye size={16} />
            {previewMode ? 'Édition' : 'Aperçu'}
          </button>
        </div>
      </div>

      <div className={styles.createContent}>
        {!previewMode ? (
          /* Mode Édition */
          <div className={styles.editMode}>
            <div className={styles.formSection}>
              <h3>Informations générales</h3>
              
              <div className={styles.formGroup}>
                <label>Titre de la newsletter *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: Nouvelles fonctionnalités de Mars 2024"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Sujet de l'email *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Ex: 🚀 Découvrez les nouvelles fonctionnalités Kawepla"
                  required
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <h3>Audience cible</h3>
              
              <div className={styles.audienceSelector}>
                <div className={styles.audienceOptions}>
                  {[
                    { value: 'ALL_USERS', label: 'Tous les utilisateurs', icon: <Users size={16} /> },
                    { value: 'HOSTS_ONLY', label: 'Organisateurs', icon: <Users size={16} /> },
                    { value: 'PROVIDERS_ONLY', label: 'Prestataires', icon: <Users size={16} /> },
                    { value: 'ADMINS_ONLY', label: 'Administrateurs', icon: <Users size={16} /> },
                    { value: 'SPECIFIC_USERS', label: 'Utilisateurs spécifiques', icon: <Users size={16} /> },
                  ].map((option) => (
                    <label key={option.value} className={styles.audienceOption}>
                      <input
                        type="radio"
                        name="targetAudience"
                        value={option.value}
                        checked={formData.targetAudience === option.value}
                        onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                      />
                      <div className={styles.optionContent}>
                        {option.icon}
                        <span>{option.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
                
                <div className={styles.audienceDescription}>
                  <AlertCircle size={16} />
                  <span>{getAudienceDescription()}</span>
                </div>

                {formData.targetAudience === 'SPECIFIC_USERS' && (
                  <div className={styles.userSelector}>
                    <div className={styles.userSelectorHeader}>
                      <div className={styles.searchBar}>
                        <Search size={16} />
                        <input
                          type="text"
                          placeholder="Rechercher des utilisateurs..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                        />
                      </div>
                      <span className={styles.userCount}>
                        {selectedUsers.length} sélectionné(s)
                      </span>
                    </div>

                    {selectedUsers.length > 0 && (
                      <div className={styles.selectedUsers}>
                        <h4>Utilisateurs sélectionnés:</h4>
                        <div className={styles.userTags}>
                          {selectedUsers.map((user) => (
                            <div key={user.id} className={styles.userTag}>
                              <span>{user.firstName} {user.lastName}</span>
                              <button onClick={() => handleUserToggle(user)}>
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={styles.usersList}>
                      {targetUsers.map((user) => (
                        <label key={user.id} className={styles.userItem}>
                          <input
                            type="checkbox"
                            checked={selectedUsers.some(u => u.id === user.id)}
                            onChange={() => handleUserToggle(user)}
                          />
                          <div className={styles.userInfo}>
                            <span className={styles.userName}>
                              {user.firstName} {user.lastName}
                            </span>
                            <span className={styles.userEmail}>{user.email}</span>
                            <span className={styles.userRole}>{user.role}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formSection}>
              <h3>Contenu</h3>
              
              <div className={styles.formGroup}>
                <label>Contenu texte *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Rédigez le contenu de votre newsletter..."
                  rows={8}
                  required
                />
                <small>Ce contenu sera utilisé pour la version texte de l'email</small>
              </div>

              <div className={styles.formGroup}>
                <label>Contenu HTML (optionnel)</label>
                <textarea
                  value={formData.htmlContent}
                  onChange={(e) => handleInputChange('htmlContent', e.target.value)}
                  placeholder="<h1>Titre</h1><p>Contenu HTML de votre newsletter...</p>"
                  rows={12}
                />
                <small>Si vide, le contenu texte sera automatiquement formaté</small>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3>Programmation (optionnel)</h3>
              
              <div className={styles.formGroup}>
                <label>Date et heure d'envoi</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <small>Laissez vide pour envoyer immédiatement</small>
              </div>
            </div>
          </div>
        ) : (
          /* Mode Aperçu */
          <div className={styles.previewMode}>
            <div className={styles.previewHeader}>
              <h3>Aperçu de la newsletter</h3>
              <div className={styles.previewMeta}>
                <span>Sujet: {formData.subject || 'Sujet non défini'}</span>
                <span>Audience: {getAudienceDescription()}</span>
              </div>
            </div>
            
            <div className={styles.previewContent}>
              <div className={styles.emailPreview}>
                <div className={styles.emailHeader}>
                  <h2>📧 Kawepla Newsletter</h2>
                  <p>{formData.title}</p>
                </div>
                
                <div className={styles.emailBody}>
                  <h3>Bonjour 👋</h3>
                  
                  <div className={styles.newsletterContent}>
                    {formData.htmlContent ? (
                      <div dangerouslySetInnerHTML={{ __html: formData.htmlContent }} />
                    ) : (
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {formData.content || 'Contenu non défini'}
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.emailFooter}>
                    <p>Cet email vous a été envoyé par Kawepla</p>
                    <p>La plateforme complète pour organiser vos événements parfaits</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={styles.formActions}>
          <button 
            className={styles.cancelButton}
            onClick={() => router.push('/super-admin/newsletters')}
          >
            Annuler
          </button>
          
          <div className={styles.saveActions}>
            <button 
              className={styles.saveButton}
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              <Save size={16} />
              {saving ? 'Sauvegarde...' : 'Sauvegarder en brouillon'}
            </button>
            
            <button 
              className={styles.sendButton}
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              <Send size={16} />
              {formData.scheduledAt ? 'Programmer l\'envoi' : 'Envoyer maintenant'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
