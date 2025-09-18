'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/Button/Button';

interface AdminGuide {
  id: string;
  title: string;
  description: string;
  category: string;
  steps: string[];
  icon: string;
}

const adminGuides: AdminGuide[] = [
  {
    id: '1',
    title: 'Gestion des utilisateurs',
    description: 'Comment créer, modifier et supprimer des comptes utilisateurs',
    category: 'users',
    icon: '👥',
    steps: [
      'Accédez à la section "Utilisateurs" depuis le menu principal',
      'Cliquez sur "Nouvel utilisateur" pour créer un compte',
      'Remplissez les informations requises (nom, email, mot de passe)',
      'Définissez les permissions et le rôle (Client, Admin, Super Admin)',
      'Sauvegardez et l\'utilisateur recevra un email de confirmation'
    ]
  },
  {
    id: '2',
    title: 'Modération du contenu',
    description: 'Surveiller et modérer les invitations et contenus des utilisateurs',
    category: 'moderation',
    icon: '🛡️',
    steps: [
      'Consultez la liste des invitations récentes dans "Statistiques"',
      'Utilisez les filtres pour identifier le contenu problématique',
      'Cliquez sur une invitation pour la prévisualiser',
      'Archivez ou supprimez le contenu inapproprié si nécessaire',
      'Contactez l\'utilisateur via la messagerie interne'
    ]
  },
  {
    id: '3',
    title: 'Analyse des statistiques',
    description: 'Comprendre et analyser les données de la plateforme',
    category: 'analytics',
    icon: '📊',
    steps: [
      'Accédez au tableau de bord des statistiques',
      'Consultez les métriques clés : utilisateurs actifs, invitations créées, taux de conversion',
      'Utilisez les filtres de date pour analyser les tendances',
      'Exportez les données pour des analyses approfondies',
      'Configurez des alertes pour les événements importants'
    ]
  },
  {
    id: '4',
    title: 'Gestion des designs',
    description: 'Créer et gérer les templates d\'invitation',
    category: 'design',
    icon: '🎨',
    steps: [
      'Accédez à la section "Designs" dans le menu admin',
      'Créez un nouveau template avec l\'éditeur visuel',
      'Définissez les variables personnalisables (couleurs, textes)',
      'Testez le template avec des données d\'exemple',
      'Publiez le design pour le rendre disponible aux utilisateurs'
    ]
  },
  {
    id: '5',
    title: 'Configuration système',
    description: 'Paramétrer les réglages globaux de la plateforme',
    category: 'system',
    icon: '⚙️',
    steps: [
      'Accédez aux paramètres système via "Configuration"',
      'Configurez les paramètres email (SMTP, templates)',
      'Définissez les limites utilisateur (nombre d\'invitations, invités)',
      'Gérez les paramètres de sécurité et de confidentialité',
      'Sauvegardez et testez les modifications'
    ]
  },
  {
    id: '6',
    title: 'Gestion des alertes',
    description: 'Surveiller les alertes système et les incidents',
    category: 'alerts',
    icon: '🚨',
    steps: [
      'Consultez la section "Alertes" pour voir les notifications',
      'Triez par priorité : critique, élevée, moyenne, faible',
      'Cliquez sur une alerte pour voir les détails',
      'Prenez les actions nécessaires (redémarrage, correction)',
      'Marquez l\'alerte comme résolue une fois traitée'
    ]
  }
];

const categories = {
  users: { name: 'Utilisateurs', icon: '👥', color: 'bg-blue-100 text-blue-800' },
  moderation: { name: 'Modération', icon: '🛡️', color: 'bg-red-100 text-red-800' },
  analytics: { name: 'Statistiques', icon: '📊', color: 'bg-green-100 text-green-800' },
  design: { name: 'Designs', icon: '🎨', color: 'bg-purple-100 text-purple-800' },
  system: { name: 'Système', icon: '⚙️', color: 'bg-yellow-100 text-yellow-800' },
  alerts: { name: 'Alertes', icon: '🚨', color: 'bg-orange-100 text-orange-800' }
};

export default function SuperAdminHelpPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openGuide, setOpenGuide] = useState<string | null>(null);

  const filteredGuides = selectedCategory === 'all' 
    ? adminGuides 
    : adminGuides.filter(guide => guide.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <style jsx>{`
        .admin-header {
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          color: white;
          padding: 3rem 2rem;
          border-radius: 1rem;
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .category-button {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          border: 2px solid transparent;
          background: white;
          color: #374151;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }
        
        .category-button:hover {
          border-color: #374151;
          transform: translateY(-2px);
        }
        
        .category-button.active {
          background: #374151;
          color: white;
          border-color: #374151;
        }
        
        .guide-card {
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          margin-bottom: 1.5rem;
          overflow: hidden;
          transition: all 0.3s ease;
          background: white;
        }
        
        .guide-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        
        .guide-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .guide-content {
          padding: 2rem;
          background: #fafafa;
        }
        
        .step-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 0.5rem;
          border-left: 4px solid #374151;
        }
        
        .step-number {
          width: 2rem;
          height: 2rem;
          background: #374151;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
          font-size: 0.875rem;
        }
        
        .warning-box {
          background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
          border: 1px solid #f59e0b;
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 1.5rem 0;
        }
        
        .tip-box {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border: 1px solid #3b82f6;
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 1.5rem 0;
        }
        
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .action-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .action-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
      `}</style>

      <div className="admin-header">
        <h1 className="text-4xl font-sans mb-4">🔧 Guide d'administration</h1>
        <p className="text-xl opacity-90">
          Documentation complète pour les super-administrateurs
        </p>
      </div>

      {/* Actions rapides */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">⚡ Actions rapides</h2>
        <div className="quick-actions">
          <div className="action-card">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="font-semibold mb-2">Gestion utilisateurs</h3>
            <p className="text-sm text-gray-600 mb-3">Créer, modifier, désactiver des comptes</p>
            <Button variant="outline">Accéder</Button>
          </div>
          <div className="action-card">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold mb-2">Statistiques</h3>
            <p className="text-sm text-gray-600 mb-3">Voir les métriques de la plateforme</p>
            <Button variant="outline" >Voir les stats</Button>
          </div>
          <div className="action-card">
            <div className="text-3xl mb-2">🚨</div>
            <h3 className="font-semibold mb-2">Alertes système</h3>
            <p className="text-sm text-gray-600 mb-3">Surveiller les incidents</p>
            <Button variant="outline" >Voir les alertes</Button>
          </div>
          <div className="action-card">
            <div className="text-3xl mb-2">⚙️</div>
            <h3 className="font-semibold mb-2">Configuration</h3>
            <p className="text-sm text-gray-600 mb-3">Paramètres globaux</p>
            <Button variant="outline" >Configurer</Button>
          </div>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">📚 Guides détaillés</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`category-button ${selectedCategory === 'all' ? 'active' : ''}`}
          >
            <span>📖</span>
            Tous les guides
          </button>
          {Object.entries(categories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`category-button ${selectedCategory === key ? 'active' : ''}`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des guides */}
      <div className="space-y-4">
        {filteredGuides.map((guide) => (
          <div key={guide.id} className="guide-card">
            <div 
              className="guide-header"
              onClick={() => setOpenGuide(openGuide === guide.id ? null : guide.id)}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{guide.icon}</div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{guide.title}</h3>
                  <p className="text-gray-600 text-sm">{guide.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${categories[guide.category as keyof typeof categories].color}`}>
                  {categories[guide.category as keyof typeof categories].name}
                </span>
              </div>
              <span className="text-2xl text-gray-400">
                {openGuide === guide.id ? '−' : '+'}
              </span>
            </div>
            {openGuide === guide.id && (
              <div className="guide-content">
                <h4 className="font-semibold mb-4 text-gray-800">Étapes à suivre :</h4>
                <ol className="step-list">
                  {guide.steps.map((step, index) => (
                    <li key={index} className="step-item">
                      <div className="step-number">{index + 1}</div>
                      <p className="text-gray-700">{step}</p>
                    </li>
                  ))}
                </ol>
                
                {guide.category === 'system' && (
                  <div className="warning-box">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">⚠️</span>
                      <strong className="text-amber-800">Attention</strong>
                    </div>
                    <p className="text-amber-700 text-sm">
                      Les modifications système peuvent affecter tous les utilisateurs. 
                      Testez toujours en environnement de développement avant la production.
                    </p>
                  </div>
                )}
                
                {guide.category === 'moderation' && (
                  <div className="tip-box">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">💡</span>
                      <strong className="text-blue-800">Conseil</strong>
                    </div>
                    <p className="text-blue-700 text-sm">
                      Documentez toujours vos actions de modération et communiquez 
                      clairement avec les utilisateurs concernés.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Section sécurité */}
      <div className="mt-12 p-8 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">🔒 Sécurité et bonnes pratiques</h3>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="font-semibold mb-2 text-red-800">À faire :</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✅ Utilisez des mots de passe forts</li>
                <li>✅ Activez l'authentification à deux facteurs</li>
                <li>✅ Surveillez les logs d'activité</li>
                <li>✅ Effectuez des sauvegardes régulières</li>
                <li>✅ Documentez vos actions importantes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-red-800">À éviter :</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>❌ Partager vos identifiants admin</li>
                <li>❌ Modifier la production sans tests</li>
                <li>❌ Supprimer des données sans confirmation</li>
                <li>❌ Ignorer les alertes de sécurité</li>
                <li>❌ Laisser des sessions ouvertes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 