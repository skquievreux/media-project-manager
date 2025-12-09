import { useState, useEffect } from 'react';
import { PROJECT_TYPES } from '../constants/projectTypes';
import TaskTracker from './TaskTracker';
import FileDropZone from './FileDropZone';
import SmartPrompts from './SmartPrompts';
import './ProjectDetailView.css';

function ProjectDetailView({ project, onBack, onUpdateProject }) {
  const [activeTab, setActiveTab] = useState('tasks');
  const [notes, setNotes] = useState(project.notes || '');
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [promptType, setPromptType] = useState('suno');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  // Debug log to ensure HMR update
  console.log('Rendering ProjectDetailView', { projectId: project.id, isEditingTitle });

  const projectType = PROJECT_TYPES[project.projectType] || PROJECT_TYPES[project.type] || {};
  const stats = calculateProjectStats();

  // Helper for opening files via Electron
  const openExternal = (path) => {
    if (window.electron && window.electron.openPath) {
      // Convert media:// back to file path if needed, or just send the raw path
      const cleanPath = path.replace('media://', '');
      window.electron.openPath(cleanPath);
    } else {
      window.open(path, '_blank');
    }
  };

  // Auto-scan project resources on mount or when path changes
  useEffect(() => {
    if (window.electron && project.path) {
      window.electron.scanProjectResources(project.path).then(result => {
        if (result.success && result.assets) {
          const scannedAssets = result.assets;
          let hasChanges = false;

          // Create a map of existing assets for quick lookup
          const existingAssetsMap = new Map((project.assets || []).map(a => [a.name, a]));

          // Build new assets list
          const mergedAssets = [...(project.assets || [])];

          scannedAssets.forEach(scannedAsset => {
            const existing = existingAssetsMap.get(scannedAsset.name);
            if (existing) {
              // Update URL if it changed (e.g. from file:// to media://)
              if (existing.url !== scannedAsset.url) {
                const index = mergedAssets.findIndex(a => a.name === scannedAsset.name);
                if (index !== -1) {
                  mergedAssets[index] = { ...existing, url: scannedAsset.url };
                  hasChanges = true;
                }
              }
            } else {
              // Add new asset
              mergedAssets.push(scannedAsset);
              hasChanges = true;
            }
          });

          if (hasChanges) {
            onUpdateProject({
              ...project,
              assets: mergedAssets
            });
          }
        }
      });
    }
  }, [project.path]);

  function calculateProjectStats() {
    const tasks = project.tasks || [];
    const completed = tasks.filter(t => t.status === 'completed').length;
    const total = tasks.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    const totalEstimated = tasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
    const totalActual = tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.actualTime || 0), 0);

    return {
      progress,
      completed,
      total,
      totalEstimated,
      totalActual,
      efficiency: totalActual > 0 ? Math.round((totalEstimated / totalActual) * 100) : 100
    };
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${minutes}min`;
  };

  const handleSaveNotes = () => {
    onUpdateProject({ ...project, notes });
  };

  const handleAddAsset = (assetUrl, assetName, assetType) => {
    const newAsset = { id: Date.now(), name: assetName, url: assetUrl, type: assetType, addedAt: Date.now() };
    const updatedAssets = [...(project.assets || []), newAsset];
    onUpdateProject({ ...project, assets: updatedAssets });
    setShowAddAsset(false);
  };

  const handleDeleteAsset = (assetId) => {
    if (confirm('Asset wirklich löschen?')) {
      const updatedAssets = (project.assets || []).filter(a => a.id !== assetId);
      onUpdateProject({ ...project, assets: updatedAssets });
    }
  };

  const openFolder = () => {
    if (project.folder) window.open(`file:///${project.folder}`, '_blank');
  };

  const getSafeUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('http')) return url;

    // Normalize string to use forward slashes (fixes Windows backslash issues in src attributes)
    let clean = url.replace(/\\/g, '/');

    // Already has protocol? Safe to return unless it needs fixing?
    if (clean.startsWith('media://')) {
      // Ensure we don't have broken slashes if needed, usually media://C:/ is fine if backend handles it
      // Check if we need to ensure triple slash for standard compliance if normalization fails
      return clean;
    }

    if (clean.startsWith('file://')) {
      return clean.replace('file://', 'media://');
    }

    // Windows drive path (C:/...) -> media://C:/...
    // Some browsers prefer media:///C:/... for local scheme, lets be safe with standard protocol format
    if (clean.match(/^[a-zA-Z]:/)) {
      return `media:///${clean}`;
    }

    // Unix path
    if (clean.startsWith('/') && !clean.startsWith('//')) {
      return `media://${clean}`;
    }

    return clean;
  };

  const circleLength = 2 * Math.PI * 52;
  const progressOffset = circleLength * (1 - stats.progress / 100);

  return (
    <div className="project-detail-view">
      <div className="detail-header">
        <button className="btn-back" onClick={onBack}>← Zurück</button>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => {
            const defaultTasks = projectType.defaultTasks || [];
            const existingLabels = new Set((project.tasks || []).map(t => t.label));
            const newTasks = defaultTasks.filter(t => !existingLabels.has(t.label));

            if (newTasks.length === 0) {
              alert('Alle Standard-Tasks für dieses Template sind bereits vorhanden.');
              return;
            }

            if (window.confirm(`${newTasks.length} neue Tasks aus dem Template hinzufügen?`)) {
              onUpdateProject({
                ...project,
                tasks: [...(project.tasks || []), ...newTasks]
              });
            }
          }}>
            🪄 Smart Template anwenden
          </button>
          <button className="btn-folder" onClick={openFolder} disabled={!project.folder}>📁 Ordner öffnen</button>
        </div>
      </div>

      <div className="hero-section" style={{ '--type-color': projectType.color || '#3b82f6' }}>
        <div className="hero-icon">{projectType.icon || '📦'}</div>
        <div className="hero-content">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={() => {
                if (titleInput.trim() !== project.name) {
                  onUpdateProject({ ...project, name: titleInput.trim() });
                }
                setIsEditingTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (titleInput.trim() !== project.name) {
                    onUpdateProject({ ...project, name: titleInput.trim() });
                  }
                  setIsEditingTitle(false);
                } else if (e.key === 'Escape') {
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="project-title-input"
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                background: 'transparent',
                border: 'none',
                borderBottom: '2px solid var(--type-color, #3b82f6)',
                color: 'white',
                width: '100%',
                marginBottom: '0.5rem',
                outline: 'none'
              }}
            />
          ) : (
            <h1
              className="project-title"
              onClick={() => {
                setTitleInput(project.name);
                setIsEditingTitle(true);
              }}
              title="Klicken zum Bearbeiten"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {project.name} <span style={{ fontSize: '0.5em', opacity: 0.5 }}>✏️</span>
            </h1>
          )}
          <div className="project-meta">
            <span className="meta-item">{projectType.label || project.type}</span>
            <span className="meta-item">Erstellt: {formatDate(project.createdAt)}</span>
            {project.folder && <span className="meta-item folder-path">📁 {project.folder}</span>}
          </div>
          {project.description && <p className="project-description">{project.description}</p>}
        </div>
        <div className="hero-stats">
          <div className="stat-circle">
            <svg className="progress-ring" width="120" height="120">
              <circle className="progress-ring-circle-bg" stroke="#334155" strokeWidth="8" fill="transparent" r="52" cx="60" cy="60" />
              <circle className="progress-ring-circle" stroke={projectType.color || '#3b82f6'} strokeWidth="8" fill="transparent" r="52" cx="60" cy="60" strokeDasharray={circleLength} strokeDashoffset={progressOffset} />
              <text x="60" y="60" textAnchor="middle" dy="7" className="progress-text">{stats.progress}%</text>
            </svg>
          </div>
          <div className="stat-details">
            <div className="stat-row"><span className="stat-label">Tasks:</span><span className="stat-value">{stats.completed}/{stats.total}</span></div>
            <div className="stat-row"><span className="stat-label">Zeit:</span><span className="stat-value">{formatTime(stats.totalActual || stats.totalEstimated)}</span></div>
            <div className="stat-row"><span className="stat-label">Effizienz:</span><span className={`stat-value ${stats.efficiency >= 90 ? 'good' : stats.efficiency >= 70 ? 'ok' : 'bad'}`}>{stats.efficiency}%</span></div>
          </div>
        </div>
      </div>

      <div className="detail-tabs">
        <button className={`tab ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>📋 Tasks</button>
        <button className={`tab ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveTab('assets')}>📁 Assets ({(project.assets || []).length})</button>
        <button className={`tab ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>📊 Timeline</button>
        <button className={`tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>📝 Notizen</button>
        <button className={`tab ${activeTab === 'prompts' ? 'active' : ''}`} onClick={() => setActiveTab('prompts')}>✨ AI Prompts</button>
        <button className={`tab ${activeTab === 'links' ? 'active' : ''}`} onClick={() => setActiveTab('links')}>🔗 Quick Links</button>
      </div>

      <div className="tab-content">
        {activeTab === 'tasks' && <TaskTracker project={project} onUpdateProject={onUpdateProject} />}
        {activeTab === 'assets' && (
          <div className="assets-panel">
            <div className="assets-header">
              <h3>📁 Project Assets</h3>
              <button className="btn-add-asset" onClick={() => setShowAddAsset(true)}>+ Asset hinzufügen</button>
            </div>

            {/* Smart Prompts Integration in Assets */}
            <div className="assets-prompts-section">
              <SmartPrompts project={project} type="suno" />
            </div>

            {/* File Drop Zone */}
            <FileDropZone
              project={project}
              onFileUpload={(asset) => {
                const newAsset = { ...asset, addedAt: Date.now() };
                const updatedAssets = [...(project.assets || []), newAsset];
                onUpdateProject({ ...project, assets: updatedAssets });
              }}
            />

            {showAddAsset && (
              <div className="add-asset-form">
                <input type="text" placeholder="Asset Name" id="asset-name" />
                <input type="text" placeholder="Asset URL/Path" id="asset-url" />
                <select id="asset-type">
                  <option value="audio">🎵 Audio</option>
                  <option value="image">🖼️ Bild</option>
                  <option value="video">🎬 Video</option>
                  <option value="document">📄 Dokument</option>
                  <option value="other">📦 Sonstiges</option>
                </select>
                <button onClick={() => { const name = document.getElementById('asset-name').value; const url = document.getElementById('asset-url').value; const type = document.getElementById('asset-type').value; if (name && url) handleAddAsset(url, name, type); }}>Speichern</button>
                <button onClick={() => setShowAddAsset(false)}>Abbrechen</button>
              </div>
            )}
            <div className="assets-grid">
              {(project.assets || []).map(asset => (
                <div key={asset.id} className="asset-card">
                  <div className="asset-preview">
                    {asset.type === 'image' && <img src={getSafeUrl(asset.url)} alt={asset.name} className="asset-preview-img" loading="lazy" />}
                    {asset.type === 'video' && <video src={getSafeUrl(asset.url)} controls className="asset-preview-video" />}
                    {asset.type === 'audio' && <audio src={getSafeUrl(asset.url)} controls className="asset-preview-audio" />}
                    {asset.type !== 'image' && asset.type !== 'video' && asset.type !== 'audio' && (
                      <div className="asset-icon-large">
                        {asset.type === 'document' && '📄'}
                        {asset.type === 'other' && '📦'}
                      </div>
                    )}
                  </div>
                  <div className="asset-info"><div className="asset-name">{asset.name}</div><div className="asset-date">{formatDate(asset.addedAt)}</div></div>
                  <div className="asset-actions">
                    <button onClick={() => openExternal(asset.url)}>Öffnen</button>
                    <button onClick={() => handleDeleteAsset(asset.id)}>🗑️</button>
                  </div>
                </div>
              ))}
              {(project.assets || []).length === 0 && <div className="empty-state"><span className="empty-icon">📁</span><p>Noch keine Assets hinzugefügt</p></div>}
            </div>
          </div>
        )}
        {activeTab === 'timeline' && (
          <div className="timeline-panel">
            <h3>📊 Project Timeline</h3>
            <div className="timeline">
              {(project.tasks || []).map(task => (
                <div key={task.id} className={`timeline-item ${task.status}`}>
                  <div className="timeline-marker">{task.status === 'completed' && '✅'}{task.status === 'in_progress' && '⏳'}{task.status === 'pending' && '⏸️'}{task.status === 'skipped' && '⏭️'}</div>
                  <div className="timeline-content"><div className="timeline-title">{task.label}</div>{task.completedAt && <div className="timeline-date">{formatDate(task.completedAt)}</div>}{task.actualTime && <div className="timeline-time">{formatTime(task.actualTime)}</div>}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'notes' && (
          <div className="notes-panel">
            <h3>📝 Project Notes</h3>
            <textarea className="notes-editor" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notizen zu diesem Projekt..." />
            <button className="btn-save-notes" onClick={handleSaveNotes}>💾 Notizen speichern</button>
          </div>
        )}
        {activeTab === 'prompts' && (
          <div className="prompts-panel">
            <h3>✨ AI Prompt Generator</h3>
            <div className="prompt-type-selector" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button className={`btn-filter ${promptType === 'suno' ? 'active' : ''}`} onClick={() => setPromptType('suno')}>🎵 Musik</button>
              <button className={`btn-filter ${promptType === 'cover' ? 'active' : ''}`} onClick={() => setPromptType('cover')}>🎨 Cover</button>
              <button className={`btn-filter ${promptType === 'video' ? 'active' : ''}`} onClick={() => setPromptType('video')}>🎬 Video</button>
              <button className={`btn-filter ${promptType === 'story' ? 'active' : ''}`} onClick={() => setPromptType('story')}>📖 Story</button>
              <button className={`btn-filter ${promptType === 'youtube' ? 'active' : ''}`} onClick={() => setPromptType('youtube')}>📺 YouTube</button>
              <button className={`btn-filter ${promptType === 'social' ? 'active' : ''}`} onClick={() => setPromptType('social')}>📱 Social</button>
            </div>
            <SmartPrompts project={project} type={promptType} />
          </div>
        )}
        {activeTab === 'links' && (
          <div className="links-panel">
            <h3>🔗 Quick Links</h3>
            <div className="links-grid">
              <a href="https://dreamedit.runitfast.xyz/" target="_blank" rel="noopener noreferrer" className="link-card"><span className="link-icon">🎨</span><span className="link-label">DreamEdit</span></a>
              <a href="https://app.suno.ai" target="_blank" rel="noopener noreferrer" className="link-card"><span className="link-icon">🎵</span><span className="link-label">Suno</span></a>
              <a href="https://distrokid.com" target="_blank" rel="noopener noreferrer" className="link-card"><span className="link-icon">💿</span><span className="link-label">DistroKid</span></a>
              <a href="https://visual-story.unlock-your-song.de/" target="_blank" rel="noopener noreferrer" className="link-card"><span className="link-icon">📖</span><span className="link-label">Visual Story</span></a>
              <a href="https://artify.unlock-your-song.de/" target="_blank" rel="noopener noreferrer" className="link-card"><span className="link-icon">🖼️</span><span className="link-label">Artify</span></a>
              <a href="https://artists.spotify.com/c/de/artist/0hyYhfUiuBwBbPQZdM8D2d/home" target="_blank" rel="noopener noreferrer" className="link-card"><span className="link-icon">📊</span><span className="link-label">Spotify Artists</span></a>
              <a href="https://sendfox.com/dashboard/emails" target="_blank" rel="noopener noreferrer" className="link-card"><span className="link-icon">📧</span><span className="link-label">Sendfox</span></a>
              <a href="https://transkriptor.runitfast.xyz/" target="_blank" rel="noopener noreferrer" className="link-card"><span className="link-icon">📝</span><span className="link-label">Transkriptor</span></a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetailView;