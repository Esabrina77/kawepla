'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import styles from './planning.module.css';
import { 
  Calendar, 
  CheckCircle, 
  Circle, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  AlertTriangle,
  Filter,
  Search,
  CalendarDays,
  Target,
  Users,
  Music,
  Camera,
  Car,
  Utensils,
  Flower,
  Heart,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Calendar as CalendarIcon,
  List,
  Grid3X3
} from 'lucide-react';

type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'overdue';
  category: string;
  priority: 'low' | 'medium' | 'high';
  completedAt?: Date;
};

type Category = {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
};

type ViewMode = 'calendar' | 'list' | 'kanban';

export default function PlanningPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const categories: Category[] = [
    { id: 'ceremony', name: 'cérémonie', icon: <Heart size={16} />, color: '#ef4444' },
    { id: 'reception', name: 'réception', icon: <Users size={16} />, color: '#3b82f6' },
    { id: 'decoration', name: 'Décoration', icon: <Flower size={16} />, color: '#10b981' },
    { id: 'catering', name: 'Traiteur', icon: <Utensils size={16} />, color: '#f59e0b' },
    { id: 'music', name: 'Musique', icon: <Music size={16} />, color: '#8b5cf6' },
    { id: 'photos', name: 'Photos', icon: <Camera size={16} />, color: '#06b6d4' },
    { id: 'outfits', name: 'Tenues', icon: <Target size={16} />, color: '#ec4899' },
    { id: 'transport', name: 'Transport', icon: <Car size={16} />, color: '#84cc16' },
    { id: 'other', name: 'Autres', icon: <Circle size={16} />, color: '#6b7280' }
  ];

  // Tâches prédéfinies
  const predefinedTasks: Omit<Task, 'id'>[] = [
    {
      title: 'Fixer la date du événement',
      description: 'Choisir une date qui convient aux deux familles',
      dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'pending',
      category: 'ceremony',
      priority: 'high'
    },
    {
      title: 'Établir le budget',
      description: 'Définir le budget total et le répartir',
      dueDate: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000),
      status: 'pending',
      category: 'other',
      priority: 'high'
    },
    {
      title: 'Réserver les lieux',
      description: 'cérémonie civile, religieuse et réception',
      dueDate: new Date(Date.now() + 340 * 24 * 60 * 60 * 1000),
      status: 'pending',
      category: 'ceremony',
      priority: 'high'
    },
    {
      title: 'Choisir le photographe',
      description: 'Rencontrer plusieurs photographes',
      dueDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
      status: 'pending',
      category: 'photos',
      priority: 'high'
    },
    {
      title: 'Sélectionner le traiteur',
      description: 'Dégustations et devis pour le repas',
      dueDate: new Date(Date.now() + 290 * 24 * 60 * 60 * 1000),
      status: 'pending',
      category: 'catering',
      priority: 'high'
    },
    {
      title: 'Commander les alliances',
      description: 'Choisir et commander les alliances',
      dueDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000),
      status: 'pending',
      category: 'other',
      priority: 'medium'
    },
    {
      title: 'Réserver la musique',
      description: 'DJ, orchestre ou groupe pour la réception',
      dueDate: new Date(Date.now() + 230 * 24 * 60 * 60 * 1000),
      status: 'pending',
      category: 'music',
      priority: 'medium'
    },
    {
      title: 'Choisir les tenues',
      description: 'Robe de organisateure, costume du organisateur',
      dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      status: 'pending',
      category: 'outfits',
      priority: 'high'
    },
    {
      title: 'Organiser le transport',
      description: 'Voiture de événement et transport des invités',
      dueDate: new Date(Date.now() + 170 * 24 * 60 * 60 * 1000),
      status: 'pending',
      category: 'transport',
      priority: 'medium'
    },
    {
      title: 'Finaliser la décoration',
      description: 'Fleurs, décoration de table et accessoires',
      dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      status: 'pending',
      category: 'decoration',
      priority: 'medium'
    },
    {
      title: 'Préparer la liste d\'invités',
      description: 'Finaliser la liste et envoyer les save-the-date',
      dueDate: new Date(Date.now() + 110 * 24 * 60 * 60 * 1000),
      status: 'pending',
      category: 'reception',
      priority: 'high'
    },
    {
      title: 'Planifier la lune de miel',
      description: 'Réserver les billets et l\'hébergement',
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: 'pending',
      category: 'other',
      priority: 'low'
    },
    {
      title: 'Organiser la répétition',
      description: 'Répétition générale avec les témoins',
      dueDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
      status: 'pending',
      category: 'ceremony',
      priority: 'medium'
    },
    {
      title: 'Confirmer tous les prestataires',
      description: 'Appels de confirmation et derniers détails',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'pending',
      category: 'other',
      priority: 'high'
    },
    {
      title: 'Préparer les discours',
      description: 'Discours des témoins et des parents',
      dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      status: 'pending',
      category: 'reception',
      priority: 'low'
    }
  ];

  // Initialiser les tâches
  useEffect(() => {
    if (tasks.length === 0) {
      const initialTasks = predefinedTasks.map((task, index) => ({
        ...task,
        id: `task-${index + 1}`
      }));
      setTasks(initialTasks);
    }
  }, []);

  // Mettre à jour le statut des tâches en retard
  useEffect(() => {
    const now = new Date();
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.status === 'pending' && task.dueDate < now) {
          return { ...task, status: 'overdue' as const };
        }
        return task;
      })
    );
  }, []);

  // Fonctions utilitaires
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getCategoryIcon = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.icon || <Circle size={12} />;
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.color || '#6b7280';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Actions
  const toggleTaskStatus = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const newStatus = task.status === 'completed' ? 'pending' : 'completed';
          return {
            ...task,
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date() : undefined
          };
        }
        return task;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Statistiques
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length;
  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  if (!user) {
    return (
      <div className={styles.planningPage}>
        <div className={styles.loading}>Chargement...</div>
      </div>
    );
  }

  return (
    <div className={styles.planningPage}>
      <div className={styles.header}>
        <div className={styles.badge}>
          <Calendar size={16} />
          Planning
        </div>
        <h1 className={styles.title}>
          Organisez votre <span className={styles.titleAccent}>événement</span>
        </h1>
        <p className={styles.subtitle}>
          Planifiez chaque étape de votre événement avec notre calendrier intelligent et nos tâches prédéfinies
        </p>
        
        <div className={styles.headerActions}>
          <div className={styles.viewModeToggle}>
            <button 
              className={`${styles.viewModeButton} ${viewMode === 'calendar' ? styles.active : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon size={16} />
              Calendrier
            </button>
            <button 
              className={`${styles.viewModeButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
              Liste
            </button>
            <button 
              className={`${styles.viewModeButton} ${viewMode === 'kanban' ? styles.active : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              <Grid3X3 size={16} />
              Kanban
            </button>
          </div>
          <button 
            className={styles.addButton}
            onClick={() => setShowAddTask(true)}
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <CheckCircle size={20} />
          </div>
          <div className={styles.statContent}>
            <h3>{completedTasks}</h3>
            <p>Terminées</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Clock size={20} />
          </div>
          <div className={styles.statContent}>
            <h3>{pendingTasks}</h3>
            <p>En cours</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <AlertTriangle size={20} />
          </div>
          <div className={styles.statContent}>
            <h3>{overdueTasks}</h3>
            <p>En retard</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Target size={20} />
          </div>
          <div className={styles.statContent}>
            <h3>{Math.round(progressPercentage)}%</h3>
            <p>Progression</p>
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className={styles.progressSection}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className={styles.progressText}>
          {completedTasks} sur {tasks.length} tâches terminées
        </p>
      </div>

      {/* Filtres */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Rechercher une tâche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.categoryFilter}>
          <Filter size={16} />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.categorySelect}
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenu principal selon le mode de vue */}
      {viewMode === 'calendar' && (
        <div className={styles.calendarView}>
          <div className={styles.calendarHeader}>
            <button onClick={() => navigateMonth('prev')} className={styles.navButton}>
              <ChevronLeft size={20} />
            </button>
            <h2>
              {currentDate.toLocaleDateString('fr-FR', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            <button onClick={() => navigateMonth('next')} className={styles.navButton}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className={styles.calendar}>
            <div className={styles.calendarDays}>
              {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                <div key={day} className={styles.calendarDayHeader}>
                  {day}
                </div>
              ))}
            </div>

            <div className={styles.calendarGrid}>
              {Array.from({ length: getFirstDayOfMonth(currentDate) }, (_, i) => (
                <div key={`empty-${i}`} className={styles.calendarDayEmpty} />
              ))}
              
              {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => {
                const day = i + 1;
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dayTasks = getTasksForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

                return (
                  <div 
                    key={day} 
                    className={`${styles.calendarDay} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className={styles.dayNumber}>{day}</span>
                    {dayTasks.length > 0 && (
                      <div className={styles.dayTasks}>
                        {dayTasks.slice(0, 3).map(task => (
                          <div 
                            key={task.id}
                            className={`${styles.dayTask} ${styles[task.status]}`}
                            style={{ backgroundColor: getCategoryColor(task.category) }}
                            title={task.title}
                          >
                            {getCategoryIcon(task.category)}
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <div className={styles.moreTasks}>
                            +{dayTasks.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tâches du jour sélectionné */}
          {selectedDate && (
            <div className={styles.selectedDateTasks}>
              <h3>
                <Calendar size={20} />
                Tâches du {formatDate(selectedDate)}
              </h3>
              <div className={styles.taskList}>
                {getTasksForDate(selectedDate).map(task => (
                  <div key={task.id} className={`${styles.taskCard} ${styles[task.status]}`}>
                    <div className={styles.taskHeader}>
                      <button 
                        onClick={() => toggleTaskStatus(task.id)}
                        className={styles.statusButton}
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle size={16} />
                        ) : (
                          <Circle size={16} />
                        )}
                      </button>
                      <div className={styles.taskInfo}>
                        <h4>{task.title}</h4>
                        <p>{task.description}</p>
                      </div>
                      <div className={styles.taskActions}>
                        <button onClick={() => setEditingTask(task)}>
                          <Edit size={14} />
                        </button>
                        <button onClick={() => deleteTask(task.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.taskMeta}>
                      <span 
                        className={styles.category}
                        style={{ backgroundColor: getCategoryColor(task.category) }}
                      >
                        {getCategoryIcon(task.category)}
                        {categories.find(cat => cat.id === task.category)?.name}
                      </span>
                      <span 
                        className={styles.priority}
                        style={{ color: getPriorityColor(task.priority) }}
                      >
                        {task.priority === 'high' ? 'Haute' : 
                         task.priority === 'medium' ? 'Moyenne' : 'Basse'} priorité
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'list' && (
        <div className={styles.listView}>
          <div className={styles.taskList}>
            {tasks
              .filter(task => {
                const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
                const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                     task.description.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesCategory && matchesSearch;
              })
              .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
              .map(task => {
                const daysUntil = getDaysUntil(task.dueDate);
                const isOverdue = daysUntil < 0;
                
                return (
                  <div 
                    key={task.id} 
                    className={`${styles.taskCard} ${styles[task.status]} ${isOverdue ? styles.overdue : ''}`}
                  >
                    <div className={styles.taskHeader}>
                      <button 
                        onClick={() => toggleTaskStatus(task.id)}
                        className={styles.statusButton}
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle size={16} />
                        ) : (
                          <Circle size={16} />
                        )}
                      </button>
                      <div className={styles.taskInfo}>
                        <h4>{task.title}</h4>
                        <p>{task.description}</p>
                      </div>
                      <div className={styles.taskActions}>
                        <button onClick={() => setEditingTask(task)}>
                          <Edit size={14} />
                        </button>
                        <button onClick={() => deleteTask(task.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.taskMeta}>
                      <span 
                        className={styles.category}
                        style={{ backgroundColor: getCategoryColor(task.category) }}
                      >
                        {getCategoryIcon(task.category)}
                        {categories.find(cat => cat.id === task.category)?.name}
                      </span>
                      <span 
                        className={styles.priority}
                        style={{ color: getPriorityColor(task.priority) }}
                      >
                        {task.priority === 'high' ? 'Haute' : 
                         task.priority === 'medium' ? 'Moyenne' : 'Basse'} priorité
                      </span>
                      <span className={styles.taskDate}>
                        <Calendar size={12} />
                        {formatDate(task.dueDate)}
                      </span>
                      {isOverdue && (
                        <span className={styles.overdueBadge}>
                          En retard de {Math.abs(daysUntil)} jour{Math.abs(daysUntil) > 1 ? 's' : ''}
                        </span>
                      )}
                      {!isOverdue && daysUntil <= 7 && (
                        <span className={styles.urgentBadge}>
                          Dans {daysUntil} jour{daysUntil > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {viewMode === 'kanban' && (
        <div className={styles.kanbanView}>
          <div className={styles.kanbanColumns}>
            <div className={styles.kanbanColumn}>
              <h3>À faire</h3>
              <div className={styles.kanbanTasks}>
                {tasks
                  .filter(task => task.status === 'pending')
                  .map(task => (
                    <div key={task.id} className={styles.kanbanTask}>
                      <h4>{task.title}</h4>
                      <p>{task.description}</p>
                      <div className={styles.kanbanTaskMeta}>
                        <span 
                          className={styles.category}
                          style={{ backgroundColor: getCategoryColor(task.category) }}
                        >
                          {categories.find(cat => cat.id === task.category)?.name}
                        </span>
                        <span className={styles.taskDate}>
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className={styles.kanbanColumn}>
              <h3>En cours</h3>
              <div className={styles.kanbanTasks}>
                {tasks
                  .filter(task => task.status === 'overdue')
                  .map(task => (
                    <div key={task.id} className={`${styles.kanbanTask} ${styles.overdue}`}>
                      <h4>{task.title}</h4>
                      <p>{task.description}</p>
                      <div className={styles.kanbanTaskMeta}>
                        <span 
                          className={styles.category}
                          style={{ backgroundColor: getCategoryColor(task.category) }}
                        >
                          {categories.find(cat => cat.id === task.category)?.name}
                        </span>
                        <span className={styles.overdueBadge}>
                          En retard
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className={styles.kanbanColumn}>
              <h3>Terminé</h3>
              <div className={styles.kanbanTasks}>
                {tasks
                  .filter(task => task.status === 'completed')
                  .map(task => (
                    <div key={task.id} className={`${styles.kanbanTask} ${styles.completed}`}>
                      <h4>{task.title}</h4>
                      <p>{task.description}</p>
                      <div className={styles.kanbanTaskMeta}>
                        <span 
                          className={styles.category}
                          style={{ backgroundColor: getCategoryColor(task.category) }}
                        >
                          {categories.find(cat => cat.id === task.category)?.name}
                        </span>
                        <span className={styles.completedBadge}>
                          Terminé
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout/édition (à implémenter) */}
      {showAddTask && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Ajouter une tâche</h3>
            {/* Formulaire à implémenter */}
            <button onClick={() => setShowAddTask(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
} 