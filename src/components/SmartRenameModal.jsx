
import React, { useState } from 'react';
import './SmartRenameModal.css';

const SmartRenameModal = ({ project, onClose, onFinish }) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [changes, setChanges] = useState(null);
    const [executing, setExecuting] = useState(false);
    const [results, setResults] = useState(null);

    const startAnalysis = async () => {
        setAnalyzing(true);
        try {
            if (window.electron && project.folder) {
                const result = await window.electron.invoke('analyze-project-structure', project.folder);
                if (result.success) {
                    setChanges(result.changes);
                } else {
                    alert('Fehler bei Analyse: ' + result.error);
                }
            }
        } catch (e) {
            alert('Fehler: ' + e.message);
        } finally {
            setAnalyzing(false);
        }
    };

    const execute = async () => {
        if (!changes || changes.length === 0) return;
        setExecuting(true);
        try {
            const result = await window.electron.invoke('execute-renames', changes);
            if (result.success) {
                setResults(result);
                if (onFinish) onFinish(); // Refresh parent
            } else {
                alert('Fehler: ' + result.error);
            }
        } catch (e) {
            alert('Execute Error: ' + e.message);
        } finally {
            setExecuting(false);
        }
    };

    return (
        <div className="smart-rename-modal-overlay">
            <div className="smart-rename-modal">
                <div className="modal-header">
                    <h2>🪄 Smart Organize & Rename</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {!changes && !results && (
                        <div className="start-screen">
                            <p>Dieses Tool analysiert den Projektordner und schlägt Umbenennungen vor, um eine einheitliche Struktur zu schaffen.</p>
                            <p><strong>Regeln:</strong></p>
                            <ul>
                                <li>Dateien in <code>TRACK_XX</code> erhalten den Prefix "Track XX - "</li>
                                <li>Dateien im Hauptordner erhalten den Projektnamen als Prefix</li>
                            </ul>
                            <button className="btn-primary" onClick={startAnalysis} disabled={analyzing}>
                                {analyzing ? 'Analyse läuft...' : '🔍 Analyse starten'}
                            </button>
                        </div>
                    )}

                    {changes && !results && (
                        <div className="preview-screen">
                            <h3>Vorschau ({changes.length} Änderungen)</h3>
                            {changes.length === 0 ? (
                                <p className="success-msg">✅ Alles sieht gut aus! Keine Änderungen nötig.</p>
                            ) : (
                                <div className="changes-list">
                                    {changes.map((change, i) => (
                                        <div key={i} className="change-item">
                                            <div className="folder-tag">{change.folder}</div>
                                            <div className="rename-row">
                                                <span className="old">{change.oldName}</span>
                                                <span className="arrow">➜</span>
                                                <span className="new">{change.newName}</span>
                                            </div>
                                            <div className="reason-tag">{change.reason}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="actions">
                                <button className="btn-secondary" onClick={onClose}>Abbrechen</button>
                                {changes.length > 0 && (
                                    <button className="btn-primary" onClick={execute} disabled={executing}>
                                        {executing ? 'Vorgang läuft...' : '🚀 Alle anwenden'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {results && (
                        <div className="results-screen">
                            <h3>Fertig!</h3>
                            <p>✅ {results.processed} Dateien erfolgreich umbenannt.</p>
                            {results.errors.length > 0 && (
                                <div className="error-list">
                                    <h4>Fehler:</h4>
                                    <ul>
                                        {results.errors.map((err, i) => <li key={i}>{err}</li>)}
                                    </ul>
                                </div>
                            )}
                            <button className="btn-primary" onClick={onClose}>Schließen</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SmartRenameModal;
