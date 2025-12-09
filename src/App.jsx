import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectDetailView from './components/ProjectDetailView';
import Footer from './components/Footer';
import HelpModal from './components/HelpModal';
import SettingsModal from './components/SettingsModal';

import TemplatesView from './components/TemplatesView';
import { getDefaultTasks } from './constants/projectTypes';
import './App.css';

function App() {
  // Sample project data in German
  const [projects, setProjects] = useState([]);

  const [activeProject, setActiveProject] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'project', 'templates'
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // Track if initial load is done

  // Load projects on startup
  useEffect(() => {
    if (window.electron) {
      window.electron.loadProjects().then(result => {
        if (result.success && result.projects) {
          setProjects(result.projects);
        } else {
          // Fallback to sample data if no file exists
          setProjects([
            { id: 1, name: 'Produkt-Launch Video', description: 'Marketing-Video für die neue Produktlinie', type: 'video', status: 'in-progress', progress: 65, createdAt: '2025-11-28', starred: true, assets: [], notes: '' },
            { id: 2, name: 'Podcast Episode 42', description: 'Interview mit Experten', type: 'audio', status: 'in-progress', progress: 80, createdAt: '2025-11-30', starred: false, assets: [], notes: '' },
            { id: 3, name: 'Marken-Fotoshooting', description: 'Fotoshooting für Webseite', type: 'image', status: 'completed', progress: 100, createdAt: '2025-11-25', starred: true, assets: [], notes: '' }
          ]);
        }
        setIsLoaded(true);
      }).catch(err => {
        console.error('Failed to load projects:', err);
        setIsLoaded(true);
      });
    } else {
      setIsLoaded(true);
    }
  }, []);

  // Save projects on change (only after initial load)
  useEffect(() => {
    if (isLoaded && window.electron) {
      window.electron.saveProjects(projects).catch(err => {
        console.error('Failed to save projects:', err);
      });
    }
  }, [projects, isLoaded]);

  // Filter projects based on type and search query
  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || project.type === filter;
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Create new project (or import)
  const handleNewProject = async (projectData) => {
    // If called from a click event or without data, show templates view
    if (!projectData || projectData.nativeEvent) {
      setCurrentView('templates');
      return;
    }

    if (projectData) {
      // Check for duplicates
      // Case 1: Import existing project (has path)
      if (projectData.path) {
        const exists = projects.some(p => p.path === projectData.path);
        if (exists) {
          alert('Dieses Projekt wurde bereits importiert.');
          return;
        }
      }

      // Prepare new project
      let newProject = { ...projectData };

      // Case 2: New Project from Template (no path yet) - Ensure unique name
      if (!projectData.path) {
        let uniqueName = newProject.name;
        let counter = 1;
        while (projects.some(p => p.name === uniqueName)) {
          uniqueName = `${newProject.name} (${counter})`;
          counter++;
        }
        newProject.name = uniqueName;
      }

      // Ensure basic fields exist if coming from simple template selection
      if (!newProject.id) newProject.id = Date.now();
      if (!newProject.status) newProject.status = 'planning';
      if (!newProject.progress) newProject.progress = 0;
      if (!newProject.createdAt) newProject.createdAt = new Date().toISOString().split('T')[0];
      if (!newProject.starred) newProject.starred = false;
      if (!newProject.assets) newProject.assets = [];
      if (!newProject.notes) newProject.notes = '';

      // Add default tasks if not present (although TemplatesView provides title/type, it might not provide full tasks structure yet? 
      // Actually TemplatesView only provides { type, name }. We need to populate tasks here.)
      if (!newProject.tasks && newProject.type) {
        newProject.tasks = getDefaultTasks(newProject.type);
      }

      // Scan for resources if running in Electron and path is provided
      if (window.electron && projectData.path) {
        try {
          const result = await window.electron.scanProjectResources(projectData.path);
          if (result.success) {
            newProject.assets = result.assets;
            newProject.notes = `${newProject.notes}\n\n${result.assets.length} Ressourcen gefunden.`;
          }
        } catch (error) {
          console.error('Failed to scan resources:', error);
        }
      }

      setProjects(prev => [newProject, ...prev]);
      setActiveProject(newProject);
      setCurrentView('project');
    }
  };

  // Edit project
  const handleEditProject = (project) => {
    const newName = prompt('Neuen Projektnamen eingeben:', project.name);
    if (newName && newName.trim()) {
      setProjects(projects.map(p =>
        p.id === project.id ? { ...p, name: newName.trim() } : p
      ));
      if (activeProject?.id === project.id) {
        setActiveProject({ ...activeProject, name: newName.trim() });
      }
    }
  };

  // Delete project
  const handleDeleteProject = (projectId) => {
    if (confirm('Möchtest du dieses Projekt wirklich löschen?')) {
      const newProjects = projects.filter(p => p.id !== projectId);
      setProjects(newProjects);

      if (activeProject?.id === projectId) {
        setActiveProject(null);
        setCurrentView('dashboard');
      }
    }
  };

  // Toggle star
  const handleToggleStar = (projectId) => {
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, starred: !p.starred } : p
    ));
    if (activeProject?.id === projectId) {
      setActiveProject({ ...activeProject, starred: !activeProject.starred });
    }
  };

  // Update progress
  const handleUpdateProgress = (projectId, newProgress) => {
    const clampedProgress = Math.max(0, Math.min(100, newProgress));
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, progress: clampedProgress } : p
    ));
    if (activeProject?.id === projectId) {
      setActiveProject({ ...activeProject, progress: clampedProgress });
    }
  };

  // Update project (for ProjectDetailView)
  const handleUpdateProject = (updatedProject) => {
    setProjects(projects.map(p =>
      p.id === updatedProject.id ? updatedProject : p
    ));
    setActiveProject(updatedProject);
  };

  // Select project
  const handleSelectProject = (project) => {
    if (!project) {
      setActiveProject(null);
      setCurrentView('dashboard');
      return;
    }

    // Add default tasks if project doesn't have any
    if (!project.tasks || project.tasks.length === 0) {
      const defaultTasks = getDefaultTasks(project.type);
      project = { ...project, tasks: defaultTasks };
    }
    setActiveProject(project);
    setCurrentView('project');
  };

  // Search
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleLogoClick = () => {
    setActiveProject(null);
    setCurrentView('dashboard');
  };

  return (
    <div className="app">
      <Header
        onNewProject={handleNewProject}
        onSearch={handleSearch}
        onSettings={() => setShowSettings(true)}
        onLogoClick={handleLogoClick}
      />

      <div className="app-body">
        <Sidebar
          projects={filteredProjects}
          activeProject={activeProject}
          currentView={currentView}
          onSelectProject={handleSelectProject}
          onNavigate={setCurrentView}
          onNewProject={() => handleNewProject(null)}
          filter={filter}
          onFilterChange={setFilter}
        />

        <main className="app-main">
          {currentView === 'dashboard' && (
            <Dashboard
              projects={filteredProjects}
              onSelectProject={handleSelectProject}
              onNewProject={handleNewProject}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              onToggleStar={handleToggleStar}
            />
          )}

          {currentView === 'project' && activeProject && (
            <ProjectDetailView
              project={activeProject}
              onBack={() => {
                setActiveProject(null);
                setCurrentView('dashboard');
              }}
              onUpdateProject={handleUpdateProject}
            />
          )}

          {currentView === 'templates' && (
            <TemplatesView
              onNewProject={handleNewProject}
            />
          )}
        </main>
      </div>

      <Footer />

      {/* Help Button fixed in bottom right or integrated elsewhere */}
      <button
        className="help-fab btn-primary"
        onClick={() => setShowHelp(true)}
        title="Hilfe & Info"
      >
        ?
      </button>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
