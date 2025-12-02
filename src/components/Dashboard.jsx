import { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import { GridIcon, PlusIcon, VideoIcon, ImageIcon, AudioIcon, DocumentIcon, DownloadIcon } from './Icons';
import './Dashboard.css';

const Dashboard = ({ projects, onSelectProject, onNewProject, onEditProject, onDeleteProject, onToggleStar }) => {
    const [downloads, setDownloads] = useState([]);
    const [loadingDownloads, setLoadingDownloads] = useState(false);

    useEffect(() => {
        // Check if running in Electron
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            setLoadingDownloads(true);
            ipcRenderer.invoke('scan-projects').then(result => {
                if (result.success) {
                    setDownloads(result.projects);
                } else {
                    console.error('Error scanning projects:', result.error);
                }
                setLoadingDownloads(false);
            }).catch(err => {
                console.error('IPC error:', err);
                setLoadingDownloads(false);
            });
        }
    }, []);

    const handleImportProject = (scannedProject) => {
        // Convert scanned project to app project format
        const newProject = {
            id: Date.now(), // Generate new ID
            name: scannedProject.name, // Use 'name' to match App.jsx
            description: `Importiert aus ${scannedProject.path}`,
            type: scannedProject.type === 'bilder' ? 'image' : scannedProject.type, // Map types
            status: 'active',
            progress: 0,
            createdAt: new Date().toISOString().split('T')[0],
            isFavorite: false,
            assets: [],
            notes: `Pfad: ${scannedProject.path}`
        };

        onNewProject(newProject);
    };

    const handleManualScan = async () => {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            setLoadingDownloads(true);
            try {
                const result = await ipcRenderer.invoke('select-scan-folder');
                if (result.success && result.projects) {
                    // Add newly found projects to the list (avoid duplicates)
                    setDownloads(prev => {
                        const existingIds = new Set(prev.map(p => p.id));
                        const newProjects = result.projects.filter(p => !existingIds.has(p.id));
                        return [...newProjects, ...prev];
                    });
                }
            } catch (error) {
                console.error('Manual scan failed:', error);
            }
            setLoadingDownloads(false);
        }
    };

    const stats = [
        {
            label: 'Gesamt Projekte',
            value: projects.length,
            icon: <GridIcon size={24} />,
            color: 'var(--color-primary)'
        },
        {
            label: 'Video Projekte',
            value: projects.filter(p => p.type === 'video').length,
            icon: <VideoIcon size={24} />,
            color: 'var(--color-secondary)'
        },
        {
            label: 'Bild Projekte',
            value: projects.filter(p => p.type === 'image').length,
            icon: <ImageIcon size={24} />,
            color: 'var(--color-accent)'
        },
        {
            label: 'Audio Projekte',
            value: projects.filter(p => p.type === 'audio').length,
            icon: <AudioIcon size={24} />,
            color: 'var(--color-success)'
        }
    ];

    const avgProgress = projects.length > 0
        ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
        : 0;

    const recentProjects = [...projects]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Verwalte deine Medienprojekte und verfolge den Fortschritt</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={handleManualScan} title="Ordner manuell scannen">
                        <DocumentIcon size={20} />
                        Scan...
                    </button>
                    <button className="btn-primary" onClick={() => onNewProject(null)}>
                        <PlusIcon size={20} />
                        Neues Projekt
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card card animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="stat-icon" style={{ color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid-layout">
                <div className="dashboard-main-col">
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2>Aktuelle Projekte</h2>
                            {projects.length > 6 && (
                                <button className="btn-ghost">Alle anzeigen</button>
                            )}
                        </div>

                        {projects.length === 0 ? (
                            <div className="empty-dashboard">
                                <div className="empty-icon">
                                    <GridIcon size={64} />
                                </div>
                                <h3>Noch keine Projekte</h3>
                                <p>Erstelle dein erstes Medienprojekt, um loszulegen</p>
                                <button className="btn-primary" onClick={() => onNewProject(null)}>
                                    <PlusIcon size={20} />
                                    Projekt erstellen
                                </button>
                            </div>
                        ) : (
                            <div className="projects-grid">
                                {recentProjects.map((project, index) => (
                                    <div key={project.id} className="animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                                        <ProjectCard
                                            project={project}
                                            onClick={() => onSelectProject(project)}
                                            onEdit={onEditProject}
                                            onDelete={onDeleteProject}
                                            onToggleStar={onToggleStar}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard-side-col">
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2>Gesamtfortschritt</h2>
                        </div>
                        <div className="overall-progress card">
                            <div className="progress-info">
                                <div>
                                    <h3>Durchschnitt</h3>
                                    <p>{projects.length} Projekte</p>
                                </div>
                                <div className="progress-percentage-large">
                                    <span className="text-gradient">{avgProgress}%</span>
                                </div>
                            </div>
                            <div className="progress-bar-large">
                                <div
                                    className="progress-fill-large"
                                    style={{ width: `${avgProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2>Gefundene Projekte</h2>
                            <button
                                className="btn-ghost"
                                onClick={() => window.location.reload()}
                                title="Neu scannen"
                            >
                                ↻
                            </button>
                        </div>
                        <div className="downloads-list card">
                            {loadingDownloads ? (
                                <div className="loading-state">Scanne nach Projekten...</div>
                            ) : downloads.length > 0 ? (
                                <div className="file-list-compact">
                                    {downloads.map((proj, i) => (
                                        <div key={i} className="file-item-compact">
                                            <div className="file-icon" style={{
                                                color: proj.type === 'album' || proj.type === 'song' ? 'var(--color-success)' :
                                                    proj.type === 'commercial' ? 'var(--color-secondary)' :
                                                        proj.type === 'bilder' ? 'var(--color-accent)' : 'var(--color-primary)'
                                            }}>
                                                {proj.type === 'album' || proj.type === 'song' ? <AudioIcon size={16} /> :
                                                    proj.type === 'commercial' ? <VideoIcon size={16} /> :
                                                        proj.type === 'bilder' ? <ImageIcon size={16} /> : <GridIcon size={16} />}
                                            </div>
                                            <div className="file-info">
                                                <div className="file-name" title={proj.name}>{proj.name}</div>
                                                <div className="file-meta">
                                                    <span className="badge-sm">{proj.type.toUpperCase()}</span> • {proj.details}
                                                </div>
                                            </div>
                                            <button
                                                className="btn-ghost icon-btn-sm"
                                                title="Importieren"
                                                onClick={() => handleImportProject(proj)}
                                            >
                                                <PlusIcon size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state-small">
                                    Keine Projekte gefunden.
                                    <br />
                                    <small>(Erwarte Ordner wie "Album-Name")</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
