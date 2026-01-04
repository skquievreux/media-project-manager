import { useState, useRef } from 'react';
import './FileDropZone.css';

/**
 * FileDropZone Component
 * Drag & drop file upload with auto-task completion
 *
 * Features:
 * - Drag & Drop files
 * - Auto-categorize by file type
 * - Auto-complete associated task
 * - File preview
 * - Move to project folder
 * - Asset management integration
 *
 * Built by Claude for Don Key
 */
function FileDropZone({ project, task, onFileUpload, onFilesAdded, onTaskComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Detect file type
  const detectFileType = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();

    const types = {
      audio: ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'],
      image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
      video: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'],
      document: ['pdf', 'doc', 'docx', 'txt', 'md']
    };

    for (const [type, extensions] of Object.entries(types)) {
      if (extensions.includes(ext)) return type;
    }

    return 'other';
  };

  // Get appropriate icon for file type
  const getFileIcon = (type) => {
    const icons = {
      audio: '🎵',
      image: '🖼️',
      video: '🎬',
      document: '📄',
      other: '📦'
    };
    return icons[type] || '📦';
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  // Handle file selection
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    await processFiles(files);
  };

  // Process uploaded files
  const processFiles = async (files) => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const newAssets = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = detectFileType(file);

      try {
        // Create asset object
        let asset = {
          id: Date.now() + i,
          name: file.name,
          type: fileType,
          size: file.size,
          file: file, // Keep file ref for upload if needed
          uploadedAt: Date.now(),
          taskId: task?.id,
          url: URL.createObjectURL(file) // Default generic URL
        };

        // Resolve path: use file.path if available, otherwise try electron helper
        let filePath = file.path;
        try {
          if (!filePath && window.electron && window.electron.getFilePath) {
            filePath = window.electron.getFilePath(file);
          }
        } catch (e) {
          console.error("Error resolving file path via electron:", e);
        }

        console.log('Processing file:', file.name, 'Resolved Path:', filePath);
        console.log('Project path:', project?.path);

        // If in Electron and project has a path, move the file (cleanup source)
        if (window.electron && project?.path && filePath) {
          try {
            console.log('Attempting to move file...');
            const result = await window.electron.moveFile(filePath, project.path);
            console.log('Move result:', result);

            if (result.success) {
              asset.url = result.url;
              asset.path = result.path;
              asset.name = result.name; // Use actual saved name (handle duplicates)
            } else {
              console.error('Move failed:', result.error);
              alert(`Fehler beim Verschieben der Datei: ${result.error}`);
            }
          } catch (err) {
            console.error('Failed to move file:', err);
            alert(`Exception beim Verschieben: ${err.message}`);
          }
        } else {
          console.warn('Skipping move: Missing electron, project path, or file path.');
          if (!project?.path) alert("Warnung: Projekt hat keinen Speicherpfad. Datei wird nicht dauerhaft gespeichert.");
          if (!filePath && window.electron) alert("Warnung: Dateipfad konnte nicht ermittelt werden (Electron limitation).");
        }

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 40) {
          setUploadProgress(progress);
          await new Promise(resolve => setTimeout(resolve, 30));
        }

        newAssets.push(asset);

        // Call legacy single file handler if batch handler is missing
        if (onFileUpload && !onFilesAdded) {
          await onFileUpload(asset);
        }

        // Auto-complete task if this is the expected file type
        if (task && shouldAutoComplete(task, fileType)) {
          if (onTaskComplete) {
            onTaskComplete(task.id, {
              notes: `File uploaded: ${file.name}`,
              asset: asset
            });
          }
        }

      } catch (error) {
        console.error('File upload failed:', error);
        alert(`Upload fehlgeschlagen: ${file.name}`);
      }
    }

    // Batch update
    if (onFilesAdded && newAssets.length > 0) {
      onFilesAdded(newAssets);
    }

    setUploading(false);
    setUploadProgress(0);
  };

  // Check if uploaded file type matches task expectation
  const shouldAutoComplete = (task, fileType) => {
    const taskFileTypes = {
      'song_generated': ['audio'],
      'cover_created': ['image'],
      'video_rendered': ['video'],
      'landing_page': ['document'],
      'album_cover': ['image'],
      'tracks_generated': ['audio'],
      'illustrations': ['image'],
      'audio_record': ['audio'],
      'thumbnail_created': ['image']
    };

    const expectedTypes = taskFileTypes[task.id] || [];
    return expectedTypes.includes(fileType);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="file-drop-zone-wrapper">
      <div
        className={`file-drop-zone ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="*/*"
        />

        {!uploading ? (
          <>
            <div className="drop-icon">📁</div>
            <div className="drop-text">
              <strong>Drag & Drop Files hier</strong>
              <span>oder klicken zum Auswählen</span>
            </div>
            {task && (
              <div className="drop-hint">
                Erwartet: {getExpectedFileTypes(task).join(', ')}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="upload-spinner">⏳</div>
            <div className="upload-text">Uploading...</div>
            <div className="upload-progress">
              <div
                className="upload-progress-bar"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="upload-percentage">{uploadProgress}%</div>
          </>
        )}
      </div>

      {/* Recent Uploads */}
      {project?.assets && project.assets.length > 0 && (
        <div className="recent-uploads">
          <h4>📦 Recent Uploads</h4>
          <div className="uploads-list">
            {project.assets.slice(-3).reverse().map(asset => (
              <div key={asset.id} className="upload-item">
                <span className="upload-icon">{getFileIcon(asset.type)}</span>
                <div className="upload-info">
                  <div className="upload-name">{asset.name}</div>
                  <div className="upload-meta">
                    {formatFileSize(asset.size || 0)} • {asset.type}
                  </div>
                </div>
                {asset.taskId === task?.id && (
                  <span className="upload-badge">✓ This Task</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: Get expected file types for task
function getExpectedFileTypes(task) {
  const expectations = {
    'song_generated': ['MP3', 'WAV'],
    'cover_created': ['PNG', 'JPG'],
    'video_rendered': ['MP4', 'MOV'],
    'album_cover': ['PNG', 'JPG'],
    'tracks_generated': ['MP3', 'WAV'],
    'illustrations': ['PNG', 'JPG'],
    'audio_record': ['MP3', 'WAV'],
    'thumbnail_created': ['PNG', 'JPG']
  };

  return expectations[task.id] || ['Any file'];
}

export default FileDropZone;
