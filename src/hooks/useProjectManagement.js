import { useState, useEffect, useCallback } from 'react';
import { 
  generateProjectName,
  generateFolderPath,
  generateTasksFromType,
  calculateProjectStats,
  generateReadmeContent,
  getFolderStructure,
  generatePowerShellScript,
  executePowerShell,
  exportProjectToJSON,
  exportProjectToCSV,
  downloadFile
} from '../utils/projectHelpers';

/**
 * useProjectManagement Hook
 * Complete project management with tasks, stats, and automation
 * 
 * Features:
 * - Project CRUD operations
 * - Task tracking and timer
 * - Statistics calculation
 * - Folder automation
 * - Export functionality
 * 
 * Built by Claude for Don Key
 */
function useProjectManagement(initialProjects = []) {
  const [projects, setProjects] = useState(initialProjects);
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load projects from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mediaProjectManager_projects');
      if (saved) {
        setProjects(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Fehler beim Laden der Projekte');
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('mediaProjectManager_projects', JSON.stringify(projects));
    } catch (err) {
      console.error('Failed to save projects:', err);
    }
  }, [projects]);

  // ============================================================================
  // PROJECT OPERATIONS
  // ============================================================================

  /**
   * Create new project
   */
  const createProject = useCallback(async (typeId, data, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const projectName = generateProjectName(typeId, data);
      const folderPath = generateFolderPath(typeId, data, options.basePath);
      const tasks = generateTasksFromType(typeId);

      const newProject = {
        id: Date.now(),
        name: projectName,
        projectType: typeId,
        type: data.type || 'media',
        description: data.description || '',
        metadata: data,
        folder: options.createFolder ? folderPath : null,
        tasks: tasks,
        assets: [],
        notes: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        progress: 0,
        status: 'active'
      };

      // Create folder if requested
      if (options.createFolder) {
        const structure = getFolderStructure(typeId);
        const script = generatePowerShellScript(folderPath, structure);
        
        const result = await executePowerShell(script);
        
        if (!result.success && result.script) {
          // Provide script for manual execution
          newProject.folderScript = result.script;
        }

        // Create README
        const readme = generateReadmeContent(newProject);
        newProject.readme = readme;
      }

      setProjects(prev => [newProject, ...prev]);
      setActiveProject(newProject);
      setLoading(false);

      return newProject;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Update project
   */
  const updateProject = useCallback((projectId, updates) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, ...updates, updatedAt: Date.now() }
        : p
    ));

    if (activeProject?.id === projectId) {
      setActiveProject(prev => ({ ...prev, ...updates, updatedAt: Date.now() }));
    }
  }, [activeProject]);

  /**
   * Delete project
   */
  const deleteProject = useCallback((projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    
    if (activeProject?.id === projectId) {
      setActiveProject(null);
    }
  }, [activeProject]);

  /**
   * Duplicate project
   */
  const duplicateProject = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const duplicate = {
      ...project,
      id: Date.now(),
      name: `${project.name} (Kopie)`,
      tasks: project.tasks.map(t => ({
        ...t,
        status: 'pending',
        startedAt: null,
        completedAt: null,
        actualTime: null
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      progress: 0
    };

    setProjects(prev => [duplicate, ...prev]);
  }, [projects]);

  // ============================================================================
  // TASK OPERATIONS
  // ============================================================================

  /**
   * Start task timer
   */
  const startTask = useCallback((projectId, taskId) => {
    updateProject(projectId, {
      tasks: projects.find(p => p.id === projectId)?.tasks.map(t =>
        t.id === taskId
          ? { ...t, status: 'in_progress', startedAt: Date.now() }
          : t
      )
    });
  }, [projects, updateProject]);

  /**
   * Complete task
   */
  const completeTask = useCallback((projectId, taskId, actualTime, notes = '') => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedTasks = project.tasks.map(t =>
      t.id === taskId
        ? {
            ...t,
            status: 'completed',
            completedAt: Date.now(),
            actualTime: actualTime || t.estimatedTime,
            notes: notes || t.notes
          }
        : t
    );

    const stats = calculateProjectStats({ ...project, tasks: updatedTasks });

    updateProject(projectId, {
      tasks: updatedTasks,
      progress: stats.progress
    });
  }, [projects, updateProject]);

  // ============================================================================
  // STATISTICS
  // ============================================================================

  /**
   * Get project statistics
   */
  const getProjectStats = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    return calculateProjectStats(project);
  }, [projects]);

  /**
   * Get global statistics
   */
  const getGlobalStats = useCallback(() => {
    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.progress === 100).length,
      
      totalTasks: 0,
      completedTasks: 0,
      totalTimeEstimated: 0,
      totalTimeActual: 0,
      
      byType: {}
    };

    projects.forEach(project => {
      const projectStats = calculateProjectStats(project);
      
      stats.totalTasks += projectStats.total;
      stats.completedTasks += projectStats.completed;
      stats.totalTimeEstimated += projectStats.totalEstimated;
      stats.totalTimeActual += projectStats.totalActual;

      // Group by type
      const type = project.projectType || 'other';
      if (!stats.byType[type]) {
        stats.byType[type] = { count: 0, completed: 0 };
      }
      stats.byType[type].count++;
      if (project.progress === 100) {
        stats.byType[type].completed++;
      }
    });

    // Calculate efficiency
    stats.efficiency = stats.totalTimeActual > 0
      ? Math.round((stats.totalTimeEstimated / stats.totalTimeActual) * 100)
      : 100;

    return stats;
  }, [projects]);

  // ============================================================================
  // EXPORT
  // ============================================================================

  /**
   * Export project as JSON
   */
  const exportProjectJSON = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const json = exportProjectToJSON(project);
    downloadFile(json, `${project.name}.json`, 'application/json');
  }, [projects]);

  /**
   * Export project as CSV
   */
  const exportProjectCSV = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const csv = exportProjectToCSV(project);
    downloadFile(csv, `${project.name}_tasks.csv`, 'text/csv');
  }, [projects]);

  /**
   * Export all projects
   */
  const exportAllProjects = useCallback(() => {
    const json = exportProjectToJSON(projects);
    const date = new Date().toISOString().split('T')[0];
    downloadFile(json, `media_projects_${date}.json`, 'application/json');
  }, [projects]);

  // ============================================================================
  // SEARCH & FILTER
  // ============================================================================

  /**
   * Search projects
   */
  const searchProjects = useCallback((query) => {
    const lowerQuery = query.toLowerCase();
    return projects.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.notes.toLowerCase().includes(lowerQuery)
    );
  }, [projects]);

  /**
   * Filter projects by type
   */
  const filterByType = useCallback((typeId) => {
    return projects.filter(p => p.projectType === typeId);
  }, [projects]);

  /**
   * Filter projects by status
   */
  const filterByStatus = useCallback((status) => {
    return projects.filter(p => p.status === status);
  }, [projects]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    projects,
    activeProject,
    loading,
    error,
    
    // Setters
    setActiveProject,
    
    // Project Operations
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    
    // Task Operations
    startTask,
    completeTask,
    
    // Statistics
    getProjectStats,
    getGlobalStats,
    
    // Export
    exportProjectJSON,
    exportProjectCSV,
    exportAllProjects,
    
    // Search & Filter
    searchProjects,
    filterByType,
    filterByStatus
  };
}

export default useProjectManagement;
