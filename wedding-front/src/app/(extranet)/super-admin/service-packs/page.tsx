'use client';

import { useEffect, useMemo, useState } from 'react';
import { HeaderMobile } from '@/components/HeaderMobile';
import { servicePackApi, ServicePackPayload, ServicePackResponse, ServicePackType, ServiceTier } from '@/lib/api/servicePacks';
import styles from './service-packs.module.css';
import { Plus, Pencil, Trash2, RefreshCw, Package, Layers, Sparkles } from 'lucide-react';

const tiers: ServiceTier[] = ['FREE', 'ESSENTIAL', 'ELEGANT', 'PREMIUM', 'LUXE'];
const addonUnits = [
  { value: 'GUEST', label: 'Invités' },
  { value: 'PHOTO', label: 'Photos' },
  { value: 'DESIGN', label: 'Designs' },
  { value: 'AI_REQUEST', label: 'Requêtes IA' }
];

const defaultPayload: ServicePackPayload = {
  slug: '',
  name: '',
  description: '',
  type: 'BASE',
  tier: 'FREE',
  price: 0,
  currency: 'EUR',
  features: [],
  invitations: 0,
  guests: 0,
  photos: 0,
  designs: 0,
  aiRequests: 0,
  quantity: null,
  unit: null,
  isHighlighted: false,
  isActive: true,
  sortOrder: 0
};

export default function ServicePacksAdminPage() {
  const [basePacks, setBasePacks] = useState<ServicePackResponse[]>([]);
  const [addonPacks, setAddonPacks] = useState<ServicePackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServicePackPayload>(defaultPayload);
  const [editingPack, setEditingPack] = useState<ServicePackResponse | null>(null);
  const [formType, setFormType] = useState<ServicePackType>('BASE');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      setLoading(true);
      const [bases, addons] = await Promise.all([
        servicePackApi.list('BASE'),
        servicePackApi.list('ADDON')
      ]);
      setBasePacks(bases);
      setAddonPacks(addons);
    } catch (err) {
      console.error('Erreur chargement packs:', err);
      setError('Impossible de charger les packs.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (type: ServicePackType) => {
    setEditingPack(null);
    setFormType(type);
    setFormData({
      ...defaultPayload,
      type,
      tier: type === 'BASE' ? 'FREE' : null,
      price: type === 'BASE' ? 0 : 10,
    });
  };

  const handleEdit = (pack: ServicePackResponse) => {
    setEditingPack(pack);
    setFormType(pack.type);
    setFormData({
      slug: pack.slug,
      name: pack.name,
      description: pack.description || '',
      type: pack.type,
      tier: pack.tier || null,
      price: pack.price,
      currency: pack.currency || 'EUR',
      features: pack.features || [],
      invitations: pack.invitations ?? null,
      guests: pack.guests ?? null,
      photos: pack.photos ?? null,
      designs: pack.designs ?? null,
      aiRequests: pack.aiRequests ?? null,
      quantity: pack.quantity ?? null,
      unit: pack.unit ?? null,
      isHighlighted: pack.isHighlighted ?? false,
      isActive: pack.isActive ?? true,
      sortOrder: pack.sortOrder ?? 0
    });
  };

  const handleChange = (field: keyof ServicePackPayload, value: any) => {
    if (field === 'features' && typeof value === 'string') {
      setFormData(prev => ({
        ...prev,
        features: value.split('\n').map(item => item.trim()).filter(Boolean)
      }));
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingPack) {
        await servicePackApi.update(editingPack.id, formData);
      } else {
        await servicePackApi.create(formData);
      }
      await loadPacks();
      resetForm(formType);
    } catch (err) {
      console.error('Erreur sauvegarde pack:', err);
      alert('Impossible de sauvegarder le pack. Vérifiez les champs obligatoires.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (pack: ServicePackResponse) => {
    if (!confirm(`Supprimer le pack "${pack.name}" ?`)) return;
    try {
      await servicePackApi.remove(pack.id);
      await loadPacks();
    } catch (err) {
      console.error('Erreur suppression pack:', err);
      alert('Suppression impossible.');
    }
  };

  const featureTextareaValue = useMemo(() => (formData.features || []).join('\n'), [formData.features]);

  return (
    <div className={styles.page}>
      <HeaderMobile title="Gestion des packs" />
      
      <div className={styles.pageHeader}>
        <div>
          <h1>Packs & Tarifs</h1>
          <p>Créez, modifiez ou désactivez les packs visibles côté client.</p>
        </div>
        <button className={styles.refreshBtn} onClick={loadPacks} disabled={loading}>
          <RefreshCw size={18} />
          Actualiser
        </button>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.grid}>
        <section className={styles.listSection}>
          <div className={styles.sectionHeader}>
            <h2><Package size={20} /> Packs principaux</h2>
            <button className={styles.primaryBtn} onClick={() => resetForm('BASE')}>
              <Plus size={16} /> Nouveau pack
            </button>
          </div>
          {loading ? (
            <p className={styles.placeholder}>Chargement...</p>
          ) : (
            <div className={styles.cardList}>
              {basePacks.map(pack => (
                <article key={pack.id} className={styles.packCard}>
                  <div>
                    <p className={styles.packName}>{pack.name}</p>
                    <p className={styles.packMeta}>
                      {pack.price.toLocaleString('fr-FR', { style: 'currency', currency: pack.currency || 'EUR' })} · {pack.tier || 'Sans tier'}
                    </p>
                    <p className={styles.packDescription}>{pack.description}</p>
                  </div>
                  <div className={styles.cardActions}>
                    <button onClick={() => handleEdit(pack)}><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(pack)}><Trash2 size={16} /></button>
                  </div>
                </article>
              ))}
              {basePacks.length === 0 && (
                <p className={styles.placeholder}>Aucun pack disponible.</p>
              )}
            </div>
          )}

          <div className={styles.sectionHeader}>
            <h2><Layers size={20} /> Packs additionnels</h2>
            <button className={styles.secondaryBtn} onClick={() => resetForm('ADDON')}>
              <Plus size={16} /> Nouvel add-on
            </button>
          </div>

          {loading ? (
            <p className={styles.placeholder}>Chargement...</p>
          ) : (
            <div className={styles.cardList}>
              {addonPacks.map(pack => (
                <article key={pack.id} className={styles.packCard}>
                  <div>
                    <p className={styles.packName}>{pack.name}</p>
                    <p className={styles.packMeta}>
                      {pack.price.toLocaleString('fr-FR', { style: 'currency', currency: pack.currency || 'EUR' })} · {pack.quantity ?? 0} {pack.unit?.toLowerCase()}
                    </p>
                    <p className={styles.packDescription}>{pack.description}</p>
                  </div>
                  <div className={styles.cardActions}>
                    <button onClick={() => handleEdit(pack)}><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(pack)}><Trash2 size={16} /></button>
                  </div>
                </article>
              ))}
              {addonPacks.length === 0 && (
                <p className={styles.placeholder}>Aucun add-on disponible.</p>
              )}
            </div>
          )}
        </section>

        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h2><Sparkles size={20} /> {editingPack ? 'Modifier le pack' : 'Nouveau pack'}</h2>
          </div>

          <form className={styles.packForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                required
                placeholder="ex: elegant"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Nom</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={2}
              />
            </div>

            {formType === 'BASE' && (
              <div className={styles.formGroup}>
                <label>Tier</label>
                <select
                  value={formData.tier || 'FREE'}
                  onChange={(e) => handleChange('tier', e.target.value as ServiceTier)}
                >
                  {tiers.map(tier => (
                    <option key={tier} value={tier}>{tier}</option>
                  ))}
                </select>
              </div>
            )}

            {formType === 'ADDON' && (
              <div className={styles.formGroup}>
                <label>Unité</label>
                <select
                  value={formData.unit || 'GUEST'}
                  onChange={(e) => handleChange('unit', e.target.value)}
                >
                  {addonUnits.map(unit => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className={styles.formGroupRow}>
              <div>
                <label>Prix (€)</label>
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                  required
                />
              </div>
              <div>
                <label>Devise</label>
                <input
                  type="text"
                  value={formData.currency || 'EUR'}
                  onChange={(e) => handleChange('currency', e.target.value.toUpperCase())}
                />
              </div>
            </div>

            {formType === 'ADDON' && (
              <div className={styles.formGroup}>
                <label>Quantité</label>
                <input
                  type="number"
                  min={1}
                  value={formData.quantity ?? 0}
                  onChange={(e) => handleChange('quantity', parseInt(e.target.value, 10))}
                />
              </div>
            )}

            {formType === 'BASE' && (
              <div className={styles.formGroupGrid}>
                <div>
                  <label>Invitations</label>
                  <input type="number" min={0} value={formData.invitations ?? 0} onChange={(e) => handleChange('invitations', parseInt(e.target.value, 10))} />
                </div>
                <div>
                  <label>Invités</label>
                  <input type="number" min={0} value={formData.guests ?? 0} onChange={(e) => handleChange('guests', parseInt(e.target.value, 10))} />
                </div>
                <div>
                  <label>Photos</label>
                  <input type="number" min={0} value={formData.photos ?? 0} onChange={(e) => handleChange('photos', parseInt(e.target.value, 10))} />
                </div>
                <div>
                  <label>Designs</label>
                  <input type="number" min={0} value={formData.designs ?? 0} onChange={(e) => handleChange('designs', parseInt(e.target.value, 10))} />
                </div>
                <div>
                  <label>Requêtes IA</label>
                  <input type="number" min={0} value={formData.aiRequests ?? 0} onChange={(e) => handleChange('aiRequests', parseInt(e.target.value, 10))} />
                </div>
              </div>
            )}

            <div className={styles.formGroup}>
              <label>Features (une par ligne)</label>
              <textarea
                rows={4}
                value={featureTextareaValue}
                onChange={(e) => handleChange('features', e.target.value)}
              />
            </div>

            <div className={styles.formGroupRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isHighlighted}
                  onChange={(e) => handleChange('isHighlighted', e.target.checked)}
                />
                Mettre en avant
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                />
                Actif
              </label>
            </div>

            <div className={styles.formGroup}>
              <label>Ordre d'affichage</label>
              <input
                type="number"
                value={formData.sortOrder ?? 0}
                onChange={(e) => handleChange('sortOrder', parseInt(e.target.value, 10))}
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Enregistrement...' : editingPack ? 'Mettre à jour' : 'Créer le pack'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

