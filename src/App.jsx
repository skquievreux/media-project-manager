import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectDetailView from './components/ProjectDetailView';
import Footer from './components/Footer';
import HelpModal from './components/HelpModal';
import { getDefaultTasks } from './constants/projectTypes';
import './App.css';

function App() {
  // Sample project data in German
  const [projects, setProjects] = useState([]);

  const [activeProject, setActiveProject] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);
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
    if (projectData) {
      // Check for duplicates based on path or name
      const exists = projects.some(p => p.path === projectData.path || p.name === projectData.name);
      if (exists) {
        alert('Dieses Projekt wurde bereits importiert.');
        return;
      }

      // Import existing project
      let newProject = { ...projectData };

      // Scan for resources if running in Electron
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
    } else {
      // Create new random project (legacy/demo mode)
      const projectTypes = ['video', 'audio', 'image', 'document'];
      const statuses = ['planning', 'in-progress', 'completed'];
      const randomType = projectTypes[Math.floor(Math.random() * projectTypes.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      const newProject = {
        id: Date.now(),
        name: `Neues ${randomType.charAt(0).toUpperCase() + randomType.slice(1)} Projekt`,
        description: 'Klicken zum Bearbeiten der Beschreibung und Details',
        type: randomType,
        status: randomStatus,
        progress: 0,
        createdAt: new Date().toISOString().split('T')[0],
        starred: false,
        assets: [],
        notes: ''
      };

      setProjects([newProject, ...projects]);
      setActiveProject(newProject);
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
      setProjects(projects.filter(p => p.id !== projectId));
      if (activeProject?.id === projectId) {
        setActiveProject(null);
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
    // Add default tasks if project doesn't have any
    if (!project.tasks || project.tasks.length === 0) {
      const defaultTasks = getDefaultTasks(project.type);
      project = { ...project, tasks: defaultTasks };
    }
    setActiveProject(project);
  };

  // Search
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="app">
      <Header
        onNewProject={handleNewProject}
        onSearch={handleSearch}
      />

      <div className="app-body">
        <Sidebar
          projects={filteredProjects}
          activeProject={activeProject}
          onSelectProject={handleSelectProject}
          onNewProject={handleNewProject}
          filter={filter}
          onFilterChange={setFilter}
        />

        <main className="app-main">
          {activeProject ? (
            <ProjectDetailView
              project={activeProject}
              onBack={() => setActiveProject(null)}
              onUpdateProject={handleUpdateProject}
            />
          ) : (
            <Dashboard
              projects={filteredProjects}
              onSelectProject={handleSelectProject}
              onNewProject={handleNewProject}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              onToggleStar={handleToggleStar}
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
    </div>
  );
}

export default App;
