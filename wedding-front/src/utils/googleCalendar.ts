/**
 * Utilitaires pour exporter les tâches vers Google Calendar
 */

import { TodoItem } from '@/lib/api/todos';

/**
 * Génère un fichier .ics (iCalendar) à partir d'une liste de tâches
 * Ce fichier peut être importé dans Google Calendar, Outlook, Apple Calendar, etc.
 */
export function generateICSFile(tasks: TodoItem[]): string {
  const now = new Date();
  const timestamp = formatICSDate(now);
  
  // Filtrer uniquement les tâches avec une date d'échéance
  const tasksWithDates = tasks.filter(task => task.dueDate);
  
  // Générer les événements pour chaque tâche
  const events = tasksWithDates.map(task => {
    const dueDate = new Date(task.dueDate!);
    const endDate = new Date(dueDate);
    endDate.setHours(dueDate.getHours() + 1); // Durée par défaut : 1 heure
    
    const icsDate = formatICSDate(dueDate);
    const icsEndDate = formatICSDate(endDate);
    const createdDate = task.createdAt ? formatICSDate(new Date(task.createdAt)) : timestamp;
    const updatedDate = task.updatedAt ? formatICSDate(new Date(task.updatedAt)) : timestamp;
    
    // Échapper les caractères spéciaux pour le format ICS
    const title = escapeICS(task.title);
    const description = escapeICS(task.description || '');
    const category = escapeICS(task.category || '');
    const priority = getICSPriority(task.priority);
    
    // Générer un UID unique pour chaque événement
    const uid = `${task.id}@kawepla.com`;
    
    return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${timestamp}
DTSTART:${icsDate}
DTEND:${icsEndDate}
SUMMARY:${title}
DESCRIPTION:${description}\\n\\nCatégorie: ${category}\\nPriorité: ${task.priority}
LOCATION:
PRIORITY:${priority}
STATUS:${task.status === 'COMPLETED' ? 'CONFIRMED' : 'TENTATIVE'}
CREATED:${createdDate}
LAST-MODIFIED:${updatedDate}
END:VEVENT`;
  }).join('\n');
  
  // Générer le contenu complet du fichier .ics
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Kawepla//Planning Tasks//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Planning Kawepla
X-WR-TIMEZONE:Europe/Paris
${events}
END:VCALENDAR`;
  
  return icsContent;
}

/**
 * Formate une date au format ICS (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Échappe les caractères spéciaux pour le format ICS
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Convertit la priorité de la tâche en priorité ICS (0-9)
 */
function getICSPriority(priority: string): number {
  switch (priority) {
    case 'URGENT':
      return 1; // Priorité la plus élevée
    case 'HIGH':
      return 3;
    case 'MEDIUM':
      return 5;
    case 'LOW':
      return 7;
    default:
      return 5;
  }
}

/**
 * Télécharge un fichier .ics
 */
export function downloadICSFile(icsContent: string, filename: string = 'kawepla-planning.ics'): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporte les tâches vers Google Calendar
 * Télécharge le fichier .ics et ouvre Google Calendar
 * Retourne les informations pour afficher dans une modal
 */
export function exportToGoogleCalendar(tasks: TodoItem[]): { 
  success: boolean; 
  filename?: string; 
  taskCount?: number; 
  error?: string;
} {
  const tasksWithDates = tasks.filter(task => task.dueDate);
  
  if (tasksWithDates.length === 0) {
    return {
      success: false,
      error: 'Aucune tâche avec date d\'échéance à exporter.'
    };
  }
  
  // Télécharger le fichier .ics
  const icsContent = generateICSFile(tasks);
  const filename = `kawepla-planning-${new Date().toISOString().split('T')[0]}.ics`;
  downloadICSFile(icsContent, filename);
  
  // Ouvrir Google Calendar dans un nouvel onglet
  setTimeout(() => {
    window.open('https://calendar.google.com/calendar/u/0/r/settings/export', '_blank');
  }, 100);
  
  return {
    success: true,
    filename,
    taskCount: tasksWithDates.length
  };
}

/**
 * Génère une URL Google Calendar pour ajouter un événement directement
 * (Alternative : ouvre Google Calendar avec les détails pré-remplis)
 */
export function generateGoogleCalendarURL(task: TodoItem): string {
  if (!task.dueDate) {
    throw new Error('La tâche doit avoir une date d\'échéance');
  }
  
  const dueDate = new Date(task.dueDate);
  const endDate = new Date(dueDate);
  endDate.setHours(dueDate.getHours() + 1);
  
  // Formater les dates pour Google Calendar (YYYYMMDDTHHMMSSZ)
  const formatDate = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: task.title,
    dates: `${formatDate(dueDate)}/${formatDate(endDate)}`,
    details: task.description || '',
    location: '',
    sf: 'true',
    output: 'xml'
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Ouvre Google Calendar avec une tâche pré-remplie
 * Retourne true si succès, false si erreur
 */
export function openGoogleCalendarForTask(task: TodoItem): { success: boolean; error?: string } {
  try {
    const url = generateGoogleCalendarURL(task);
    window.open(url, '_blank');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'ouverture de Google Calendar'
    };
  }
}

