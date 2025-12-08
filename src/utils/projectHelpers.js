import { PROJECT_TYPES } from '../constants/projectTypes';

/**
 * Project Helper Functions
 * Utility functions for project management
 *
 * Built by Claude for Don Key
 */

export function generateProjectName(typeId, data) {
  const date = new Date().toISOString().split('T')[0];
  const typeLabel = PROJECT_TYPES[typeId]?.label || 'Project';
  return `${date}_${typeLabel}_${data.name || 'Untitled'}`.replace(/[^a-zA-Z0-9-_]/g, '_');
}

export function generateFolderPath(typeId, data, basePath = 'C:\\MediaProjects') {
  const name = generateProjectName(typeId, data);
  return `${basePath}\\${name}`;
}

export function generateTasksFromType(typeId) {
  const type = PROJECT_TYPES[typeId];
  if (!type || !type.defaultTasks) return [];

  return type.defaultTasks.map(task => ({
    ...task,
    id: `${task.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    actualTime: 0,
    history: []
  }));
}

export function calculateProjectStats(project) {
  if (!project || !project.tasks) return null;

  const tasks = project.tasks;
  const completed = tasks.filter(t => t.status === 'completed');
  const totalEstimated = tasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
  const totalActual = completed.reduce((sum, t) => sum + (t.actualTime || 0), 0);
  const efficiency = totalActual > 0 ? (totalEstimated / totalActual) * 100 : 100;

  return {
    total: tasks.length,
    completed: completed.length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    totalEstimated,
    totalActual,
    efficiency: Math.round(efficiency),
    progress: tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0
  };
}

export function downloadFile(content, filename, contentType) {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function exportProjectToCSV(project) {
  const headers = ['Task', 'Status', 'Estimated (min)', 'Actual (min)', 'Notes'];
  const rows = project.tasks.map(t => [
    t.label,
    t.status,
    t.estimatedTime,
    t.actualTime || 0,
    t.notes || ''
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function generateReadmeContent(project) {
  const stats = calculateProjectStats(project);
  return `# ${project.name}
  
Type: ${project.type}
Created: ${new Date(project.createdAt).toLocaleDateString()}

## Status
Tasks: ${stats.completed}/${stats.total}
Progress: ${stats.progress}%
`;
}

export function getFolderStructure(typeId) {
  // Simple default structure
  return [
    '01_Input',
    '02_Production',
    '03_Output',
    '04_Assets',
    '99_Archive'
  ];
}

export function generatePowerShellScript(path, structure) {
  const folders = structure.map(f => `New-Item -ItemType Directory -Force -Path "${path}\\${f}"`).join('\n');
  return `# Create folder structure
${folders}
Write-Host "Folders created at ${path}"
`;
}

export function executePowerShell(script) {
  // Mock function as we can't execute arbitrary PS from browser easily without IPC
  // In a real scenario, this would send an IPC message to Electron
  console.log('Executing PowerShell logic via IPC (mock):', script);
  return Promise.resolve({ success: true });
}

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
