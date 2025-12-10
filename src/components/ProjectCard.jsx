import { VideoIcon, ImageIcon, AudioIcon, DocumentIcon, MoreVerticalIcon, EditIcon, TrashIcon, StarIcon } from './Icons';
import './ProjectCard.css';

import { getProjectType } from '../constants/projectTypes';

const ProjectCard = ({ project, onClick, onEdit, onDelete, onToggleStar }) => {
    const projectTypeConfig = getProjectType(project.type);
    const typeColor = projectTypeConfig?.color || 'var(--color-primary)';

    const getTypeIcon = (type) => {
        // Use icon from config if available (it's a string emoji in config, but let's keep using SVG icons here for consistency if preferred, 
        // OR better: use the config logic or keep specific mapping. 
        // PROJECT_TYPES has emoji icons. The SVG icons are cleaner. Let's keep SVG mapping but use color from config.
        switch (type) {
            case 'video': case 'commercial': return <VideoIcon size={24} />;
            case 'image': case 'cover': return <ImageIcon size={24} />;
            case 'audio': case 'single': case 'album': case 'podcast': return <AudioIcon size={24} />;
            case 'document': case 'kinderbuch': return <DocumentIcon size={24} />;
            default: return <DocumentIcon size={24} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'var(--color-success)';
            case 'in-progress': return 'var(--color-warning)';
            case 'planning': return 'var(--color-secondary)';
            default: return 'var(--color-text-muted)';
        }
    };

    return (
        <div
            className="project-card card"
            onClick={onClick}
            style={{ '--hover-border-color': typeColor }}
        >
            <div className="project-card-header">
                <div
                    className="project-type-icon"
                    style={{
                        color: typeColor,
                        background: `color-mix(in srgb, ${typeColor} 10%, transparent)` // Modern CSS for slight tint
                    }}
                >
                    {getTypeIcon(project.type)}
                </div>
                <div className="project-actions">
                    <button
                        className="btn-ghost icon-btn-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(project.id);
                        }}
                    >
                        <StarIcon size={18} filled={project.starred} color={project.starred ? 'var(--color-warning)' : 'currentColor'} />
                    </button>
                    <div className="dropdown">
                        <button className="btn-ghost icon-btn-sm" onClick={(e) => e.stopPropagation()}>
                            <MoreVerticalIcon size={18} />
                        </button>
                        <div className="dropdown-menu">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(project); }}>
                                <EditIcon size={16} />
                                Edit
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(project.id); }} className="danger">
                                <TrashIcon size={16} />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="project-card-body">
                <h3 className="project-title">{project.name}</h3>
                <p className="project-description">{project.description}</p>

                <div className="project-meta">
                    <span className="project-type" style={{ color: typeColor, background: `color-mix(in srgb, ${typeColor} 10%, transparent)` }}>
                        {projectTypeConfig?.label || project.type}
                    </span>
                    <span className="project-assets">{project.assets?.length || 0} assets</span>
                </div>

                <div className="progress-section">
                    <div className="progress-header">
                        <span className="progress-label">Progress</span>
                        <span className="progress-value">{project.progress}%</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${project.progress}%`,
                                background: typeColor // Use Type Color for progress bar as requested "use distinct colors everywhere"
                            }}
                        ></div>
                    </div>
                </div>

                <div className="project-footer">
                    <span className="status-badge" style={{ background: getStatusColor(project.status) }}>
                        {project.status}
                    </span>
                    <span className="project-date">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
