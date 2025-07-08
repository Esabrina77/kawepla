'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'Comment créer ma première invitation ?',
    answer: 'Rendez-vous dans la section "Invitations" depuis votre tableau de bord. Cliquez sur "Nouvelle invitation", remplissez les informations de votre mariage (date, lieu, etc.) et choisissez un design. Vous pourrez ensuite personnaliser le texte et les couleurs.',
    category: 'invitations'
  },
  {
    id: '2',
    question: 'Comment ajouter des invités ?',
    answer: 'Dans la section "Invités", vous pouvez ajouter vos invités un par un via le formulaire, ou importer une liste complète via un fichier CSV, JSON ou TXT. Chaque invité recevra un lien unique et sécurisé.',
    category: 'invites'
  },
  {
    id: '3',
    question: 'Comment envoyer les invitations ?',
    answer: 'Une fois votre invitation créée et publiée, allez dans "Invités" et cliquez sur "Envoyer l\'invitation" pour chaque invité, ou utilisez "Envoyer toutes les invitations" pour un envoi groupé. Les invités recevront un email avec leur lien personnalisé.',
    category: 'invites'
  },
  {
    id: '4',
    question: 'Comment suivre les réponses RSVP ?',
    answer: 'Le tableau de bord vous donne un aperçu en temps réel des réponses. Dans la section "Invités", vous pouvez voir qui a répondu, qui viendra, et lire les messages personnalisés. Des statistiques détaillées sont également disponibles.',
    category: 'rsvp'
  },
  {
    id: '5',
    question: 'Puis-je modifier mon invitation après l\'avoir envoyée ?',
    answer: 'Oui, vous pouvez modifier votre invitation à tout moment. Les changements seront visibles immédiatement pour tous vos invités via leur lien personnel.',
    category: 'invitations'
  },
  {
    id: '6',
    question: 'Comment gérer mon budget ?',
    answer: 'La section "Budget" vous permet de planifier et suivre vos dépenses par catégorie (traiteur, décoration, etc.). Vous pouvez définir des budgets prévisionnels et enregistrer vos dépenses réelles.',
    category: 'budget'
  },
  {
    id: '7',
    question: 'Comment importer une liste d\'invités ?',
    answer: 'Utilisez la fonction "Import en masse" dans la section Invités. Téléchargez d\'abord un template, remplissez-le avec vos données (nom, email, téléphone), puis importez le fichier. Le système vérifiera automatiquement les données.',
    category: 'invites'
  },
  {
    id: '8',
    question: 'Que faire si un invité n\'a pas reçu son invitation ?',
    answer: 'Vérifiez d\'abord que l\'email est correct dans votre liste d\'invités. Vous pouvez renvoyer l\'invitation individuellement ou envoyer un rappel. L\'invitation peut aussi être dans les spams.',
    category: 'invites'
  }
];

const categories = {
  invitations: { name: 'Invitations', icon: '💌', color: 'bg-blue-100 text-blue-800' },
  invites: { name: 'Gestion des invités', icon: '👥', color: 'bg-green-100 text-green-800' },
  rsvp: { name: 'Réponses RSVP', icon: '✅', color: 'bg-purple-100 text-purple-800' },
  budget: { name: 'Budget', icon: '💰', color: 'bg-yellow-100 text-yellow-800' }
};

export default function ClientHelpPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <style jsx>{`
        .help-header {
          background: linear-gradient(135deg, #C5A880 0%, #B39670 100%);
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
          border-color: #C5A880;
          transform: translateY(-2px);
        }
        
        .category-button.active {
          background: #C5A880;
          color: white;
          border-color: #C5A880;
        }
        
        .faq-item {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .faq-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .faq-question {
          padding: 1.5rem;
          background: white;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background-color 0.3s ease;
        }
        
        .faq-question:hover {
          background: #f9fafb;
        }
        
        .faq-answer {
          padding: 1.5rem;
          background: #f8f9fa;
          border-top: 1px solid #e5e7eb;
          line-height: 1.6;
        }
        
        .guide-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          padding: 2rem;
          border-radius: 1rem;
          margin-bottom: 2rem;
          border: 1px solid #e5e7eb;
        }
        
        .step {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: white;
          border-radius: 0.5rem;
          border-left: 4px solid #C5A880;
        }
        
        .step-number {
          width: 2rem;
          height: 2rem;
          background: #C5A880;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }
      `}</style>

      <div className="help-header">
        <h1 className="text-4xl font-serif mb-4">🎯 Centre d'aide</h1>
        <p className="text-xl opacity-90">
          Tout ce que vous devez savoir pour organiser votre mariage parfait
        </p>
      </div>

      {/* Guide de démarrage rapide */}
      <div className="guide-section">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">🚀 Guide de démarrage rapide</h2>
        
        <div className="step">
          <div className="step-number">1</div>
          <div>
            <h3 className="font-semibold mb-2">Créez votre invitation</h3>
            <p className="text-gray-600">Allez dans "Invitations" → "Nouvelle invitation" et remplissez les détails de votre mariage.</p>
          </div>
        </div>
        
        <div className="step">
          <div className="step-number">2</div>
          <div>
            <h3 className="font-semibold mb-2">Ajoutez vos invités</h3>
            <p className="text-gray-600">Dans "Invités", ajoutez manuellement ou importez votre liste d'invités via un fichier.</p>
          </div>
        </div>
        
        <div className="step">
          <div className="step-number">3</div>
          <div>
            <h3 className="font-semibold mb-2">Personnalisez le design</h3>
            <p className="text-gray-600">Choisissez un design et personnalisez les couleurs et le texte selon vos goûts.</p>
          </div>
        </div>
        
        <div className="step">
          <div className="step-number">4</div>
          <div>
            <h3 className="font-semibold mb-2">Publiez et envoyez</h3>
            <p className="text-gray-600">Publiez votre invitation et envoyez-la à tous vos invités d'un clic.</p>
          </div>
        </div>
        
        <div className="step">
          <div className="step-number">5</div>
          <div>
            <h3 className="font-semibold mb-2">Suivez les réponses</h3>
            <p className="text-gray-600">Consultez le tableau de bord pour voir qui a répondu et planifiez en conséquence.</p>
          </div>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">❓ Questions fréquentes</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`category-button ${selectedCategory === 'all' ? 'active' : ''}`}
          >
            <span>📚</span>
            Toutes les questions
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

      {/* Liste des FAQ */}
      <div className="space-y-4">
        {filteredFAQs.map((faq) => (
          <div key={faq.id} className="faq-item">
            <div 
              className="faq-question"
              onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
            >
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${categories[faq.category as keyof typeof categories].color}`}>
                  {categories[faq.category as keyof typeof categories].icon}
                </span>
                <span className="font-semibold text-gray-800">{faq.question}</span>
              </div>
              <span className="text-2xl text-gray-400">
                {openFAQ === faq.id ? '−' : '+'}
              </span>
            </div>
            {openFAQ === faq.id && (
              <div className="faq-answer">
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Section contact */}
      <div className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">🤝 Besoin d'aide supplémentaire ?</h3>
          <p className="text-gray-600 mb-6">
            Notre équipe est là pour vous accompagner dans l'organisation de votre mariage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary">
              📧 Contacter le support
            </Button>
            <Button variant="outline">
              📖 Consulter la documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 