/**
 * Project Helper Functions
 * Utility functions for project management
 *
 * Built by Claude for Don Key
 */

export function calculateProjectProgress(project) {
  const tasks = project.tasks || [];
  if (tasks.length === 0) return 0;
  
  const completed = tasks.filter(t => t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
}

export function getProjectTypeColor(type) {
  const colors = {
    single: '#8b5cf6',
    album: '#f59e0b',
    kinderbuch: '#10b981',
    commercial: '#ef4444',
    video: '#3b82f6',
    audio: '#06b6d4',
    image: '#ec4899',
    document: '#64748b'
  };
  return colors[type] || '#3b82f6';
}

export function getProjectTypeIcon(type) {
  const icons = {
    single: '🎵',
    album: '💿',
    kinderbuch: '📚',
    commercial: '📢',
    video: '🎬',
    audio: '🎙️',
    image: '📸',
    document: '📄'
  };
  return icons[type] || '📦';
}

export function formatDuration(minutes) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
  return `${minutes}min`;
}

export function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatDateTime(timestamp) {
  return new Date(timestamp).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function generateProjectId() {
  return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateTaskId() {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function sortProjectsByDate(projects, ascending = false) {
  return [...projects].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

export function sortProjectsByProgress(projects, ascending = false) {
  return [...projects].sort((a, b) => {
    const progA = calculateProjectProgress(a);
    const progB = calculateProjectProgress(b);
    return ascending ? progA - progB : progB - progA;
  });
}

export function filterProjectsByType(projects, type) {
  if (type === 'all') return projects;
  return projects.filter(p => p.type === type || p.projectType === type);
}

export function searchProjects(projects, query) {
  const lowerQuery = query.toLowerCase();
  return projects.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    (p.description && p.description.toLowerCase().includes(lowerQuery)) ||
    (p.notes && p.notes.toLowerCase().includes(lowerQuery))
  );
}

export function validateProject(project) {
  const errors = [];
  
  if (!project.name || project.name.trim() === '') {
    errors.push('Project name is required');
  }
  
  if (!project.type && !project.projectType) {
    errors.push('Project type is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function cloneProject(project) {
  return {
    ...project,
    id: generateProjectId(),
    name: `${project.name} (Copy)`,
    createdAt: Date.now(),
    tasks: (project.tasks || []).map(task => ({
      ...task,
      id: generateTaskId(),
      status: 'pending',
      startedAt: null,
      completedAt: null,
      actualTime: null
    }))
  };
}

export function exportProjectToJSON(project) {
  return JSON.stringify(project, null, 2);
}

export function importProjectFromJSON(jsonString) {
  try {
    const project = JSON.parse(jsonString);
    const validation = validateProject(project);
    
    if (!validation.valid) {
      throw new Error(`Invalid project: ${validation.errors.join(', ')}`);
    }
    
    return {
      success: true,
      project
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
