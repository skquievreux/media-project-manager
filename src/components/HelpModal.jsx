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
                                <h4>📂 Smart Import & Drag & Drop</h4>
                                <p>Ziehen Sie Dateien oder ganze <b>Zip-Pakete</b> einfach in den blauen Bereich. Zip-Dateien werden automatisch entpackt, sortiert und können in einem Rutsch kategorisiert werden. Dateien werden dabei <b>verschoben</b> (nicht kopiert), um Ihre Downloads sauber zu halten.</p>
                            </div>

                            <div className="feature-item">
                                <h4>👁️ Intelligenter Ordner-Wächter</h4>
                                <p>Aktivieren Sie den <b>Downloader Watcher</b> (das Augen-Symbol), um Ihren Download-Ordner zu überwachen. Neue Dateien (z.B. von Suno oder Splice) werden sofort erkannt und zum Import angeboten.</p>
                            </div>

                            <div className="feature-item">
                                <h4>📣 Kampagnen-Support</h4>
                                <p>Importieren Sie Zip-Archive mit komplexen Ordnerstrukturen (z.B. "Social Media Blitz"). Wählen Sie als Kategorie <b>"Kampagne / Marketing"</b>, und die App behält die Unterordner bei (z.B. <code>Marketing/Teasers/reel.mp4</code>).</p>
                            </div>

                            <div className="feature-item">
                                <h4>🏷️ Smart Rename & Struktur</h4>
                                <p>Assets werden automatisch nach Ihrem Projektnamen und Kürzel benannt (z.B. <code>PROJ_Track_01_v1.mp3</code>). Mit "Smart Rename" können Sie bestehende Dateien jederzeit sauber neu benennen und einsortieren.</p>
                            </div>

                            <div className="feature-item">
                                <h4>🏗️ Ordnerstruktur & Vorlagen</h4>
                                <p>Visualisieren Sie Ihre Projektstruktur als Baum (Tree View) oder als Grid. Nutzen Sie Vorlagen (Album, Single, Podcast), um Projekte mit vordefinierten Aufgabenlisten zu starten.</p>
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
        </div >
    );
};

export default HelpModal;
