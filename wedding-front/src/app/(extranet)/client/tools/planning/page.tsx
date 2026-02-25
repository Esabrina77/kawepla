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
  const colorMix = (hex: string, opacity: number) => {
    if (!hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
        <div className={styles.pageContent}>
          <div className={styles.loading}>Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.planningPage}>
      <HeaderMobile title="Planning & Tâches" />

      {/* Main Content */}
      <div className={styles.pageContent}>
      {/* Header section */}
      <div className={styles.pageHeader}>
        <div>
         
          <p className={styles.pageSubtitle}>Gérez vos tâches et le calendrier de vos événements en un coup d'œil.</p>
        </div>
      </div>

        {/* Actions Bar */}
        <div className={styles.actionsBar}>
          <div className={styles.viewModeToggle} role="tablist" aria-label="Modes de vue du planning">
            <button
              className={`${styles.viewModeButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
              role="tab"
              aria-selected={viewMode === 'list'}
              aria-controls="planning-content"
              id="tab-list"
            >
              <List size={18} />
              Liste
            </button>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'calendar' ? styles.active : ''}`}
              onClick={() => setViewMode('calendar')}
              role="tab"
              aria-selected={viewMode === 'calendar'}
              aria-controls="planning-content"
              id="tab-calendar"
            >
              <Calendar size={18} />
              Calendrier
            </button>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'kanban' ? styles.active : ''}`}
              onClick={() => setViewMode('kanban')}
              role="tab"
              aria-selected={viewMode === 'kanban'}
              aria-controls="planning-content"
              id="tab-kanban"
            >
              <Grid3X3 size={18} />
              Kanban
            </button>
          </div>
          <div className={styles.actionButtons}>
            <AIQuotaBadge variant="compact" displayMode="usage" />
            <button
              className={`${styles.addButton} ${styles.aiButton}`}
              onClick={() => setShowAIModal(true)}
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
              className={`${styles.addButton} ${styles.googleButton}`}
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
              title="Exporter toutes les tâches vers Google Calendar"
            >
              <Calendar size={16} />
              Exporter vers Google
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className={styles.stats}>
          <div className={`${styles.statCard} ${styles.completed}`}>
            <div className={styles.statIcon}><CheckCircle size={18} /></div>
            <div className={styles.statContent}>
              <h3>{completedTasks}</h3>
              <p>Terminées</p>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.pending}`}>
            <div className={styles.statIcon}><Circle size={18} /></div>
            <div className={styles.statContent}>
              <h3>{pendingTasks}</h3>
              <p>À faire</p>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.inProgress}`}>
            <div className={styles.statIcon}><Clock size={18} /></div>
            <div className={styles.statContent}>
              <h3>{inProgressTasks}</h3>
              <p>En cours</p>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.overdue}`}>
            <div className={styles.statIcon}><AlertTriangle size={18} /></div>
            <div className={styles.statContent}>
              <h3>{overdueTasks}</h3>
              <p>En retard</p>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.progressStat}`}>
            <div className={styles.statIcon}><Target size={18} /></div>
            <div className={styles.statContent}>
              <h3>{Math.round(progressPercentage)}%</h3>
              <p>Progression</p>
            </div>
          </div>
        </div>

        {/* Barre de progression simplifiée */}
        <div className={styles.progressSection}>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          <p className={styles.progressText}>
            {completedTasks} sur {tasks.length} tâches ({Math.round(progressPercentage)}%)
          </p>
        </div>

        {/* Filtres */}
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.categoryFilter}>
            <Filter size={18} />
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
              <Filter size={18} />
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

            <div className={styles.calendarGrid}>
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                <div key={day} className={styles.calendarDayHeader}>
                  {day}
                </div>
              ))}

              {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => (
                <div key={`empty-${i}`} className={styles.calendarDay} style={{ opacity: 0.3 }} />
              ))}

              {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
                const day = i + 1;
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dayTasks = getTasksForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

                return (
                  <div
                    key={day}
                    className={`${styles.calendarDay} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''} ${dayTasks.length > 0 ? styles.hasTasks : ''}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className={styles.dayNumber}>{day}</span>
                    <div className={styles.dayTasksContainer}>
                      {dayTasks.map(task => (
                        <div
                          key={task.id}
                          className={styles.taskIndicator}
                          style={{ 
                            backgroundColor: getCategoryColor(task.category),
                          }}
                          title={task.title}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Daily tasks section for selected date */}
            {selectedDate && (
              <div className={styles.selectedDateTasks}>
                <div className={styles.selectedDateHeader}>
                  <div className={styles.selectedDateInfo}>
                    <Calendar size={20} />
                    <h3>
                      Tâches du {selectedDate.toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </h3>
                    <span className={styles.taskCountBadge}>
                      {getTasksForDate(selectedDate).length} tâche(s)
                    </span>
                  </div>
                  <button 
                    className={styles.addButton}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, dueDate: getLocalDateString(selectedDate) }));
                      setShowAddTask(true);
                    }}
                  >
                    <Plus size={16} />
                    Ajouter une tâche
                  </button>
                </div>

                <div className={styles.dailyTasksList}>
                  {getTasksForDate(selectedDate).length === 0 ? (
                    <div className={styles.emptyDailyTasks}>
                      <Clock size={32} />
                      <p>Aucune tâche prévue pour ce jour.</p>
                      <button 
                        onClick={() => {
                          setFormData(prev => ({ ...prev, dueDate: getLocalDateString(selectedDate) }));
                          setShowAddTask(true);
                        }}
                      >
                        Planifier une tâche
                      </button>
                    </div>
                  ) : (
                    getTasksForDate(selectedDate).map(task => (
                      <div key={task.id} className={`${styles.taskCard} ${task.status === 'COMPLETED' ? styles.completed : ''}`}>
                        <div className={styles.taskHeader}>
                          <button
                            onClick={() => toggleTaskStatus(task.id)}
                            className={styles.statusButton}
                          >
                            {task.status === 'COMPLETED' ? <CheckCircle size={20} /> : <Circle size={20} />}
                          </button>
                          <div className={styles.taskInfo}>
                            <h4 className={styles.taskTitle}>{task.title}</h4>
                            {task.description && <p className={styles.taskDescription}>{task.description}</p>}
                          </div>
                          <div className={styles.taskActions}>
                            <button onClick={() => handleEditTask(task)} title="Modifier">
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(task)} 
                              title="Supprimer"
                              className={styles.deleteButton}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className={styles.taskMeta}>
                          <span
                            className={styles.categoryLabel}
                            style={{ 
                              backgroundColor: colorMix(getCategoryColor(task.category), 0.1),
                              color: getCategoryColor(task.category) 
                            }}
                          >
                            {getCategoryIcon(task.category)}
                            {categories.find(cat => cat.id === task.category)?.name}
                          </span>
                          <span
                            className={styles.priorityLabel}
                            style={{ color: getPriorityColor(task.priority) }}
                          >
                            {task.priority === 'URGENT' ? 'Urgente' :
                              task.priority === 'HIGH' ? 'Haute' :
                                task.priority === 'MEDIUM' ? 'Moyenne' : 'Basse'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
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
                      className={`${styles.taskCard} ${task.status === 'COMPLETED' ? styles.completed : ''} ${isOverdue ? styles.overdue : ''}`}
                    >
                      <div className={styles.taskHeader}>
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={styles.statusButton}
                        >
                          {task.status === 'COMPLETED' ? (
                            <CheckCircle size={20} />
                          ) : (
                            <Circle size={20} />
                          )}
                        </button>
                        <div className={styles.taskInfo}>
                          <h4 className={styles.taskTitle}>{task.title}</h4>
                          <p className={styles.taskDescription}>{task.description}</p>
                        </div>
                        <div className={styles.taskActions}>
                          {task.dueDate && (
                            <button
                              onClick={() => openGoogleCalendarForTask(task)}
                              title="Ajouter à Google Calendar"
                            >
                              <Calendar size={14} />
                            </button>
                          )}
                          {getTaskActionLink(task) && (
                            <button
                              onClick={() => router.push(getTaskActionLink(task)!)}
                              title="Aller à la page correspondante"
                            >
                              <ExternalLink size={14} />
                            </button>
                          )}
                          <button onClick={() => handleEditTask(task)}>
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(task)}
                            className={styles.deleteButton}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className={styles.taskMeta}>
                        <span
                          className={styles.categoryLabel}
                          style={{ 
                            backgroundColor: colorMix(getCategoryColor(task.category), 0.1),
                            color: getCategoryColor(task.category) 
                          }}
                        >
                          {getCategoryIcon(task.category)}
                          {categories.find(cat => cat.id === task.category)?.name}
                        </span>
                        <span
                          className={styles.priorityLabel}
                          style={{ color: getPriorityColor(task.priority) }}
                        >
                          {task.priority === 'URGENT' ? 'Urgente' :
                            task.priority === 'HIGH' ? 'Haute' :
                              task.priority === 'MEDIUM' ? 'Moyenne' : 'Basse'}
                        </span>
                        {task.dueDate && (
                          <span className={styles.taskDate}>
                            <Calendar size={12} />
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                        {task.dueDate && (() => {
                          const daysUntil = getDaysUntil(task.dueDate);
                          const isOverdue = daysUntil < 0;
                          return (
                            <>
                              {isOverdue && (
                                <span className={styles.overdueBadge}>
                                  Retard {Math.abs(daysUntil)} j
                                </span>
                              )}
                              {!isOverdue && daysUntil <= 7 && (
                                <span className={styles.urgentBadge}>
                                  J-{daysUntil}
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
              {/* À faire */}
              <div
                className={`${styles.kanbanColumn} ${styles.pending} ${draggedOverColumn === 'pending' ? styles.dragOver : ''}`}
                onDragOver={(e) => handleDragOver(e, 'pending')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'pending')}
              >
                <h3>À faire <span>{tasks.filter(t => t.status === 'PENDING').length}</span></h3>
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
                          className={`${styles.kanbanCard} ${isOverdue ? styles.overdue : ''} ${draggedTask?.id === task.id ? styles.dragging : ''}`}
                          draggable
                          onDragStart={() => handleDragStart(task)}
                          onDragEnd={handleDragEnd}
                        >
                          <h4 className={styles.taskTitle}>{task.title}</h4>
                          <p className={styles.taskDescription}>{task.description}</p>
                          <div className={styles.taskMeta}>
                            <span
                              className={styles.categoryLabel}
                              style={{ 
                                backgroundColor: colorMix(getCategoryColor(task.category), 0.1),
                                color: getCategoryColor(task.category) 
                              }}
                            >
                              {getCategoryIcon(task.category)}
                            </span>
                            {task.dueDate && (
                              <span className={styles.taskDate}>
                                {formatDate(task.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* En cours */}
              <div
                className={`${styles.kanbanColumn} ${styles.inProgress} ${draggedOverColumn === 'in_progress' ? styles.dragOver : ''}`}
                onDragOver={(e) => handleDragOver(e, 'in_progress')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'in_progress')}
              >
                <h3>En cours <span>{tasks.filter(t => t.status === 'IN_PROGRESS').length}</span></h3>
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
                          className={`${styles.kanbanCard} ${isOverdue ? styles.overdue : ''} ${draggedTask?.id === task.id ? styles.dragging : ''}`}
                          draggable
                          onDragStart={() => handleDragStart(task)}
                          onDragEnd={handleDragEnd}
                        >
                          <h4 className={styles.taskTitle}>{task.title}</h4>
                          <p className={styles.taskDescription}>{task.description}</p>
                          <div className={styles.taskMeta}>
                            <span
                              className={styles.categoryLabel}
                              style={{ 
                                backgroundColor: colorMix(getCategoryColor(task.category), 0.1),
                                color: getCategoryColor(task.category) 
                              }}
                            >
                              {getCategoryIcon(task.category)}
                            </span>
                             {task.dueDate && (
                              <span className={styles.taskDate}>
                                {formatDate(task.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Terminé */}
              <div
                className={`${styles.kanbanColumn} ${styles.completed} ${draggedOverColumn === 'completed' ? styles.dragOver : ''}`}
                onDragOver={(e) => handleDragOver(e, 'completed')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'completed')}
              >
                <h3>Terminé <span>{tasks.filter(t => t.status === 'COMPLETED').length}</span></h3>
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
                        className={`${styles.kanbanCard} ${styles.completed} ${draggedTask?.id === task.id ? styles.dragging : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                        onDragEnd={handleDragEnd}
                      >
                        <h4 className={styles.taskTitle}>{task.title}</h4>
                        <div className={styles.taskMeta}>
                          <span
                            className={styles.categoryLabel}
                            style={{ 
                              backgroundColor: colorMix(getCategoryColor(task.category), 0.1),
                              color: getCategoryColor(task.category) 
                            }}
                          >
                            {getCategoryIcon(task.category)}
                          </span>
                          <span className={styles.completedBadge}>Terminé</span>
                        </div>
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
                  <label className={styles.formLabel}>
                    <Users size={14} style={{ marginRight: '0.4rem' }} />
                    Événement *
                  </label>
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
                  <label className={styles.formLabel}>
                    <Edit size={14} style={{ marginRight: '0.4rem' }} />
                    Titre *
                  </label>
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
                  <label className={styles.formLabel}>
                    <List size={14} style={{ marginRight: '0.4rem' }} />
                    Description
                  </label>
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
                    <label className={styles.formLabel}>
                      <Grid3X3 size={14} style={{ marginRight: '0.4rem' }} />
                      Catégorie *
                    </label>
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
                    <label className={styles.formLabel}>
                      <AlertCircle size={14} style={{ marginRight: '0.4rem' }} />
                      Priorité *
                    </label>
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
                  <label className={styles.formLabel}>
                    <Calendar size={14} style={{ marginRight: '0.4rem' }} />
                    Date d'échéance
                  </label>
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
            <div className={`${styles.modalContent} ${styles.aiModal}`} onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
              {/* Overlay de chargement - Affiche uniquement le loading */}
              {(aiLoading || isGeneratingChecklist) ? (
                <div className={styles.aiLoadingState}>
                  <Hourglass
                    size={64}
                    className={styles.hourglassAnimation}
                  />
                  <div>
                    <h3 className={styles.aiLoadingTitle}>L'IA prépare votre checklist</h3>
                    <p className={styles.aiLoadingSubtitle}>Veuillez patienter, cela peut prendre quelques instants...</p>
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
                        <div className={styles.emptyState}>
                          <AlertTriangle
                            size={48}
                            style={{ color: '#ef4444' }}
                          />
                          <h3>Aucun événement à venir</h3>
                          <p>Tous vos événements sont déjà passés. Créez un nouvel événement pour générer une checklist.</p>
                        </div>
                      );
                    }

                    const currentSelection = selectedInvitationForAI || (upcomingInvitations.length > 0 ? upcomingInvitations[0].id : '');
                    const selectedInv = invitations.find(inv => inv.id === currentSelection);
                    const isEventPast = selectedInv ? new Date(selectedInv.eventDate) < new Date() : false;

                    if (isEventPast) {
                      return (
                        <div className={styles.emptyState}>
                          <AlertTriangle
                            size={48}
                            style={{ color: '#ef4444' }}
                          />
                          <h3>Impossible de générer une checklist</h3>
                          <p>La date de cet événement est déjà passée. Veuillez sélectionner un événement à venir.</p>
                          {selectedInv && (
                            <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>
                              Date : {new Date(selectedInv.eventDate).toLocaleDateString('fr-FR', {
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
                          <label className={styles.formLabel}>
                            <Users size={14} style={{ marginRight: '0.4rem' }} />
                            Événement *
                          </label>
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
                            <label className={styles.formLabel}>
                              <Users size={14} style={{ marginRight: '0.4rem' }} />
                              Nombre d'invités (optionnel)
                            </label>
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
                            <label className={styles.formLabel}>
                              <Target size={14} style={{ marginRight: '0.4rem' }} />
                              Budget (€) (optionnel)
                            </label>
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
                          <label className={styles.formLabel}>
                             <Sparkles size={14} style={{ marginRight: '0.4rem' }} />
                             Informations supplémentaires (optionnel)
                          </label>
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
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            className={`${styles.submitButton} ${styles.aiButton}`}
                            disabled={aiLoading || isGeneratingChecklist}
                          >
                            <Sparkles size={16} style={{ marginRight: '0.45rem' }} />
                            {(aiLoading || isGeneratingChecklist) ? 'Génération...' : 'Générer la checklist'}
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
          <div className={styles.emptyState} style={{ padding: '1rem 0' }}>
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
                  marginBottom: '1rem'
                }}>
                  <AlertTriangle size={32} color="#ef4444" />
                </div>
                <h3>Erreur d'exportation</h3>
                <p>{googleCalendarInfo.error}</p>
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
                  marginBottom: '1rem'
                }}>
                  <CheckCircle size={32} color="#22c55e" />
                </div>
                <h3>Fichier téléchargé !</h3>
                <p>Google Calendar s'ouvre dans un nouvel onglet.</p>
                <div style={{
                  background: 'var(--bg-secondary, #f3f4f6)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  width: '100%',
                  marginTop: '1rem',
                  textAlign: 'left'
                }}>
                  <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Pour importer vos tâches :</p>
                  <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                    <li>Dans Google Calendar, cliquez sur "Sélectionner un fichier"</li>
                    <li>Choisissez <strong>{googleCalendarInfo?.filename}</strong></li>
                    <li>Cliquez sur "Importer"</li>
                  </ol>
                </div>
                <p style={{ marginTop: '1rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)' }}>
                  Vos {googleCalendarInfo?.taskCount} tâches seront ajoutées !
                </p>
              </>
            )}
            <div style={{ width: '100%', marginTop: '1.5rem' }}>
              <button
                className={styles.submitButton}
                onClick={() => {
                  setShowGoogleCalendarModal(false);
                  setGoogleCalendarInfo(null);
                }}
              >
                {googleCalendarInfo?.error ? 'Fermer' : 'J\'ai compris'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}