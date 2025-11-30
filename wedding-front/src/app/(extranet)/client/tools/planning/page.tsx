'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { todosApi, TodoItem, TodoCategory, TodoStatus, TodoPriority, CreateTodoDto, UpdateTodoDto } from '@/lib/api/todos';
import { invitationsApi } from '@/lib/api/invitations';
import { HeaderMobile } from '@/components/HeaderMobile/HeaderMobile';
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
  AlertCircle,
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
  Grid3X3,
  Briefcase,
  Settings,
  Building,
  Sparkles,
  ExternalLink,
  Hourglass
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAI } from '@/hooks/useAI';
import { AIQuotaBadge } from '@/components/AIQuotaBadge/AIQuotaBadge';
import { useServicePurchaseLimits } from '@/hooks/useSubscriptionLimits';
import { exportToGoogleCalendar, openGoogleCalendarForTask } from '@/utils/googleCalendar';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

type Category = {
  id: TodoCategory;
  name: string;
  icon: React.ReactNode;
  color: string;
};

type ViewMode = 'calendar' | 'list' | 'kanban';

export default function PlanningPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<TodoItem[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TodoCategory | 'all'>('all');
  const [selectedInvitation, setSelectedInvitation] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<TodoItem | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [draggedTask, setDraggedTask] = useState<TodoItem | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TodoItem | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedInvitationForAI, setSelectedInvitationForAI] = useState<string>('');
  const [aiFormData, setAiFormData] = useState({
    guestCount: '',
    budget: '',
    additionalInfo: ''
  });
  const [isGeneratingChecklist, setIsGeneratingChecklist] = useState(false);
  const { generateChecklist, loading: aiLoading, error: aiError } = useAI();
  const { remaining, refresh: refreshLimits } = useServicePurchaseLimits();
  const [showGoogleCalendarModal, setShowGoogleCalendarModal] = useState(false);
  const [googleCalendarInfo, setGoogleCalendarInfo] = useState<{ filename?: string; taskCount?: number; error?: string } | null>(null);
  const [formData, setFormData] = useState<CreateTodoDto>({
    invitationId: '',
    title: '',
    description: '',
    category: 'OTHER',
    priority: 'MEDIUM',
    dueDate: ''
  });

  const categories: Category[] = [
    { id: 'PROVIDER', name: 'Prestataire', icon: <Briefcase size={16} />, color: '#3b82f6' },
    { id: 'ADMIN', name: 'Administratif', icon: <Settings size={16} />, color: '#6b7280' },
    { id: 'DECORATION', name: 'Décoration', icon: <Flower size={16} />, color: '#10b981' },
    { id: 'CATERING', name: 'Traiteur', icon: <Utensils size={16} />, color: '#f59e0b' },
    { id: 'PHOTOGRAPHY', name: 'Photographie', icon: <Camera size={16} />, color: '#06b6d4' },
    { id: 'MUSIC', name: 'Musique', icon: <Music size={16} />, color: '#8b5cf6' },
    { id: 'TRANSPORT', name: 'Transport', icon: <Car size={16} />, color: '#84cc16' },
    { id: 'VENUE', name: 'Lieu', icon: <Building size={16} />, color: '#ec4899' },
    { id: 'GUEST_MANAGEMENT', name: 'Gestion invités', icon: <Users size={16} />, color: '#3b82f6' },
    { id: 'OTHER', name: 'Autre', icon: <Circle size={16} />, color: '#6b7280' }
  ];

  // Charger les todos et invitations
  const fetchTodos = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      
      const filters: any = {};
      if (selectedInvitation !== 'all') {
        filters.invitationId = selectedInvitation;
      }
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      
      const todosResponse = await todosApi.getAllTodos(filters);
      setTasks(todosResponse.todos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  }, [user, selectedInvitation, selectedCategory]);

  const fetchInvitations = useCallback(async () => {
    if (!user) return;
    try {
      const invitationsList = await invitationsApi.getInvitations();
      setInvitations(invitationsList || []);
    } catch (err) {
      console.error('Erreur lors du chargement des invitations:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  useEffect(() => {
    if (invitations.length > 0 && !formData.invitationId) {
      setFormData(prev => ({ ...prev, invitationId: invitations[0].id }));
    }
    if (invitations.length > 0 && !selectedInvitationForAI) {
      // Sélectionner uniquement un événement à venir
      const upcomingInvitation = invitations.find(inv => new Date(inv.eventDate) >= new Date());
      if (upcomingInvitation) {
        setSelectedInvitationForAI(upcomingInvitation.id);
      }
    }
    // Si l'événement sélectionné est passé, le réinitialiser
    if (selectedInvitationForAI) {
      const selectedInv = invitations.find(inv => inv.id === selectedInvitationForAI);
      if (selectedInv && new Date(selectedInv.eventDate) < new Date()) {
        const upcomingInvitation = invitations.find(inv => new Date(inv.eventDate) >= new Date());
        setSelectedInvitationForAI(upcomingInvitation?.id || '');
      }
    }
  }, [invitations, formData.invitationId, selectedInvitationForAI]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Fonction pour vérifier si une date correspond au jour d'un événement
  const isEventDate = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return invitations.some(inv => {
      const eventDateStr = new Date(inv.eventDate).toISOString().split('T')[0];
      return eventDateStr === dateStr;
    });
  };

  // Fonctions utilitaires
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysUntil = (date: Date | string | undefined) => {
    if (!date) return Infinity;
    const now = new Date();
    const taskDate = typeof date === 'string' ? new Date(date) : date;
    const diffTime = taskDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getCategoryIcon = (categoryId: TodoCategory) => {
    return categories.find(cat => cat.id === categoryId)?.icon || <Circle size={12} />;
  };

  const getCategoryColor = (categoryId: TodoCategory) => {
    return categories.find(cat => cat.id === categoryId)?.color || '#6b7280';
  };

  const getPriorityColor = (priority: TodoPriority) => {
    switch (priority) {
      case 'URGENT': return '#ef4444';
      case 'HIGH': return '#f59e0b';
      case 'MEDIUM': return '#3b82f6';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Fonction pour déterminer le lien d'action selon la catégorie et le contenu
  const getTaskActionLink = (task: TodoItem): string | null => {
    const categoryUpper = task.category.toUpperCase();
    const titleLower = task.title.toLowerCase();
    const descLower = (task.description || '').toLowerCase();
    
    // Prestataires
    if (categoryUpper === 'PROVIDER' || 
        categoryUpper === 'CATERING' || 
        categoryUpper === 'PHOTOGRAPHY' || 
        categoryUpper === 'MUSIC' || 
        categoryUpper === 'TRANSPORT' ||
        categoryUpper === 'DECORATION' ||
        titleLower.includes('prestataire') ||
        titleLower.includes('traiteur') ||
        titleLower.includes('photographe') ||
        titleLower.includes('dj') ||
        titleLower.includes('décorateur') ||
        descLower.includes('prestataire') ||
        descLower.includes('traiteur') ||
        descLower.includes('photographe')) {
      return '/client/providers/all';
    }
    
    // Invitations
    if (titleLower.includes('invitation') ||
        (titleLower.includes('créer') && (titleLower.includes('design') || titleLower.includes('invitation'))) ||
        descLower.includes('invitation') ||
        descLower.includes('design') && descLower.includes('créer')) {
      return '/client/invitations';
    }
    
    // Invités
    if (categoryUpper === 'GUEST_MANAGEMENT' ||
        titleLower.includes('invité') ||
        (titleLower.includes('liste') && titleLower.includes('invité')) ||
        descLower.includes('invité') ||
        descLower.includes('liste d\'invités')) {
      return '/client/guests';
    }
    
    return null;
  };

  // Actions
  const toggleTaskStatus = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const newStatus: TodoStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      const updatedTodoResponse = await todosApi.updateTodo(taskId, { status: newStatus });
    setTasks(prevTasks =>
        prevTasks.map(t => t.id === taskId ? updatedTodoResponse.todo : t)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteClick = (task: TodoItem) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const deleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await todosApi.deleteTodo(taskToDelete.id);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete.id));
      setShowDeleteModal(false);
      setTaskToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      setShowDeleteModal(false);
      setTaskToDelete(null);
    }
  };

  const handleEditTask = (task: TodoItem) => {
    setEditingTask(task);
    setFormData({
      invitationId: task.invitationId,
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setShowAddTask(true);
  };

  const handleCloseModal = () => {
    setShowAddTask(false);
    setEditingTask(null);
    setFormData({
      invitationId: invitations.length > 0 ? invitations[0].id : '',
      title: '',
      description: '',
      category: 'OTHER',
      priority: 'MEDIUM',
      dueDate: ''
    });
    setError(null);
  };

  // Drag and Drop handlers
  const handleDragStart = (task: TodoItem) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, column: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedTask) {
      setDraggedOverColumn(column);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Ne réinitialiser que si on quitte vraiment la colonne
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDraggedOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, column: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedTask) return;

    let newStatus: TodoStatus;
    
    if (column === 'pending') {
      newStatus = 'PENDING';
    } else if (column === 'in_progress') {
      newStatus = 'IN_PROGRESS';
    } else if (column === 'completed') {
      newStatus = 'COMPLETED';
    } else {
      setDraggedTask(null);
      setDraggedOverColumn(null);
      return;
    }

    // Ne mettre à jour que si le statut change
    if (newStatus !== draggedTask.status) {
      await updateTaskStatus(draggedTask.id, newStatus);
    }
    
    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  const updateTaskStatus = async (taskId: string, newStatus: TodoStatus) => {
    try {
      const updatedTodoResponse = await todosApi.updateTodo(taskId, { status: newStatus });
      setTasks(prevTasks =>
        prevTasks.map(t => t.id === taskId ? updatedTodoResponse.todo : t)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
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
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'COMPLETED' || !t.dueDate) return false;
    return getDaysUntil(t.dueDate) < 0;
  }).length;
  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  if (!user || loading) {
    return (
      <div className={styles.planningPage}>
        <HeaderMobile title="Planning & Tâches" />
        <main className={styles.main}>
        <div className={styles.loading}>Chargement...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.planningPage}>
      <HeaderMobile title="Planning & Tâches" />

      {/* Main Content */}
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Organisez votre événement</h1>

        {/* Actions Bar */}
        <div className={styles.actionsBar}>
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
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <AIQuotaBadge variant="compact" displayMode="usage" />
            <button 
              className={styles.addButton}
              onClick={() => setShowAIModal(true)}
              style={{ backgroundColor: 'var(--accent-color, #8b5cf6)', color: 'white' }}
              disabled={
                invitations.filter(inv => new Date(inv.eventDate) >= new Date()).length === 0 ||
                (remaining?.aiRequests ?? 0) === 0
              }
              title={
                invitations.filter(inv => new Date(inv.eventDate) >= new Date()).length === 0 
                  ? 'Aucun événement à venir disponible' 
                  : (remaining?.aiRequests ?? 0) === 0
                  ? 'Aucune requête IA restante'
                  : ''
              }
            >
              <Sparkles size={16} />
              Générer avec l'IA
            </button>
          <button 
            className={styles.addButton}
            onClick={() => setShowAddTask(true)}
          >
            <Plus size={16} />
            Ajouter une tâche
          </button>
          <button 
            className={styles.addButton}
            onClick={() => {
              const result = exportToGoogleCalendar(tasks);
              if (result.success) {
                setGoogleCalendarInfo({ filename: result.filename, taskCount: result.taskCount });
                setShowGoogleCalendarModal(true);
              } else {
                setGoogleCalendarInfo({ error: result.error });
                setShowGoogleCalendarModal(true);
              }
            }}
            style={{ backgroundColor: '#4285f4', color: 'white' }}
            title="Exporter toutes les tâches vers Google Calendar"
          >
            <Calendar size={16} />
            Exporter vers Google Calendar
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
            <Circle size={20} />
          </div>
          <div className={styles.statContent}>
            <h3>{pendingTasks}</h3>
            <p>À faire</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Clock size={20} />
          </div>
          <div className={styles.statContent}>
            <h3>{inProgressTasks}</h3>
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
            onChange={(e) => setSelectedCategory(e.target.value as TodoCategory | 'all')}
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

        {invitations.length > 0 && (
          <div className={styles.categoryFilter}>
            <Filter size={16} />
            <select 
              value={selectedInvitation}
              onChange={(e) => setSelectedInvitation(e.target.value)}
              className={styles.categorySelect}
            >
              <option value="all">Tous les événements</option>
              {invitations.map(inv => (
                <option key={inv.id} value={inv.id}>
                  {inv.eventTitle}
                </option>
              ))}
            </select>
          </div>
        )}
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
                const isEventDay = isEventDate(date);

                const hasTasks = dayTasks.length > 0;
                const overdueCount = dayTasks.filter(t => t.dueDate && getDaysUntil(t.dueDate) < 0).length;

                return (
                  <div 
                    key={day} 
                    className={`${styles.calendarDay} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''} ${hasTasks ? styles.hasTasks : ''} ${overdueCount > 0 ? styles.hasOverdue : ''} ${isEventDay ? styles.eventDay : ''}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className={styles.dayHeader}>
                      <span className={styles.dayNumber}>{day}</span>
                      {hasTasks && (
                        <span className={styles.taskBadge}>{dayTasks.length}</span>
                      )}
                    </div>
                    {hasTasks && (
                      <div className={styles.dayTasks}>
                        {dayTasks.slice(0, 4).map(task => {
                          const isOverdue = task.dueDate && getDaysUntil(task.dueDate) < 0;
                          return (
                            <div 
                              key={task.id}
                              className={`${styles.dayTask} ${styles[task.status.toLowerCase()]} ${isOverdue ? styles.overdue : ''}`}
                              style={{ 
                                backgroundColor: getCategoryColor(task.category),
                                borderColor: isOverdue ? '#ef4444' : 'transparent'
                              }}
                              title={task.title}
                            >
                              {getCategoryIcon(task.category)}
                            </div>
                          );
                        })}
                        {dayTasks.length > 4 && (
                          <div className={styles.moreTasks}>
                            +{dayTasks.length - 4}
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
                Tâches du {formatDate(selectedDate as Date)}
              </h3>
              <div className={styles.taskList}>
                {getTasksForDate(selectedDate as Date).map(task => (
                  <div key={task.id} className={`${styles.taskCard} ${styles[task.status.toLowerCase()]}`}>
                    <div className={styles.taskHeader}>
                      <button 
                        onClick={() => toggleTaskStatus(task.id)}
                        className={styles.statusButton}
                      >
                        {task.status === 'COMPLETED' ? (
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
                        {task.dueDate && (
                          <button 
                            onClick={() => openGoogleCalendarForTask(task)}
                            title="Ajouter à Google Calendar"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.375rem 0.75rem',
                              backgroundColor: '#4285f4',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }}
                          >
                            <Calendar size={12} />
                            Google
                          </button>
                        )}
                        {getTaskActionLink(task) && (
                          <button 
                            onClick={() => router.push(getTaskActionLink(task)!)}
                            title="Aller à la page correspondante"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.375rem 0.75rem',
                              backgroundColor: 'var(--accent-color, #8b5cf6)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }}
                          >
                            <ExternalLink size={12} />
                            Accéder
                          </button>
                        )}
                         <button onClick={() => handleEditTask(task)}>
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteClick(task)}>
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
                        {task.priority === 'URGENT' ? 'Urgente' :
                         task.priority === 'HIGH' ? 'Haute' : 
                         task.priority === 'MEDIUM' ? 'Moyenne' : 'Basse'} priorité
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
                const matchesInvitation = selectedInvitation === 'all' || task.invitationId === selectedInvitation;
                const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                     (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
                return matchesCategory && matchesInvitation && matchesSearch;
              })
              .sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
              })
              .map(task => {
                const daysUntil = getDaysUntil(task.dueDate);
                const isOverdue = task.dueDate ? daysUntil < 0 : false;
                
                return (
                  <div 
                    key={task.id} 
                    className={`${styles.taskCard} ${styles[task.status.toLowerCase()]} ${isOverdue ? styles.overdue : ''}`}
                  >
                    <div className={styles.taskHeader}>
                      <button 
                        onClick={() => toggleTaskStatus(task.id)}
                        className={styles.statusButton}
                      >
                        {task.status === 'COMPLETED' ? (
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
                        {task.dueDate && (
                          <button 
                            onClick={() => openGoogleCalendarForTask(task)}
                            title="Ajouter à Google Calendar"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.375rem 0.75rem',
                              backgroundColor: '#4285f4',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }}
                          >
                            <Calendar size={12} />
                            Google
                          </button>
                        )}
                        {getTaskActionLink(task) && (
                          <button 
                            onClick={() => router.push(getTaskActionLink(task)!)}
                            title="Aller à la page correspondante"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.375rem 0.75rem',
                              backgroundColor: 'var(--accent-color, #8b5cf6)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }}
                          >
                            <ExternalLink size={12} />
                            Accéder
                          </button>
                        )}
                         <button onClick={() => handleEditTask(task)}>
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteClick(task)}>
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
                        {task.priority === 'URGENT' ? 'Urgente' :
                         task.priority === 'HIGH' ? 'Haute' : 
                         task.priority === 'MEDIUM' ? 'Moyenne' : 'Basse'} priorité
                      </span>
                      {task.dueDate && (
                      <span className={styles.taskDate}>
                        <Calendar size={12} />
                          {task.dueDate ? formatDate(task.dueDate) : 'Pas de date'}
                      </span>
                      )}
                      {task.dueDate && (() => {
                        const daysUntil = getDaysUntil(task.dueDate);
                        const isOverdue = daysUntil < 0;
                        return (
                          <>
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
                          </>
                        );
                      })()}
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
             <div 
               className={`${styles.kanbanColumn} ${draggedOverColumn === 'pending' ? styles.dragOver : ''}`}
               onDragOver={(e) => handleDragOver(e, 'pending')}
               onDragLeave={handleDragLeave}
               onDrop={(e) => handleDrop(e, 'pending')}
             >
               <h3>À faire ({tasks.filter(t => t.status === 'PENDING').length})</h3>
               <div className={styles.kanbanTasks}>
                 {tasks
                   .filter(task => {
                     const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
                     const matchesInvitation = selectedInvitation === 'all' || task.invitationId === selectedInvitation;
                     const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
                     if (!matchesCategory || !matchesInvitation || !matchesSearch) return false;
                     return task.status === 'PENDING';
                   })
                   .map(task => {
                     const isOverdue = task.dueDate ? getDaysUntil(task.dueDate) < 0 : false;
                     return (
                       <div 
                         key={task.id} 
                         className={`${styles.kanbanTask} ${isOverdue ? styles.overdue : ''} ${draggedTask?.id === task.id ? styles.dragging : ''}`}
                         draggable
                         onDragStart={() => handleDragStart(task)}
                         onDragEnd={handleDragEnd}
                       >
                         <div className={styles.kanbanTaskHeader}>
                           <button 
                             onClick={() => toggleTaskStatus(task.id)}
                             className={styles.kanbanCheckButton}
                           >
                             <Circle size={14} />
                           </button>
                           <h4>{task.title}</h4>
                         </div>
                         {task.description && <p>{task.description}</p>}
                         <div className={styles.kanbanTaskMeta}>
                           <span 
                             className={styles.category}
                             style={{ backgroundColor: getCategoryColor(task.category) }}
                           >
                             {getCategoryIcon(task.category)}
                             {categories.find(cat => cat.id === task.category)?.name}
                           </span>
                           {task.dueDate && (
                             <span className={styles.taskDate}>
                               {formatDate(task.dueDate)}
                             </span>
                           )}
                           {isOverdue && (
                             <span className={styles.overdueBadge}>
                               En retard
                             </span>
                           )}
                         </div>
                         {getTaskActionLink(task) && (
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               router.push(getTaskActionLink(task)!);
                             }}
                             title="Aller à la page correspondante"
                             style={{
                               marginTop: '0.5rem',
                               width: '100%',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               gap: '0.25rem',
                               padding: '0.375rem 0.75rem',
                               backgroundColor: 'var(--accent-color, #8b5cf6)',
                               color: 'white',
                               border: 'none',
                               borderRadius: '0.375rem',
                               cursor: 'pointer',
                               fontSize: '0.75rem',
                               fontWeight: 500
                             }}
                           >
                             <ExternalLink size={12} />
                             Accéder
                           </button>
                         )}
                       </div>
                     );
                   })}
               </div>
             </div>

             <div 
               className={`${styles.kanbanColumn} ${draggedOverColumn === 'in_progress' ? styles.dragOver : ''}`}
               onDragOver={(e) => handleDragOver(e, 'in_progress')}
               onDragLeave={handleDragLeave}
               onDrop={(e) => handleDrop(e, 'in_progress')}
             >
               <h3>En cours ({tasks.filter(t => t.status === 'IN_PROGRESS').length})</h3>
               <div className={styles.kanbanTasks}>
                 {tasks
                   .filter(task => {
                     const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
                     const matchesInvitation = selectedInvitation === 'all' || task.invitationId === selectedInvitation;
                     const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
                     if (!matchesCategory || !matchesInvitation || !matchesSearch) return false;
                     return task.status === 'IN_PROGRESS';
                   })
                   .map(task => {
                     const isOverdue = task.dueDate ? getDaysUntil(task.dueDate) < 0 : false;
                     return (
                       <div 
                         key={task.id} 
                         className={`${styles.kanbanTask} ${isOverdue ? styles.overdue : ''} ${draggedTask?.id === task.id ? styles.dragging : ''}`}
                         draggable
                         onDragStart={() => handleDragStart(task)}
                         onDragEnd={handleDragEnd}
                       >
                         <div className={styles.kanbanTaskHeader}>
                           <button 
                             onClick={() => toggleTaskStatus(task.id)}
                             className={styles.kanbanCheckButton}
                           >
                             <Circle size={14} />
                           </button>
                           <h4>{task.title}</h4>
                         </div>
                         {task.description && <p>{task.description}</p>}
                         <div className={styles.kanbanTaskMeta}>
                           <span 
                             className={styles.category}
                             style={{ backgroundColor: getCategoryColor(task.category) }}
                           >
                             {getCategoryIcon(task.category)}
                             {categories.find(cat => cat.id === task.category)?.name}
                           </span>
                           {task.dueDate && (
                             <span className={styles.taskDate}>
                               {formatDate(task.dueDate)}
                             </span>
                           )}
                           {isOverdue && (
                             <span className={styles.overdueBadge}>
                               En retard
                             </span>
                           )}
                         </div>
                         {getTaskActionLink(task) && (
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               router.push(getTaskActionLink(task)!);
                             }}
                             title="Aller à la page correspondante"
                             style={{
                               marginTop: '0.5rem',
                               width: '100%',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               gap: '0.25rem',
                               padding: '0.375rem 0.75rem',
                               backgroundColor: 'var(--accent-color, #8b5cf6)',
                               color: 'white',
                               border: 'none',
                               borderRadius: '0.375rem',
                               cursor: 'pointer',
                               fontSize: '0.75rem',
                               fontWeight: 500
                             }}
                           >
                             <ExternalLink size={12} />
                             Accéder
                           </button>
                         )}
                       </div>
                     );
                   })}
               </div>
             </div>

             <div 
               className={`${styles.kanbanColumn} ${draggedOverColumn === 'completed' ? styles.dragOver : ''}`}
               onDragOver={(e) => handleDragOver(e, 'completed')}
               onDragLeave={handleDragLeave}
               onDrop={(e) => handleDrop(e, 'completed')}
             >
               <h3>Terminé ({tasks.filter(t => t.status === 'COMPLETED').length})</h3>
               <div className={styles.kanbanTasks}>
                 {tasks
                   .filter(task => {
                     const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
                     const matchesInvitation = selectedInvitation === 'all' || task.invitationId === selectedInvitation;
                     const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
                     if (!matchesCategory || !matchesInvitation || !matchesSearch) return false;
                     return task.status === 'COMPLETED';
                   })
                   .map(task => (
                     <div 
                       key={task.id} 
                       className={`${styles.kanbanTask} ${styles.completed} ${draggedTask?.id === task.id ? styles.dragging : ''}`}
                       draggable
                       onDragStart={() => handleDragStart(task)}
                       onDragEnd={handleDragEnd}
                     >
                       <div className={styles.kanbanTaskHeader}>
                         <button 
                           onClick={() => toggleTaskStatus(task.id)}
                           className={styles.kanbanCheckButton}
                         >
                           <CheckCircle size={14} />
                         </button>
                         <h4>{task.title}</h4>
                       </div>
                       {task.description && <p>{task.description}</p>}
                       <div className={styles.kanbanTaskMeta}>
                         <span 
                           className={styles.category}
                           style={{ backgroundColor: getCategoryColor(task.category) }}
                         >
                           {getCategoryIcon(task.category)}
                           {categories.find(cat => cat.id === task.category)?.name}
                         </span>
                         <span className={styles.completedBadge}>
                           Terminé
                         </span>
                       </div>
                       {getTaskActionLink(task) && (
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             router.push(getTaskActionLink(task)!);
                           }}
                           title="Aller à la page correspondante"
                           style={{
                             marginTop: '0.5rem',
                             width: '100%',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             gap: '0.25rem',
                             padding: '0.375rem 0.75rem',
                             backgroundColor: 'var(--accent-color, #8b5cf6)',
                             color: 'white',
                             border: 'none',
                             borderRadius: '0.375rem',
                             cursor: 'pointer',
                             fontSize: '0.75rem',
                             fontWeight: 500
                           }}
                         >
                           <ExternalLink size={12} />
                           Accéder
                         </button>
                       )}
                     </div>
                   ))}
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Modal d'ajout/édition */}
      {showAddTask && (
         <div className={styles.modal} onClick={handleCloseModal}>
           <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
             <div className={styles.modalHeader}>
               <h3>{editingTask ? 'Modifier la tâche' : 'Ajouter une tâche'}</h3>
               <button className={styles.closeButton} onClick={handleCloseModal}>
                 ×
               </button>
          </div>
             
             {error && (
               <div className={styles.errorMessage}>
                 {error}
        </div>
      )}

             <form 
               className={styles.modalForm}
               onSubmit={async (e) => {
                 e.preventDefault();
                 if (!formData.title.trim() || !formData.invitationId) return;
                 
                 try {
                   setError(null);
                   if (editingTask) {
                     await todosApi.updateTodo(editingTask.id, {
                       title: formData.title,
                       description: formData.description || undefined,
                       category: formData.category,
                       priority: formData.priority,
                       dueDate: formData.dueDate || undefined
                     });
                   } else {
                     await todosApi.createTodo({
                       invitationId: formData.invitationId,
                       title: formData.title,
                       description: formData.description || undefined,
                       category: formData.category,
                       priority: formData.priority,
                       dueDate: formData.dueDate || undefined
                     });
                   }
                   await fetchTodos();
                   handleCloseModal();
                 } catch (err) {
                   setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
                 }
               }}
             >
               <div className={styles.formGroup}>
                 <label className={styles.formLabel}>Événement *</label>
                 <select
                   value={formData.invitationId}
                   onChange={(e) => setFormData(prev => ({ ...prev, invitationId: e.target.value }))}
                   className={styles.formInput}
                   required
                 >
                   <option value="">Sélectionner un événement</option>
                   {invitations.map(inv => (
                     <option key={inv.id} value={inv.id}>{inv.eventTitle}</option>
                   ))}
                 </select>
               </div>

               <div className={styles.formGroup}>
                 <label className={styles.formLabel}>Titre *</label>
                 <input
                   type="text"
                   value={formData.title}
                   onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                   className={styles.formInput}
                   placeholder="Nom de la tâche"
                   required
                 />
               </div>

               <div className={styles.formGroup}>
                 <label className={styles.formLabel}>Description</label>
                 <textarea
                   value={formData.description}
                   onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                   className={styles.formTextarea}
                   placeholder="Détails de la tâche"
                   rows={3}
                 />
               </div>

               <div className={styles.formRow}>
                 <div className={styles.formGroup}>
                   <label className={styles.formLabel}>Catégorie *</label>
                   <select
                     value={formData.category}
                     onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as TodoCategory }))}
                     className={styles.formInput}
                     required
                   >
                     {categories.map(cat => (
                       <option key={cat.id} value={cat.id}>{cat.name}</option>
                     ))}
                   </select>
                 </div>

                 <div className={styles.formGroup}>
                   <label className={styles.formLabel}>Priorité *</label>
                   <select
                     value={formData.priority}
                     onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TodoPriority }))}
                     className={styles.formInput}
                     required
                   >
                     <option value="LOW">Basse</option>
                     <option value="MEDIUM">Moyenne</option>
                     <option value="HIGH">Haute</option>
                     <option value="URGENT">Urgente</option>
                   </select>
                 </div>
               </div>

               <div className={styles.formGroup}>
                 <label className={styles.formLabel}>Date d'échéance</label>
                 <input
                   type="date"
                   value={formData.dueDate}
                   onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                   className={styles.formInput}
                 />
               </div>

               <div className={styles.modalActions}>
                 <button 
                   type="button" 
                   className={styles.cancelButton}
                   onClick={handleCloseModal}
                 >
                   Annuler
                 </button>
                 <button 
                   type="submit" 
                   className={styles.submitButton}
                 >
                   {editingTask ? 'Modifier' : 'Ajouter'}
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

       {/* Modal de génération IA */}
       {showAIModal && (
         <div className={styles.modal} onClick={() => !(aiLoading || isGeneratingChecklist) && setShowAIModal(false)}>
           <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
             {/* Overlay de chargement - Affiche uniquement le loading */}
             {(aiLoading || isGeneratingChecklist) ? (
               <div style={{
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 justifyContent: 'center',
                 minHeight: '400px',
                 padding: '2rem'
               }}>
                 <div style={{
                   display: 'flex',
                   flexDirection: 'column',
                   alignItems: 'center',
                   gap: '1.5rem'
                 }}>
                   <div style={{
                     position: 'relative',
                     width: '80px',
                     height: '80px'
                   }}>
                     <Hourglass 
                       size={80} 
                       className={styles.hourglassAnimation}
                     />
                   </div>
                   <div style={{
                     textAlign: 'center'
                   }}>
                     <h3 style={{
                       fontSize: '1.25rem',
                       fontWeight: 600,
                       color: 'var(--text-primary, #1f2937)',
                       marginBottom: '0.5rem'
                     }}>
                       L'IA prépare votre checklist
                     </h3>
                     <p style={{
                       fontSize: '0.875rem',
                       color: 'var(--text-secondary, #6b7280)'
                     }}>
                       Veuillez patienter, cela peut prendre quelques instants...
                     </p>
                   </div>
                 </div>
               </div>
             ) : (
               <>
                 <div className={styles.modalHeader}>
                   <h3>
                     <Sparkles size={20} style={{ marginRight: '0.5rem' }} />
                     Générer une checklist avec l'IA
                   </h3>
                   <button 
                     className={styles.closeButton} 
                     onClick={() => setShowAIModal(false)}
                   >
                     ×
                   </button>
                 </div>
                 
                 {aiError && (
                   <div className={styles.errorMessage}>
                     {aiError}
                   </div>
                 )}

                 {(() => {
                   const upcomingInvitations = invitations.filter(inv => new Date(inv.eventDate) >= new Date());
                   
                   // Si aucun événement à venir n'est disponible
                   if (upcomingInvitations.length === 0 && invitations.length > 0) {
                     return (
                       <div style={{
                         padding: '2rem',
                         textAlign: 'center'
                       }}>
                         <AlertTriangle 
                           size={48} 
                           style={{
                             color: '#ef4444',
                             marginBottom: '1rem'
                           }}
                         />
                         <h3 style={{
                           fontSize: '1.125rem',
                           fontWeight: 600,
                           color: 'var(--text-primary, #1f2937)',
                           marginBottom: '0.5rem'
                         }}>
                           Aucun événement à venir
                         </h3>
                         <p style={{
                           fontSize: '0.875rem',
                           color: 'var(--text-secondary, #6b7280)',
                           marginBottom: '1rem'
                         }}>
                           Tous vos événements sont déjà passés. Créez un nouvel événement pour générer une checklist.
                         </p>
                       </div>
                     );
                   }
                   
                   const currentSelection = selectedInvitationForAI || (upcomingInvitations.length > 0 ? upcomingInvitations[0].id : '');
                   const selectedInv = invitations.find(inv => inv.id === currentSelection);
                   const isEventPast = selectedInv ? new Date(selectedInv.eventDate) < new Date() : false;
                   
                   if (isEventPast) {
                     return (
                       <div style={{
                         padding: '2rem',
                         textAlign: 'center'
                       }}>
                         <AlertTriangle 
                           size={48} 
                           style={{
                             color: '#ef4444',
                             marginBottom: '1rem'
                           }}
                         />
                         <h3 style={{
                           fontSize: '1.125rem',
                           fontWeight: 600,
                           color: 'var(--text-primary, #1f2937)',
                           marginBottom: '0.5rem'
                         }}>
                           Impossible de générer une checklist
                         </h3>
                         <p style={{
                           fontSize: '0.875rem',
                           color: 'var(--text-secondary, #6b7280)',
                           marginBottom: '1rem'
                         }}>
                           La date de cet événement est déjà passée. Veuillez sélectionner un événement à venir.
                         </p>
                         {selectedInv && (
                           <p style={{
                             fontSize: '0.75rem',
                             color: 'var(--text-tertiary, #9ca3af)',
                             fontStyle: 'italic'
                           }}>
                             Date de l'événement : {new Date(selectedInv.eventDate).toLocaleDateString('fr-FR', { 
                               weekday: 'long', 
                               year: 'numeric', 
                               month: 'long', 
                               day: 'numeric' 
                             })}
                           </p>
                         )}
                       </div>
                     );
                   }
                   
                   return (
                 <form 
                   className={styles.modalForm}
               onSubmit={async (e) => {
                 e.preventDefault();
                 const upcomingInv = invitations.filter(inv => new Date(inv.eventDate) >= new Date());
                 if (!selectedInvitationForAI && upcomingInv.length > 0) {
                   setSelectedInvitationForAI(upcomingInv[0].id);
                 }
                 if (!selectedInvitationForAI) return;
                 
                 // Vérifier que l'événement sélectionné n'est pas passé
                 const selectedInv = invitations.find(inv => inv.id === selectedInvitationForAI);
                 if (selectedInv && new Date(selectedInv.eventDate) < new Date()) {
                   setError('Impossible de générer une checklist pour un événement déjà passé.');
                   return;
                 }
                 
                 try {
                   setError(null);
                   setIsGeneratingChecklist(true);
                   
                   const result = await generateChecklist({
                     invitationId: selectedInvitationForAI,
                     guestCount: aiFormData.guestCount ? parseInt(aiFormData.guestCount) : undefined,
                     budget: aiFormData.budget ? parseFloat(aiFormData.budget) : undefined,
                     additionalInfo: aiFormData.additionalInfo || undefined
                   });

                   // Créer toutes les tâches générées
                   const invitationId = selectedInvitationForAI;
                   let createdCount = 0;
                   
                   for (const item of result.items) {
                     try {
                       // Mapper la catégorie de l'IA vers notre TodoCategory
                       const categoryMap: Record<string, TodoCategory> = {
                         'PROVIDER': 'PROVIDER',
                         'ADMIN': 'ADMIN',
                         'DECORATION': 'DECORATION',
                         'CATERING': 'CATERING',
                         'PHOTOGRAPHY': 'PHOTOGRAPHY',
                         'MUSIC': 'MUSIC',
                         'TRANSPORT': 'TRANSPORT',
                         'VENUE': 'VENUE',
                         'GUEST_MANAGEMENT': 'GUEST_MANAGEMENT',
                         'OTHER': 'OTHER'
                       };

                       await todosApi.createTodo({
                         invitationId,
                         title: item.title,
                         description: item.description,
                         category: categoryMap[item.category] || 'OTHER',
                         priority: item.priority,
                         dueDate: item.suggestedDate || undefined
                       });
                       createdCount++;
                     } catch (err) {
                       console.error('Erreur création tâche:', err);
                     }
                   }

                  await fetchTodos();
                  refreshLimits(); // Rafraîchir les limites après utilisation
                  setShowAIModal(false);
                  setAiFormData({
                    guestCount: '',
                    budget: '',
                    additionalInfo: ''
                  });
                  setSelectedInvitationForAI('');
                 } catch (err) {
                   setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
                 } finally {
                   setIsGeneratingChecklist(false);
                 }
               }}
             >
               <div className={styles.formGroup}>
                 <label className={styles.formLabel}>Événement *</label>
                 <select
                   value={selectedInvitationForAI || (upcomingInvitations.length > 0 ? upcomingInvitations[0].id : '')}
                   onChange={(e) => {
                     const selectedId = e.target.value;
                     const selected = invitations.find(inv => inv.id === selectedId);
                     // Ne permettre la sélection que d'événements à venir
                     if (selected && new Date(selected.eventDate) >= new Date()) {
                       setSelectedInvitationForAI(selectedId);
                     }
                   }}
                   className={styles.formInput}
                   required
                   disabled={aiLoading || isGeneratingChecklist || upcomingInvitations.length === 0}
                 >
                   <option value="">Sélectionner un événement</option>
                   {upcomingInvitations.map(inv => (
                     <option key={inv.id} value={inv.id}>
                       {inv.eventTitle} - {new Date(inv.eventDate).toLocaleDateString('fr-FR')}
                     </option>
                   ))}
                   {invitations.filter(inv => new Date(inv.eventDate) < new Date()).length > 0 && (
                     <optgroup label="Événements passés (non disponibles)">
                       {invitations
                         .filter(inv => new Date(inv.eventDate) < new Date())
                         .map(inv => (
                           <option key={inv.id} value={inv.id} disabled>
                             {inv.eventTitle} - {new Date(inv.eventDate).toLocaleDateString('fr-FR')} (Passé)
                           </option>
                         ))}
                     </optgroup>
                   )}
                 </select>
                 <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                   Le type et la date seront récupérés automatiquement depuis l'événement
                 </small>
               </div>

               <div className={styles.formRow}>
                 <div className={styles.formGroup}>
                   <label className={styles.formLabel}>Nombre d'invités (optionnel)</label>
                   <input
                     type="number"
                     value={aiFormData.guestCount}
                     onChange={(e) => setAiFormData(prev => ({ ...prev, guestCount: e.target.value }))}
                     className={styles.formInput}
                     placeholder="Ex: 150"
                     min="1"
                     disabled={aiLoading || isGeneratingChecklist}
                   />
                 </div>

                 <div className={styles.formGroup}>
                   <label className={styles.formLabel}>Budget (€) (optionnel)</label>
                   <input
                     type="number"
                     value={aiFormData.budget}
                     onChange={(e) => setAiFormData(prev => ({ ...prev, budget: e.target.value }))}
                     className={styles.formInput}
                     placeholder="Ex: 15000"
                     min="0"
                     disabled={aiLoading || isGeneratingChecklist}
                   />
                 </div>
               </div>

               <div className={styles.formGroup}>
                 <label className={styles.formLabel}>Informations supplémentaires (optionnel)</label>
                 <textarea
                   value={aiFormData.additionalInfo}
                   onChange={(e) => setAiFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                   className={styles.formTextarea}
                   placeholder="Décrivez votre événement, style souhaité, préférences particulières..."
                   rows={4}
                   disabled={aiLoading || isGeneratingChecklist}
                 />
                 <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                   Ex: "Mariage champêtre en extérieur, réception dans une grange, ambiance décontractée..."
                 </small>
               </div>

               <div className={styles.modalActions}>
                 <button 
                   type="button" 
                   className={styles.cancelButton}
                   onClick={() => setShowAIModal(false)}
                   disabled={aiLoading || isGeneratingChecklist}
                   style={{ opacity: (aiLoading || isGeneratingChecklist) ? 0.5 : 1, cursor: (aiLoading || isGeneratingChecklist) ? 'not-allowed' : 'pointer' }}
                 >
                   Annuler
                 </button>
                 <button 
                   type="submit" 
                   className={styles.submitButton}
                   disabled={aiLoading || isGeneratingChecklist}
                 >
                   {(aiLoading || isGeneratingChecklist) ? 'Génération en cours...' : 'Générer la checklist'}
                 </button>
               </div>
             </form>
                   );
                 })()}
               </>
             )}
           </div>
         </div>
       )}

       {/* Modal de confirmation de suppression */}
       {showDeleteModal && (
         <div className={styles.confirmModal} onClick={() => setShowDeleteModal(false)}>
           <div className={styles.confirmModalContent} onClick={(e) => e.stopPropagation()}>
             <div className={styles.confirmModalHeader}>
               <AlertTriangle size={24} className={styles.confirmModalIcon} />
               <h3 className={styles.confirmModalTitle}>Supprimer la tâche</h3>
             </div>
             <p className={styles.confirmModalMessage}>
               Êtes-vous sûr de vouloir supprimer la tâche "{taskToDelete?.title}" ? Cette action est irréversible.
             </p>
             <div className={styles.confirmModalActions}>
               <button 
                 className={styles.confirmModalCancel}
                 onClick={() => {
                   setShowDeleteModal(false);
                   setTaskToDelete(null);
                 }}
               >
                 Annuler
               </button>
               <button 
                 className={styles.confirmModalConfirm}
                 onClick={deleteTask}
               >
                 Supprimer
               </button>
             </div>
           </div>
         </div>
       )}

        {/* Modal Google Calendar */}
        <Modal 
          isOpen={showGoogleCalendarModal} 
          onClose={() => {
            setShowGoogleCalendarModal(false);
            setGoogleCalendarInfo(null);
          }}
          title={googleCalendarInfo?.error ? 'Erreur' : 'Export vers Google Calendar'}
        >
          <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            {googleCalendarInfo?.error ? (
              <>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: 'rgba(239, 68, 68, 0.1)',
                  marginBottom: '0.5rem'
                }}>
                  <AlertCircle size={32} color="#ef4444" />
                </div>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: 'var(--font-size-sm)', 
                  textAlign: 'center',
                  margin: 0
                }}>
                  {googleCalendarInfo.error}
                </p>
              </>
            ) : (
              <>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: 'rgba(34, 197, 94, 0.1)',
                  marginBottom: '0.5rem'
                }}>
                  <CheckCircle size={32} color="#22c55e" />
                </div>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: 'var(--font-size-sm)', 
                  textAlign: 'center',
                  margin: 0,
                  fontWeight: 600
                }}>
                  Fichier téléchargé avec succès !
                </p>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: 'var(--font-size-sm)', 
                  textAlign: 'center',
                  margin: 0
                }}>
                  Google Calendar s'ouvre dans un nouvel onglet.
                </p>
                <div style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  width: '100%',
                  marginTop: '0.5rem'
                }}>
                  <p style={{ 
                    color: 'var(--text-primary)', 
                    fontSize: 'var(--font-size-sm)', 
                    fontWeight: 600,
                    margin: '0 0 0.75rem 0'
                  }}>
                    Pour importer vos tâches :
                  </p>
                  <ol style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: 'var(--font-size-sm)', 
                    margin: 0,
                    paddingLeft: '1.25rem',
                    lineHeight: '1.8'
                  }}>
                    <li>Dans Google Calendar, cliquez sur "Sélectionner un fichier depuis votre ordinateur"</li>
                    <li>Choisissez le fichier <strong>{googleCalendarInfo?.filename}</strong> que vous venez de télécharger</li>
                    <li>Cliquez sur "Importer"</li>
                  </ol>
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: 'var(--font-size-sm)', 
                    margin: '0.75rem 0 0 0',
                    textAlign: 'center',
                    fontWeight: 600
                  }}>
                    Vos {googleCalendarInfo?.taskCount} tâche{googleCalendarInfo?.taskCount && googleCalendarInfo.taskCount > 1 ? 's' : ''} seront ajoutées à votre calendrier !
                  </p>
                </div>
              </>
            )}
            <div style={{ width: '100%', marginTop: '1rem' }}>
              <Button
                onClick={() => {
                  setShowGoogleCalendarModal(false);
                  setGoogleCalendarInfo(null);
                }}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: 'var(--space-xs) var(--space-md)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--gradient-primary)',
                  color: 'var(--luxury-velvet-black)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {googleCalendarInfo?.error ? 'Fermer' : 'Compris'}
              </Button>
            </div>
          </div>
        </Modal>
       </main>
     </div>
   );
 }