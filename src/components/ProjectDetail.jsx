import { useState } from 'react';
import ProgressTracker from './ProgressTracker';
import { EditIcon, UploadIcon, DownloadIcon, VideoIcon, ImageIcon, AudioIcon, DocumentIcon, TrashIcon } from './Icons';
import './ProjectDetail.css';

const ProjectDetail = ({ project, onBack, onUpdateProgress }) => {
    const [notes, setNotes] = useState(project.notes || '');

    const getTypeIcon = (type) => {
        switch (type) {
            case 'video': return <VideoIcon size={20} />;
            case 'image': return <ImageIcon size={20} />;
            case 'audio': return <AudioIcon size={20} />;
            default: return <DocumentIcon size={20} />;
        }
    };

    const mockAssets = project.assets || [
        { id: 1, name: 'intro-scene.mp4', type: 'video', size: '45.2 MB', date: '01.12.2025' },
        { id: 2, name: 'background-music.mp3', type: 'audio', size: '8.5 MB', date: '01.12.2025' },
        { id: 3, name: 'thumbnail.jpg', type: 'image', size: '2.1 MB', date: '30.11.2025' },
    ];

    return (
        <div className="project-detail">
            <div className="detail-header">
                <button className="btn-ghost" onClick={onBack}>
                    ← Zurück
                </button>
                <div className="detail-actions">
                    <button className="btn-secondary">
                        <EditIcon size={18} />
                        Projekt bearbeiten
                    </button>
                    <button className="btn-primary">
                        <UploadIcon size={18} />
                        Assets hochladen
                    </button>
                </div>
            </div>

            <div className="detail-hero card">
                <div className="hero-content">
                    <div className="hero-icon" style={{ background: 'var(--gradient-primary)' }}>
                        {getTypeIcon(project.type)}
                    </div>
                    <div className="hero-info">
                        <h1>{project.name}</h1>
                        <p>{project.description}</p>
                        <div className="hero-meta">
                            <span className="meta-item">
                                <strong>Typ:</strong> {project.type}
                            </span>
                            <span className="meta-item">
                                <strong>Status:</strong> {project.status}
                            </span>
                            <span className="meta-item">
                                <strong>Erstellt:</strong> {new Date(project.createdAt).toLocaleDateString()}
                            </span>
                            <span className="meta-item">
                                <strong>Assets:</strong> {mockAssets.length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="detail-content">
                <div className="detail-main">
                    <div className="section-card card">
                        <h2>Fortschrittsverfolgung</h2>
                        <ProgressTracker progress={project.progress} />
                        <div className="progress-controls">
                            <button
                                className="btn-secondary"
                                onClick={() => onUpdateProgress(project.id, Math.max(0, project.progress - 10))}
                            >
                                -10%
                            </button>
                            <button
                                className="btn-primary"
                                onClick={() => onUpdateProgress(project.id, Math.min(100, project.progress + 10))}
                            >
                                +10%
                            </button>
                        </div>
                    </div>

                    <div className="section-card card">
                        <div className="section-header">
                            <h2>Assets ({mockAssets.length})</h2>
                            <button className="btn-ghost">
                                <UploadIcon size={18} />
                                Assets hinzufügen
                            </button>
                        </div>
                        <div className="assets-list">
                            {mockAssets.map(asset => (
                                <div key={asset.id} className="asset-item">
                                    <div className="asset-icon">
                                        {getTypeIcon(asset.type)}
                                    </div>
                                    <div className="asset-info">
                                        <div className="asset-name">{asset.name}</div>
                                        <div className="asset-meta">{asset.size} • {asset.date}</div>
                                    </div>
                                    <div className="asset-actions">
                                        <button className="btn-ghost icon-btn-sm">
                                            <DownloadIcon size={16} />
                                        </button>
                                        <button className="btn-ghost icon-btn-sm">
                                            <TrashIcon size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="detail-sidebar">
                    <div className="section-card card">
                        <h3>Projektnotizen</h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Notizen zu diesem Projekt hinzufügen..."
                            rows={8}
                        />
                        <button className="btn-primary" style={{ width: '100%', marginTop: 'var(--space-md)' }}>
                            Notizen speichern
                        </button>
                    </div>

                    <div className="section-card card">
                        <h3>Statistiken</h3>
                        <div className="quick-stats">
                            <div className="quick-stat">
                                <span className="stat-label">Fertigstellung</span>
                                <span className="stat-value text-gradient">{project.progress}%</span>
                            </div>
                            <div className="quick-stat">
                                <span className="stat-label">Gesamt Assets</span>
                                <span className="stat-value">{mockAssets.length}</span>
                            </div>
                            <div className="quick-stat">
                                <span className="stat-label">Gesamtgröße</span>
                                <span className="stat-value">55.8 MB</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
