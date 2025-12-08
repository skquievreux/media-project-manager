import { useState } from 'react';
import { PROJECT_TYPES } from '../constants/projectTypes';
import TaskTracker from './TaskTracker';
import './ProjectDetailView.css';

function ProjectDetailView({ project, onBack, onUpdateProject }) {
  const [activeTab, setActiveTab] = useState('tasks');
  const [notes, setNotes] = useState(project.notes || '');
  const [showAddAsset, setShowAddAsset] = useState(false);

  const projectType = PROJECT_TYPES[project.projectType] || PROJECT_TYPES[project.type] || {};
  const stats = calculateProjectStats();

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

  const circleLength = 2 * Math.PI * 52;
  const progressOffset = circleLength * (1 - stats.progress / 100);

  return (
    <div className="project-detail-view">
      <div className="detail-header">
        <button className="btn-back" onClick={onBack}>← Zurück</button>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => onUpdateProject({ ...project, tasks: [...(project.tasks || []), ...(projectType.defaultTasks?.filter(t => !project.tasks?.some(pt => pt.label === t.label)) || [])] })}>
            🪄 Smart Template anwenden
          </button>
          <button className="btn-folder" onClick={openFolder} disabled={!project.folder}>📁 Ordner öffnen</button>
        </div>
      </div>

      <div className="hero-section" style={{ '--type-color': projectType.color || '#3b82f6' }}>
        <div className="hero-icon">{projectType.icon || '📦'}</div>
        <div className="hero-content">
          <h1 className="project-title">{project.name}</h1>
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
                  <div className="asset-icon">{asset.type === 'audio' && '🎵'}{asset.type === 'image' && '🖼️'}{asset.type === 'video' && '🎬'}{asset.type === 'document' && '📄'}{asset.type === 'other' && '📦'}</div>
                  <div className="asset-info"><div className="asset-name">{asset.name}</div><div className="asset-date">{formatDate(asset.addedAt)}</div></div>
                  <div className="asset-actions"><button onClick={() => window.open(asset.url, '_blank')}>Öffnen</button><button onClick={() => handleDeleteAsset(asset.id)}>🗑️</button></div>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetailView;