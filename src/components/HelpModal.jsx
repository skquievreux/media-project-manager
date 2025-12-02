import { useState } from 'react';
import changelogData from '../changelog.json';
import './HelpModal.css';

const HelpModal = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('features');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Hilfe & Informationen</h2>
                    <button className="modal-close btn-ghost" onClick={onClose}>×</button>
                </div>

                <div className="modal-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
                        onClick={() => setActiveTab('features')}
                    >
                        Features
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'changelog' ? 'active' : ''}`}
                        onClick={() => setActiveTab('changelog')}
                    >
                        Version Log
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                        onClick={() => setActiveTab('about')}
                    >
                        Über
                    </button>
                </div>

                <div className="modal-body">
                    {activeTab === 'features' && (
                        <div className="features-list">
                            <h3>🚀 Erweiterte Feature-Liste</h3>

                            <div className="feature-item">
                                <h4>Projekt-Management</h4>
                                <p>Erstellen, Bearbeiten und Organisieren von Medienprojekten. Kategorisierung nach Video, Audio, Bild und Dokumenten.</p>
                            </div>

                            <div className="feature-item">
                                <h4>Fortschritts-Tracking</h4>
                                <p>Detaillierte Verfolgung des Projektstatus von der Planung bis zur Fertigstellung mit visuellen Fortschrittsbalken.</p>
                            </div>

                            <div className="feature-item">
                                <h4>Asset-Verwaltung</h4>
                                <p>Zentraler Ort für alle Projektdateien. Unterstützt Drag & Drop (geplant) und Metadaten-Anzeige.</p>
                            </div>

                            <div className="feature-item">
                                <h4>Automatisierung (Vorschau)</h4>
                                <p>Automatische Thumbnail-Generierung und Batch-Uploads für effizientere Workflows.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'changelog' && (
                        <div className="changelog">
                            {changelogData.versions.map((version, index) => (
                                <div key={index} className="version-entry">
                                    <div className="version-header">
                                        <span className={`version-tag ${version.type}`}>{version.version}</span>
                                        <span className="version-date">{new Date(version.date).toLocaleDateString('de-DE')}</span>
                                    </div>
                                    <ul>
                                        {version.changes.map((change, i) => (
                                            <li key={i}>
                                                <span className="change-type">[{change.type.toUpperCase()}]</span> {change.text}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="about-section">
                            <h3>Media Project Manager</h3>
                            <p>Ein modernes Tool zur Verwaltung von Medienproduktionen.</p>
                            <p>Entwickelt mit React, Vite und Electron.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
