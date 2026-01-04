import { useState } from 'react';
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

    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        // Minimal feedback
        console.log(`Dropping ${files.length} files into ${project.name}`);

        for (const file of files) {
            let filePath = file.path;
            try {
                if (!filePath && window.electron && window.electron.getFilePath) {
                    filePath = window.electron.getFilePath(file);
                }
            } catch (e) { console.error(e); }

            if (window.electron && project.path && filePath) {
                try {
                    const result = await window.electron.moveFile(filePath, project.path);
                    if (result.success) {
                        // Notify parent to refresh assets if possible, or just let the user know
                        console.log(`Moved ${file.name} to ${project.name}`);
                    } else {
                        alert(`Fehler beim Verschieben zu ${project.name}: ${result.error}`);
                    }
                } catch (err) {
                    alert(`Fehler: ${err.message}`);
                }
            } else {
                alert("Drag & Drop funktioniert nur mit der Electron-App und existierenden Projektpfaden.");
            }
        }

        // Optional: Trigger a refresh if passed a callback, but for now this moves the files which is the request.
    };

    return (
        <div
            className={`project-card card ${isDragging ? 'is-dragging-over' : ''}`}
            onClick={onClick}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={isDragging ? { borderColor: 'var(--color-accent)', boxShadow: '0 0 15px var(--color-accent)' } : {}}
        >
            {isDragging && (
                <div className="card-drop-overlay" style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 'inherit', backdropFilter: 'blur(2px)'
                }}>
                    <span style={{ fontSize: '2rem' }}>📂</span>
                    <span style={{ color: 'white', fontWeight: 'bold', marginTop: '10px' }}>In "{project.name}" verschieben</span>
                </div>
            )}
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
