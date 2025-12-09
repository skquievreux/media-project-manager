import { useState } from 'react';
import { HomeIcon, FolderIcon, FilterIcon, PlusIcon, GridIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';
import { PROJECT_TYPES } from '../constants/projectTypes';
import './Sidebar.css';

const Sidebar = ({ projects, activeProject, currentView, onSelectProject, onNavigate, onNewProject, filter, onFilterChange }) => {
    const [showAllFilters, setShowAllFilters] = useState(false);

    // Get all available types from constants + 'all'
    const allTypes = ['all', ...Object.keys(PROJECT_TYPES)];

    // Determine which types to show
    // Always show 'all' (index 0) + next 3 items by default
    const visibleTypes = showAllFilters ? allTypes : allTypes.slice(0, 4);

    const getLabel = (type) => {
        if (type === 'all') return 'Alle';
        return PROJECT_TYPES[type]?.label || type.charAt(0).toUpperCase() + type.slice(1);
    };

    return (
        <aside className="sidebar glass">
            <div className="sidebar-content">
                <div className="sidebar-section">
                    <button
                        className={`sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`}
                        onClick={() => onNavigate('dashboard')}
                    >
                        <HomeIcon size={20} />
                        <span>Dashboard</span>
                    </button>
                    <button
                        className={`sidebar-item ${currentView === 'templates' ? 'active' : ''}`}
                        onClick={() => onNavigate('templates')}
                    >
                        <GridIcon size={20} />
                        <span>Smart Templates</span>
                    </button>
                </div>

                <div className="sidebar-section">
                    <div className="sidebar-header">
                        <h3>Filter</h3>
                    </div>
                    <div className="filter-buttons">
                        {visibleTypes.map(type => (
                            <button
                                key={type}
                                className={`filter-btn ${filter === type ? 'active' : ''}`}
                                onClick={() => onFilterChange(type)}
                            >
                                {getLabel(type)}
                            </button>
                        ))}

                        {allTypes.length > 4 && (
                            <button
                                className="filter-toggle-btn"
                                onClick={() => setShowAllFilters(!showAllFilters)}
                            >
                                {showAllFilters ? (
                                    <>
                                        <ChevronUpIcon size={14} /> Weniger anzeigen
                                    </>
                                ) : (
                                    <>
                                        <ChevronDownIcon size={14} /> Mehr anzeigen
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="sidebar-section">
                    <div className="sidebar-header">
                        <h3>Projekte</h3>
                        <button className="btn-ghost icon-btn-sm" onClick={onNewProject}>
                            <PlusIcon size={16} />
                        </button>
                    </div>
                    <div className="project-list">
                        {projects.length === 0 ? (
                            <div className="empty-state">
                                <p>Keine Projekte</p>
                            </div>
                        ) : (
                            projects.map(project => (
                                <button
                                    key={project.id}
                                    className={`sidebar-item ${activeProject?.id === project.id ? 'active' : ''}`}
                                    onClick={() => onSelectProject(project)}
                                >
                                    <FolderIcon size={18} />
                                    <span>{project.name}</span>
                                    {project.starred && <span className="star">★</span>}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
