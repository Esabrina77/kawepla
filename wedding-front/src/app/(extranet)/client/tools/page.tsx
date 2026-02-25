'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { HeaderMobile } from '@/components/HeaderMobile/HeaderMobile';
import {
  DollarSign,
  Calendar,
  Settings,
  MessageSquare,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import styles from './tools.module.css';

const tools = [
  {
    id: 'planning',
    title: 'Planning & Tâches',
    description: 'Organisez votre calendrier, gérez vos tâches et suivez l\'avancement de votre événement',
    icon: Calendar,
    path: '/client/tools/planning',
    color: '#f59e0b',
    comingSoon: false
  },
  {
    id: 'budget',
    title: 'Budget',
    description: 'Suivez vos dépenses et gérez le budget de votre événement',
    icon: DollarSign,
    path: '/client/tools/budget',
    color: '#10b981',
    comingSoon: false
  },
  {
    id: 'settings',
    title: 'Paramètres',
    description: 'Configurez les paramètres de votre compte et de vos événements',
    icon: Settings,
    path: '/client/tools/settings',
    color: '#6b7280',
    comingSoon: false
  },
  {
    id: 'support',
    title: 'Support client',
    description: 'Contactez notre équipe pour toute question ou assistance',
    icon: MessageSquare,
    path: '/client/tools/support-cient',
    color: '#8b5cf6',
    comingSoon: false
  }
];

export default function ToolsPage() {
  const { user } = useAuth();

  return (
    <div className={styles.toolsPage}>
      <HeaderMobile title={`Bonjour ${user?.firstName || 'Utilisateur'}`} />

      <div className={styles.pageContent}>
        {/* Page Title */}
        <h1 className={styles.pageTitle}>Outils</h1>

        {/* Section Outils */}
        <section className={styles.toolsSection}>
          <h2 className={styles.sectionTitle}>Outils disponibles</h2>
          <div className={styles.actionsGrid}>
            {tools.map((tool) => {
              const Icon = tool.icon;
              const ToolCard = tool.comingSoon ? 'div' : Link;

              return (
                <ToolCard
                  key={tool.id}
                  href={tool.path}
                  className={`${styles.actionCard} ${tool.comingSoon ? styles.comingSoon : ''}`}
                >
                  <div className={styles.actionLeft}>
                    <div className={styles.actionIconWrapper} style={{ backgroundColor: `${tool.color}15` }}>
                      <Icon size={24} style={{ color: tool.color }} />
                    </div>
                    <div className={styles.actionContent}>
                      <div className={styles.actionTitle}>
                        {tool.title}
                        {tool.comingSoon && (
                          <span className={styles.comingSoonBadge}>
                            <Sparkles size={12} />
                            Bientôt
                          </span>
                        )}
                      </div>
                      <div className={styles.actionDescription}>{tool.description}</div>
                    </div>
                  </div>
                  {!tool.comingSoon && (
                    <div className={styles.actionArrow}>
                      <ChevronDown size={20} style={{ transform: 'rotate(-90deg)' }} />
                    </div>
                  )}
                </ToolCard>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

