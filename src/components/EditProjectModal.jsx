import React, { useState, useEffect } from 'react';
import './EditProjectModal.css';

function EditProjectModal({ project, onClose, onSave }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (project) {
            setName(project.name);
        }
    }, [project]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Der Projektname darf nicht leer sein.');
            return;
        }
        onSave(project, name.trim());
    };

    if (!project) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content edit-project-modal" onClick={e => e.stopPropagation()}>
                <h2>Projekt bearbeiten</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Projektname</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            className="large-input"
                            placeholder="Projektname eingeben..."
                        />
                    </div>

                    <div className="project-meta-info">
                        <p><strong>Typ:</strong> {project.type || 'Projekt'}</p>
                        <p><strong>Pfad:</strong> <span style={{ fontFamily: 'monospace' }}>{project.path || 'Noch nicht erstellt'}</span></p>
                        <p className="info-hint">
                            Hinweis: Das Umbenennen ändert auch den Ordnernamen auf der Festplatte.
                        </p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Abbrechen</button>
                        <button type="submit" className="btn-save">Speichern</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditProjectModal;
