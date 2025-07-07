'use client';

import { useState } from 'react';
import { Card } from '@/components/Card/Card';
import styles from './planning.module.css';

type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'completed';
  category: string;
};

export default function PlanningPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'Cérémonie',
    'Réception',
    'Décoration',
    'Traiteur',
    'Musique',
    'Photos',
    'Tenues',
    'Transport',
    'Autres'
  ];

  return (
    <div className={styles.planningPage}>
      <div className={styles.header}>
        <h1>Planning du mariage</h1>
        <button className={styles.addButton}>
          Ajouter une tâche
        </button>
      </div>

      <div className={styles.timeline}>
        <div className={styles.timelineHeader}>
          <h2>Chronologie</h2>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.categoryFilter}
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className={styles.timelineContent}>
          {tasks.length === 0 ? (
            <Card className={styles.emptyState}>
              <p>Aucune tâche planifiée</p>
              <button className={styles.addButton}>
                Commencer la planification
              </button>
            </Card>
          ) : (
            <div className={styles.taskList}>
              {tasks.map(task => (
                <Card key={task.id} className={styles.taskCard}>
                  <div className={styles.taskHeader}>
                    <h3>{task.title}</h3>
                    <span className={styles.taskCategory}>{task.category}</span>
                  </div>
                  <p className={styles.taskDescription}>{task.description}</p>
                  <div className={styles.taskFooter}>
                    <span className={styles.taskDate}>
                      {task.dueDate.toLocaleDateString()}
                    </span>
                    <div className={styles.taskActions}>
                      <button 
                        className={`${styles.statusButton} ${
                          task.status === 'completed' ? styles.completed : ''
                        }`}
                      >
                        {task.status === 'completed' ? '✓' : '○'}
                      </button>
                      <button className={styles.editButton}>Modifier</button>
                      <button className={styles.deleteButton}>Supprimer</button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.progress}>
        <h2>Progression</h2>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ 
              width: `${tasks.length > 0 
                ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 
                : 0}%` 
            }}
          />
        </div>
        <div className={styles.progressStats}>
          <span>{tasks.filter(t => t.status === 'completed').length} tâches terminées</span>
          <span>{tasks.filter(t => t.status === 'pending').length} tâches en cours</span>
        </div>
      </div>
    </div>
  );
} 