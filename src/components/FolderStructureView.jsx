import React, { useState, useEffect } from 'react';
import SmartRenameModal from './SmartRenameModal';
import './FolderStructureView.css';

const FileIcon = ({ name, isDirectory }) => {
    if (isDirectory) {
        if (name.startsWith('TRACK_')) return <span className="icon">💿</span>;
        if (name === 'STEMS' || name === 'Stems') return <span className="icon">🎹</span>;
        if (name === 'MIXES' || name === 'Mixes') return <span className="icon">🎚️</span>;
        if (name === 'REFERENCES' || name === 'References') return <span className="icon">🔍</span>;
        return <span className="icon">📂</span>;
    }
    if (name.endsWith('.mp3') || name.endsWith('.wav')) return <span className="icon">🎵</span>;
    if (name.endsWith('.mp4') || name.endsWith('.mov')) return <span className="icon">🎬</span>;
    if (name.endsWith('.jpg') || name.endsWith('.png')) return <span className="icon">🖼️</span>;
    if (name.endsWith('.zip') || name.endsWith('.rar')) return <span className="icon">📦</span>;
    return <span className="icon">📄</span>;
};

const FolderItem = ({ path, name, level = 0, onFileClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    const toggleOpen = async () => {
        if (isOpen) {
            setIsOpen(false);
            return;
        }

        setIsOpen(true);

        if (!hasLoaded) {
            setLoading(true);
            try {
                if (window.electron) {
                    const result = await window.electron.invoke('read-dir', path);
                    if (result.success) {
                        // Sort: Directories first, then files
                        const sorted = result.items.sort((a, b) => {
                            if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
                            return a.isDirectory ? -1 : 1;
                        });
                        setItems(sorted);
                        setHasLoaded(true);
                    } else {
                        setError(result.error);
                    }
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="folder-structure-item" style={{ paddingLeft: `${level * 20}px` }}>
            <div className={`item-row ${isOpen ? 'open' : ''}`} onClick={toggleOpen}>
                <span className="arrow">{isOpen ? '▼' : '▶'}</span>
                <FileIcon name={name} isDirectory={true} />
                <span className="folder-name">{name}</span>
            </div>

            {isOpen && (
                <div className="folder-children">
                    {loading && <div className="loading-indicator" style={{ paddingLeft: `${(level + 1) * 20}px` }}>Lade...</div>}
                    {error && <div className="error-message" style={{ paddingLeft: `${(level + 1) * 20}px` }}>Fehler: {error}</div>}

                    {items.map((item) => (
                        item.isDirectory ? (
                            <FolderItem
                                key={item.path}
                                path={item.path}
                                name={item.name}
                                level={level + 1}
                                onFileClick={onFileClick}
                            />
                        ) : (
                            <div
                                key={item.path}
                                className="file-item-row"
                                style={{ paddingLeft: `${(level + 1) * 20 + 20}px` }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFileClick(item);
                                }}
                            >
                                <FileIcon name={item.name} isDirectory={false} />
                                <span className="file-name">{item.name}</span>
                                {item.size && <span className="file-size">{(item.size / 1024).toFixed(1)} KB</span>}
                            </div>
                        )
                    ))}
                    {items.length === 0 && !loading && !error && (
                        <div className="empty-folder" style={{ paddingLeft: `${(level + 1) * 20}px` }}>Leer</div>
                    )}
                </div>
            )}
        </div>
    );
};

const FolderStructureView = ({ project }) => {
    const [rootItems, setRootItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSmartRename, setShowSmartRename] = useState(false);


    // Initial load of the root project folder
    useEffect(() => {
        const loadRoot = async () => {
            if (!project.folder || !window.electron) return;

            setLoading(true);
            try {
                const result = await window.electron.invoke('read-dir', project.folder);
                if (result.success) {
                    const sorted = result.items.sort((a, b) => {
                        if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
                        return a.isDirectory ? -1 : 1;
                    });
                    setRootItems(sorted);
                }
            } catch (e) {
                console.error("Failed to load root", e);
            } finally {
                setLoading(false);
            }
        };
        loadRoot();
    }, [project.folder]);

    const handleFileClick = (file) => {
        if (window.electron && window.electron.openPath) {
            window.electron.openPath(file.path);
        }
    };

    if (!project.folder) return <div className="p-4">Kein Projektordner gefunden.</div>;

    return (
        <div className="folder-structure-view">
            <h3>🗂️ Ordnerstruktur</h3>
            <div className="folder-tree-container">
                {loading && <div>Lade Struktur...</div>}
                {!loading && rootItems.map(item => (
                    item.isDirectory ? (
                        <FolderItem
                            key={item.path}
                            path={item.path}
                            name={item.name}
                            onFileClick={handleFileClick}
                        />
                    ) : (
                        <div
                            key={item.path}
                            className="file-item-row root-file"
                            onClick={() => handleFileClick(item)}
                        >
                            <FileIcon name={item.name} isDirectory={false} />
                            <span className="file-name">{item.name}</span>
                            {item.size && <span className="file-size">{(item.size / 1024).toFixed(1)} KB</span>}
                        </div>
                    )
                ))}
            </div>

            {showSmartRename && (
                <SmartRenameModal
                    project={project}
                    onClose={() => setShowSmartRename(false)}
                    onFinish={() => {
                        setShowSmartRename(false);
                        // Trigger reload essentially by forcing effect? 
                        // For now just close, user can collapse/expand or we can add reload logic later.
                        // Actually, let's just create a quick reload trigger
                        setLoading(true);
                        setTimeout(() => setLoading(false), 100);
                    }}
                />
            )}
        </div>
    );
};

export default FolderStructureView;
