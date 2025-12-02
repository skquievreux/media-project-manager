import { VideoIcon, ImageIcon, AudioIcon, DocumentIcon, MoreVerticalIcon, EditIcon, TrashIcon, StarIcon } from './Icons';
import './ProjectCard.css';

const ProjectCard = ({ project, onClick, onEdit, onDelete, onToggleStar }) => {
    const getTypeIcon = (type) => {
        switch (type) {
            case 'video': return <VideoIcon size={24} />;
            case 'image': return <ImageIcon size={24} />;
            case 'audio': return <AudioIcon size={24} />;
            case 'document': return <DocumentIcon size={24} />;
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
        <div className="project-card card" onClick={onClick}>
            <div className="project-card-header">
                <div className="project-type-icon" style={{ color: getStatusColor(project.status) }}>
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
                        <StarIcon size={18} filled={project.starred} />
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
                    <span className="project-type">{project.type}</span>
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
                                background: getStatusColor(project.status)
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
