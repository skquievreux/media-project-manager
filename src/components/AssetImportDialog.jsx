import { useState, useEffect } from 'react';
import './AssetImportDialog.css';

const ASSET_TYPES = [
    { id: 'track', label: 'Track', folder: 'Audio/Tracks' },
    { id: 'master', label: 'Master', folder: 'Audio/Master' },
    { id: 'vocal', label: 'Vocal Take', folder: 'Audio/Vocals' },
    { id: 'beat', label: 'Beat / Instrumental', folder: 'Audio/Beats' },
    { id: 'cover', label: 'Cover Art', folder: 'Images/Cover' },
    { id: 'social', label: 'Social Media', folder: 'Images/Social' },
    { id: 'campaign', label: 'Kampagne / Marketing', folder: 'Marketing' }, // New Category
    { id: 'lyrics', label: 'Lyrics', folder: 'Docs' },
    { id: 'contract', label: 'Contract', folder: 'Docs/Legal' },
    { id: 'other', label: 'Other', folder: 'Misc' }
];

const AssetImportDialog = ({ files, project, onSave, onCancel }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedType, setSelectedType] = useState('track');
    const [customName, setCustomName] = useState('');
    const [version, setVersion] = useState(1);

    // Detect Rename Mode
    const isRenameMode = files[0]?.isRenameMode;

    // New Metadata State
    const [acronym, setAcronym] = useState(() => {
        // Initialize acronym from project name (First letters or first 4 chars)
        const clean = project.name.replace(/[^a-zA-Z0-9 ]/g, '');
        const words = clean.split(' ').filter(w => w.length > 0);
        let abbr = '';
        if (words.length > 1) {
            abbr = words.map(w => w[0]).join('').toUpperCase();
        } else {
            abbr = clean.substring(0, 4).toUpperCase();
        }
        return abbr || 'PROJ';
    });

    const [trackNumber, setTrackNumber] = useState('');
    const [tag, setTag] = useState('');

    // Process current file
    const currentFile = files[currentIndex];

    // Generate filename preview
    const generateFilename = () => {
        if (!currentFile) return '';
        const ext = currentFile.name.split('.').pop();

        // Special handling for Campaign Layouts
        // If it's a campaign asset and we have a relative path, we want to keep the folder structure
        // e.g. "platform-teasers/image.png" -> "Marketing/Social/platform-teasers/ACRONYM_image.png"
        // But the folder logic is handled in handleNext. Here we construct the file NAME.
        // Actually, renaming deeply nested files might be complex.
        // Let's stick to standard naming but if 'campaign', maybe we don't rename as aggressively?

        let parts = [];

        // 1. Acronym (Always good)
        parts.push(acronym.replace(/[^a-zA-Z0-9]/g, ''));

        // 2. Track Number
        if (trackNumber) {
            parts.push(trackNumber.toString().padStart(2, '0'));
        }

        // 3. Name part
        let namePart = customName.replace(/[^a-zA-Z0-9]/g, '');
        if (!namePart) {
            namePart = currentFile.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, '');
        }
        parts.push(namePart);

        // 4. Tag
        if (tag) {
            parts.push(tag.replace(/[^a-zA-Z0-9]/g, ''));
        }

        // 5. Version
        parts.push(`v${version}`);

        return `${parts.join('_')}.${ext}`;
    };

    const handleNext = () => {
        const typeConfig = ASSET_TYPES.find(t => t.id === selectedType);
        let newFilename = generateFilename();
        let targetFolder = typeConfig.folder;

        // SMART CAMPAIGN LOGIC
        // If we have relativePath (from Zip), append the subfolder structure
        if (selectedType === 'campaign' && currentFile.relativePath) {
            // relativePath is like "subfolder/file.png" or just "file.png"
            const dir = currentFile.relativePath.replace(/\\/g, '/').split('/').slice(0, -1).join('/');
            if (dir && dir !== '.') {
                targetFolder = `${targetFolder}/${dir}`;
            }
        }

        // Pass result back
        const result = {
            originalFile: currentFile,
            type: selectedType,
            category: typeConfig.folder.split('/')[0].toLowerCase(),
            folder: targetFolder, // Dynamically adjusted folder
            newFilename: newFilename,
            // Extra Metadata
            acronym,
            trackNumber: trackNumber ? parseInt(trackNumber) : null,
            tag,
            version
        };

        if (currentIndex < files.length - 1) {
            // Move to next (simplified for now to just finish one by one or bulk same settings)
            // User requested bulk but the dialog is single-step wizard.
            // We'll leave it as is for now: User clicks "Import" for each file in queue.
            // Ideally we'd have "Apply to All" but that's a bigger feature.
            // For now we just call onSave which pops the queue in parent.
            onSave(result);
        } else {
            onSave(result);
        }
    };

    // Auto-detect type based on extension
    useEffect(() => {
        if (!currentFile) return;
        const ext = currentFile.name.split('.').pop().toLowerCase();
        if (['mp3', 'wav', 'aiff'].includes(ext)) setSelectedType('track');
        if (['jpg', 'png', 'jpeg'].includes(ext)) setSelectedType('cover');

        // Reset fields but KEEP Acronym (it's project wide usually)
        setCustomName('');
        setVersion(1);
        setTrackNumber('');
        setTag('');
    }, [currentFile]);

    if (!currentFile) return null;

    return (
        <div className="asset-import-dialog-overlay">
            <div className="asset-import-dialog">
                <div className="dialog-header">
                    <h2>{isRenameMode ? 'Smart Rename' : 'Smart Import'} ({currentIndex + 1}/{files.length})</h2>
                    <div className="dialog-steps">
                        {files.map((_, i) => (
                            <div key={i} className={`step-indicator ${i === currentIndex ? 'active' : ''}`} />
                        ))}
                    </div>
                </div>

                <div className="dialog-content">
                    <div className="file-preview">
                        <div className="file-icon">
                            {['mp3', 'wav'].some(e => currentFile.name.toLowerCase().endsWith(e)) ? '🎵' : '📄'}
                        </div>
                        <div className="file-details">
                            <div className="file-name-original">{currentFile.name}</div>
                            <div className="file-size">{(currentFile.size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                    </div>

                    <div className="naming-form">

                        {/* Row 1: Acronym & Track Number */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Album Kürzel</label>
                                <input
                                    type="text"
                                    value={acronym}
                                    onChange={(e) => setAcronym(e.target.value.toUpperCase())}
                                    style={{ padding: '8px', borderRadius: '4px', background: '#0f172a', border: '1px solid #334155', color: '#fff', width: '100%', textTransform: 'uppercase' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Track Nr.</label>
                                <select
                                    value={trackNumber}
                                    onChange={(e) => setTrackNumber(e.target.value)}
                                    style={{ padding: '8px', borderRadius: '4px', background: '#0f172a', border: '1px solid #334155', color: '#fff', width: '100%' }}
                                >
                                    <option value="">-- Keine --</option>
                                    {Array.from({ length: 22 }, (_, i) => i + 1).map(num => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Kategorie</label>
                            <div className="type-grid">
                                {ASSET_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        className={`type-btn ${selectedType === type.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedType(type.id)}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Row 2: Title & Tag */}
                        <div className="form-group">
                            <label>Titel / Name</label>
                            <input
                                type="text"
                                placeholder={currentFile.name.split('.')[0]} // Hint original name
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                className="asset-input"
                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
                            />
                        </div>

                        <div className="form-group">
                            <label>Tag (z.B. Instrumental, Clean, Alt)</label>
                            <input
                                type="text"
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                className="asset-input"
                                placeholder="Tag hinzufügen..."
                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
                            />
                        </div>

                        <div className="form-group">
                            <label>Version</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={version}
                                    onChange={(e) => setVersion(parseInt(e.target.value))}
                                    style={{ flex: 1 }}
                                />
                                <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>v{version}</span>
                            </div>
                        </div>

                        <div className="preview-box">
                            <span className="preview-label">Dateiname Vorschau</span>
                            <div className="filename-result">{generateFilename()}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                                Ziel: {ASSET_TYPES.find(t => t.id === selectedType).folder}/
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dialog-actions">
                    <button className="btn-cancel" onClick={onCancel}>Abbrechen</button>
                    <button className="btn-import" onClick={handleNext}>
                        {currentIndex < files.length - 1 ? 'Nächste Datei' : (isRenameMode ? 'Umbenennen' : 'Importieren')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssetImportDialog;
