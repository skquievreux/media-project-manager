import { useState, useEffect } from 'react';
import { PROJECT_TYPES } from '../constants/projectTypes';
import TaskTracker from './TaskTracker';
import FileDropZone from './FileDropZone';
import SmartPrompts from './SmartPrompts';
import AudioVisualizer from './AudioVisualizer';
import AssetImportDialog from './AssetImportDialog';
import FolderStructureView from './FolderStructureView';
import SmartRenameModal from './SmartRenameModal';
import './ProjectDetailView.css';

// Sub-Component for individual Asset Card to reduce duplication
const AssetCard = ({ asset, activeMediaId, setActiveMediaId, onOpenExternal, onRename, onDelete, getSafeUrl, onPreview }) => {
  const [error, setError] = useState(false);

  // ... error state unchanged ...
  const handleError = () => setError(true);

  if (error) {
    // ... error UI unchanged ...
    return (
      <div className={`asset-card error ${activeMediaId === asset.id ? 'active' : ''}`}>
        <div className="asset-preview">
          <div className="asset-icon-large error-icon" title="Datei nicht gefunden">⚠️</div>
        </div>
        <div className="asset-info">
          <div className="asset-name" title={asset.name}>{asset.name}</div>
          <div className="asset-meta error-text">Datei nicht gefunden</div>
        </div>
        <div className="asset-actions">
          <button onClick={() => onDelete(asset.id)} title="Löschen">🗑️</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`asset-card ${activeMediaId === asset.id ? 'active' : ''}`}>
      <div className="asset-preview">
        {asset.type === 'image' && (
          <img
            src={getSafeUrl(asset.url)}
            alt={asset.name}
            className="asset-preview-img clickable"
            loading="lazy"
            onError={handleError}
            onClick={() => onPreview && onPreview(asset)}
            style={{ cursor: 'pointer' }}
          />
        )}
        {asset.type === 'video' && (
          <video
            src={getSafeUrl(asset.url)}
            controls
            className="asset-preview-video"
            onPlay={() => setActiveMediaId(asset.id)}
            onError={handleError}
          />
        )}
        {asset.type === 'audio' && (
          <div className="asset-preview-visualizer">
            <AudioVisualizer
              src={getSafeUrl(asset.url)}
              onPlay={() => setActiveMediaId(asset.id)}
              onError={handleError}
            />
          </div>
        )}
        {asset.type !== 'image' && asset.type !== 'video' && asset.type !== 'audio' && (
          <div className="asset-icon-large">
            {asset.type === 'document' && '📄'}
            {asset.type === 'other' && '📦'}
          </div>
        )}
      </div>
      <div className="asset-info">
        <div className="asset-name" title={asset.name}>{asset.name}</div>
        <div className="asset-meta">
          <span className="asset-date">{new Date(asset.addedAt || Date.now()).toLocaleDateString('de-DE')}</span>
          {asset.size && <span className="asset-size">{(asset.size / 1024 / 1024).toFixed(2)} MB</span>}
        </div>
      </div>
      <div className="asset-actions">
        <button onClick={() => onOpenExternal(asset.path || asset.url)} title="Öffnen">📂</button>
        <button onClick={() => onRename(asset)} title="Bearbeiten / Umbenennen">✏️</button>
        <button onClick={() => onDelete(asset.id)} title="Löschen">🗑️</button>
      </div>
    </div>
  );
};

function ProjectDetailView({ project, onBack, onUpdateProject }) {
  const [activeTab, setActiveTab] = useState('tasks');
  const [notes, setNotes] = useState(project.notes || '');
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showSmartRename, setShowSmartRename] = useState(false);
  const [promptType, setPromptType] = useState('suno');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [activeMediaId, setActiveMediaId] = useState(null);
  const [importQueue, setImportQueue] = useState([]);

  // Asset Management State
  const [assetSearch, setAssetSearch] = useState('');
  const [assetSort, setAssetSort] = useState({ key: 'addedAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isFolderView, setIsFolderView] = useState(false);
  const itemsPerPage = 24;

  // Debug log to ensure HMR update
  console.log('Rendering ProjectDetailView', { projectId: project.id, isEditingTitle });

  const projectType = PROJECT_TYPES[project.projectType] || PROJECT_TYPES[project.type] || {};
  const stats = calculateProjectStats();
  // Ensure we have a valid folder path, fallback to path if folder is missing
  const folderPath = project.folder || project.path;

  // Helper for opening files via Electron
  const [previewAsset, setPreviewAsset] = useState(null);

  // Helper for opening files via Electron
  const openExternal = (path) => {
    if (window.electron && window.electron.showItemInFolder) {
      // Fix Protocol stripping:
      // media://C:/Users -> C:/Users
      // media:///C:/Users -> C:/Users
      const cleanPath = path.replace(/^media:\/\/*/, '');
      window.electron.showItemInFolder(cleanPath);
    } else if (window.electron && window.electron.openPath) {
      const cleanPath = path.replace(/^media:\/\/*/, '');
      window.electron.openPath(cleanPath);
    } else {
      window.open(path, '_blank');
    }
  };

  // Auto-Repair path from description if missing
  useEffect(() => {
    if (!project.path && !project.folder && project.description && project.description.startsWith('Importiert aus ')) {
      const recoveredPath = project.description.substring(15).trim();
      if (recoveredPath) {
        console.log('Auto-recovering project path:', recoveredPath);
        onUpdateProject({ ...project, path: recoveredPath, folder: recoveredPath });
      }
    }
  }, [project]);

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

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
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
    const openFolder = () => {
      if (folderPath) window.open(`file:///${folderPath}`, '_blank');
    };
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

  const handleStartRename = (asset) => {
    let filePath = asset.url;
    // Strip media protocol
    if (filePath.startsWith('media:///')) {
      filePath = filePath.replace('media:///', '');
    }
    // Attempt decoding if URL encoded
    try { filePath = decodeURIComponent(filePath); } catch (e) { }

    // Normalize slashes for Windows (mocking file system path)
    filePath = filePath.replace(/\//g, '\\');

    const mockFile = {
      name: asset.name,
      path: filePath,
      size: asset.size || 0,
      isRenameMode: true,
      originalAssetId: asset.id
    };
    setImportQueue([mockFile]);
  };

  const handleImportSave = async (processedData) => {
    let sourcePath = processedData.originalFile.path;
    // Electron context isolation might strip .path, try to recover it
    if (!sourcePath && window.electron && window.electron.getPathForFile) {
      try {
        sourcePath = window.electron.getPathForFile(processedData.originalFile);
      } catch (e) {
        console.error("Failed to get path via webUtils", e);
      }
    }

    // --- RENAME MODE ---
    if (processedData.originalFile.isRenameMode) {
      if (!project.path) return alert("Projekt hat keinen Pfad.");

      const currentProjectPath = project.path.replace(/\\/g, '/');
      const destinationFolder = `${currentProjectPath}/${processedData.folder}`;
      const newFilename = processedData.newFilename;

      // Target Path (Full)
      // Clean double slashes
      const targetPathFull = `${destinationFolder}/${newFilename}`.replace(/\/\//g, '/');

      // Native System Paths for IPC
      // sourcePath is already native from handleStartRename

      try {
        const result = await window.electron.invoke('rename-file', {
          oldPath: sourcePath,
          newPath: targetPathFull
        });

        if (result.success) {
          // Update Asset in Project State in-place
          const updatedAssets = project.assets.map(a => {
            if (a.id === processedData.originalFile.originalAssetId) {
              return {
                ...a,
                name: newFilename,
                url: 'media:///' + targetPathFull.replace(/\\/g, '/'),
                // Update type based on new folder category
                type: (processedData.category === 'audio' ? 'audio' :
                  processedData.category === 'images' ? 'image' :
                    processedData.category === 'docs' ? 'document' : 'other')
              };
            }
            return a;
          });

          onUpdateProject({ ...project, assets: updatedAssets });
          setImportQueue([]);
        } else {
          alert(`Fehler beim Umbenennen: ${result.error}`);
        }
      } catch (e) {
        console.error("Rename Exception", e);
        alert("Fehler beim Umbenennen.");
      }
      return;
    }
    // --- END RENAME MODE ---

    let currentProjectPath = project.path;

    // Ensure we have project path
    if (!currentProjectPath) {
      // MAGIC WORKFLOW: Auto-create project path if missing (e.g. Downloads/MediaProjects/Name)
      try {
        // Get standard base path (Downloads/MediaProjects) via Electron
        const standard = await window.electron.invoke('get-standard-path');
        if (standard && standard.path) {
          // Sanitize project name for folder usage
          const safeProjectName = project.name.replace(/[^a-zA-Z0-9_\- ]/g, '').trim();

          // Construct standard path using forward slashes for internal consistency
          const base = standard.path.replace(/\\/g, '/');
          currentProjectPath = `${base}/${safeProjectName}`;

          // Update project state immediately.
          // The actual folder is created either here or recursively during the first file copy.
          // Since this is key info, we assume it succeeds.
          onUpdateProject({ ...project, path: currentProjectPath, folder: currentProjectPath });
        } else {
          alert("Fehler: Konnte Standard-Pfad nicht ermitteln.");
          return;
        }
      } catch (err) {
        console.error("Auto-Path creation failed", err);
        return;
      }
    }

    // Destination folder construction
    const cleanProjectPath = currentProjectPath.replace(/\\/g, '/');
    const destinationFolder = `${cleanProjectPath}/${processedData.folder}`;

    try {
      if (window.electron) {
        const result = await window.electron.invoke('import-file', {
          sourcePath,
          destinationFolder,
          newFilename: processedData.newFilename
        });

        if (result.success) {
          const newAsset = {
            id: Date.now(),
            name: result.name,
            url: 'media:///' + result.path.replace(/\\/g, '/'),
            size: result.size,
            addedAt: Date.now()
          };

          // Map category to type
          if (processedData.category === 'audio') newAsset.type = 'audio';
          else if (processedData.category === 'images') newAsset.type = 'image';
          else if (processedData.category === 'docs') newAsset.type = 'document';
          else newAsset.type = 'other';

          const updatedAssets = [...(project.assets || []), newAsset];

          const updatedProject = {
            ...project,
            path: currentProjectPath,
            folder: currentProjectPath,
            assets: updatedAssets
          };

          onUpdateProject(updatedProject);

          // Remove processed file from queue
          setImportQueue(files => files.filter(f => f !== processedData.originalFile));
        } else {
          alert(`Importfehler: ${result.error}`);
        }
      }
    } catch (e) {
      console.error("Import Exception:", e);
      alert("Fehler beim Importieren.");
    }
  };



  // --- ASSET FILTERING & PAGINATION LOGIC ---
  const getProcessedAssets = () => {
    let assets = [...(project.assets || [])];

    // Filter
    if (assetSearch) {
      const lowerQuery = assetSearch.toLowerCase();
      assets = assets.filter(a => a.name.toLowerCase().includes(lowerQuery));
    }

    // Sort
    assets.sort((a, b) => {
      let valA = a[assetSort.key];
      let valB = b[assetSort.key];

      // Handle strings case-insensitive
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      // Handle null/undefined (push to bottom usually, but depends)
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (valA < valB) return assetSort.direction === 'asc' ? -1 : 1;
      if (valA > valB) return assetSort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return assets;
  };

  const processedAssets = getProcessedAssets();
  const totalPages = Math.ceil(processedAssets.length / itemsPerPage);
  const currentAssets = processedAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Group assets for Folder View
  const groupedAssets = {};
  if (isFolderView) {
    processedAssets.forEach(asset => {
      let folderName = 'Unsorted';
      // Try to determine relative folder
      if (asset.path && folderPath) {
        // Normalize slashes
        const pPath = folderPath.replace(/\\/g, '/').replace(/\/$/, '') + '/';
        const aPath = asset.path.replace(/\\/g, '/');

        if (aPath.startsWith(pPath)) {
          const rel = aPath.substring(pPath.length);
          const parts = rel.split('/');
          if (parts.length > 1) {
            folderName = parts.slice(0, -1).join('/');
          } else {
            folderName = 'Root';
          }
        } else {
          folderName = 'Extern';
        }
      } else if (asset.url && asset.url.includes('/')) {
        // Fallback guess from URL
        const parts = asset.url.split('/');
        if (parts.length > 2) folderName = parts[parts.length - 2];
      }

      if (!groupedAssets[folderName]) groupedAssets[folderName] = [];
      groupedAssets[folderName].push(asset);
    });
  }

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [assetSearch, assetSort]);

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
          <button className="btn-secondary" onClick={async () => {
            if (folderPath) {
              setShowSmartRename(true);
            } else {
              if (confirm('Dieses Projekt ist mit keinem Ordner verknüpft. Möchten Sie jetzt einen Ordner auswählen?')) {
                if (window.electron) {
                  const result = await window.electron.invoke('select-directory');
                  if (result && !result.canceled && result.path) {
                    onUpdateProject({ ...project, path: result.path, folder: result.path });
                    // Open modal immediately after linking? Maybe better to let user click again to avoid confusion
                    alert('Ordner verknüpft! Sie können nun "Smart Organize" nutzen.');
                  }
                }
              }
            }
          }}>
            🪄 Smart Organize
          </button>
          <button className="btn-folder" onClick={async () => {
            if (folderPath) {
              window.open(`file:///${folderPath}`, '_blank');
            } else {
              if (window.electron) {
                const result = await window.electron.invoke('select-directory');
                if (result && !result.canceled && result.path) {
                  onUpdateProject({ ...project, path: result.path, folder: result.path });
                }
              }
            }
          }}>
            {folderPath ? '📁 Ordner öffnen' : '🔗 Ordner verknüpfen'}
          </button>
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
            {folderPath && <span className="meta-item folder-path">📁 {folderPath}</span>}
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
        <button className={`tab ${activeTab === 'structure' ? 'active' : ''}`} onClick={() => setActiveTab('structure')}>🗂️ Struktur</button>
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
            {/* File Drop Zone with Smart Interception */}
            <FileDropZone
              project={project}
              onFilesDetected={(files) => setImportQueue(Array.from(files))}
              onFileUpload={(asset) => {
                const newAsset = { ...asset, addedAt: Date.now() };
                const updatedAssets = [...(project.assets || []), newAsset];
                onUpdateProject({ ...project, assets: updatedAssets });
              }}
            />

            {/* Controls Toolbar */}
            <div className="assets-controls-toolbar" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center', background: '#2d3748', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  placeholder="🔍 Assets suchen..."
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2rem', borderRadius: '4px', border: '1px solid #4a5568', background: '#1a202c', color: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={assetSort.key}
                  onChange={(e) => setAssetSort(prev => ({ ...prev, key: e.target.value }))}
                  style={{ padding: '0.5rem', borderRadius: '4px', background: '#1a202c', color: 'white', border: '1px solid #4a5568' }}
                >
                  <option value="addedAt">📅 Datum</option>
                  <option value="name">🔤 Name</option>
                  <option value="size">💾 Größe</option>
                  <option value="type">📁 Typ</option>
                </select>
                <button
                  onClick={() => setAssetSort(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                  style={{ padding: '0.5rem', background: '#4a5568', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}
                  title={assetSort.direction === 'asc' ? 'Aufsteigend' : 'Absteigend'}
                >
                  {assetSort.direction === 'asc' ? '⬆️' : '⬇️'}
                </button>
                <div style={{ width: '1px', background: '#4a5568', margin: '0 0.5rem' }}></div>
                <button
                  onClick={() => setIsFolderView(!isFolderView)}
                  style={{ padding: '0.5rem 1rem', background: isFolderView ? '#3182ce' : '#4a5568', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}
                >
                  {isFolderView ? '📁 Ordner' : '🏗️ Grid'}
                </button>
              </div>
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

            {/* Import Dialog Overlay */}
            {importQueue.length > 0 && (
              <AssetImportDialog
                files={importQueue}
                project={project}
                onSave={handleImportSave}
                onCancel={() => setImportQueue([])}
              />
            )}

            {isFolderView ? (
              <div className="assets-folder-view">
                {Object.entries(groupedAssets).map(([folderName, assets]) => (
                  <div key={folderName} className="asset-group">
                    <h4 style={{
                      color: '#93c5fd',
                      borderBottom: '1px solid #2d3748',
                      paddingBottom: '0.5rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      📁 {folderName} <span style={{ fontSize: '0.8em', color: '#64748b' }}>({assets.length})</span>
                    </h4>
                    <div className="assets-grid">
                      {assets.map(asset => (
                        <AssetCard
                          key={asset.id}
                          asset={asset}
                          activeMediaId={activeMediaId}
                          setActiveMediaId={setActiveMediaId}
                          onOpenExternal={openExternal}
                          onRename={handleStartRename}
                          onDelete={handleDeleteAsset}
                          onPreview={setPreviewAsset}
                          getSafeUrl={getSafeUrl}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="assets-grid">
                {currentAssets.map(asset => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    activeMediaId={activeMediaId}
                    setActiveMediaId={setActiveMediaId}
                    onOpenExternal={openExternal}
                    onRename={handleStartRename}
                    onDelete={handleDeleteAsset}
                    onPreview={setPreviewAsset}
                    getSafeUrl={getSafeUrl}
                  />
                ))}
                {processedAssets.length === 0 && <div className="empty-state"><span className="empty-icon">📁</span><p>{assetSearch ? 'Keine Assets gefunden' : 'Noch keine Assets hinzugefügt'}</p></div>}
              </div>
            )}

            {/* Pagination Controls (Only show in Grid Mode to avoid splitting folders) */}
            {!isFolderView && totalPages > 1 && (
              <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem', alignItems: 'center' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  style={{ padding: '0.5rem 1rem', background: currentPage === 1 ? '#4a5568' : '#3182ce', border: 'none', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: 'white' }}
                >
                  ◀ Zurück
                </button>
                <span style={{ color: '#cbd5e1' }}>Seite {currentPage} von {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  style={{ padding: '0.5rem 1rem', background: currentPage === totalPages ? '#4a5568' : '#3182ce', border: 'none', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: 'white' }}
                >
                  Weiter ▶
                </button>
              </div>
            )}
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
        {activeTab === 'structure' && (
          <FolderStructureView project={{ ...project, folder: folderPath }} />
        )}
      </div>

      {showSmartRename && (
        <SmartRenameModal
          project={{ ...project, folder: folderPath }}
          onClose={() => setShowSmartRename(false)}
          onFinish={() => {
            setShowSmartRename(false);
            // Consider triggering a refresh if needed
          }}
        />
      )}

      {/* Preview Modal */}
      {previewAsset && (
        <div className="preview-modal-overlay" onClick={() => setPreviewAsset(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
        }}>
          <div className="preview-content" onClick={e => e.stopPropagation()} style={{
            maxWidth: '90vw', maxHeight: '90vh', position: 'relative'
          }}>
            <button onClick={() => setPreviewAsset(null)} style={{
              position: 'absolute', top: '-40px', right: 0,
              background: 'transparent', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer'
            }}>×</button>
            <img
              src={getSafeUrl(previewAsset.url)}
              alt={previewAsset.name}
              onClick={() => setPreviewAsset(null)}
              title="Klicken zum Schließen"
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '8px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', cursor: 'zoom-out' }}
            />
            <div style={{ textAlign: 'center', color: 'white', marginTop: '1rem', fontSize: '1.2rem' }}>{previewAsset.name}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetailView;