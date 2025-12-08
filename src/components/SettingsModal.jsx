import { useState, useEffect } from 'react';
import './SettingsModal.css';

/**
 * Settings Modal with API Key Management
 * Secure API key storage and management
 *
 * Built by Claude for Don Key
 */
function SettingsModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('api-keys');
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Available API services
  const services = [
    { id: 'suno', name: 'Suno AI', icon: '🎵', description: 'Music Generation' },
    { id: 'dreamedit', name: 'DreamEdit', icon: '🎨', description: 'Image Generation' },
    { id: 'youtube', name: 'YouTube', icon: '📺', description: 'Video Upload' },
    { id: 'distrokid', name: 'DistroKid', icon: '💿', description: 'Music Distribution' },
    { id: 'elevenlabs', name: 'ElevenLabs', icon: '🎙️', description: 'Voice Generation' }
  ];

  // Load API keys on mount
  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    if (!window.electron) return;

    setLoading(true);
    try {
      const result = await window.electron.listApiKeys();
      if (result.success) {
        setApiKeys(result.services || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = async (service) => {
    const key = prompt(`API Key für ${service.name} eingeben:`);
    if (!key || key.trim() === '') return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await window.electron.saveApiKey(service.id, key.trim());
      if (result.success) {
        setSuccess(`API Key für ${service.name} gespeichert!`);
        await loadApiKeys();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Fehler beim Speichern');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteApiKey = async (service) => {
    if (!confirm(`API Key für ${service.name} wirklich löschen?`)) return;

    setLoading(true);
    setError(null);

    try {
      const result = await window.electron.deleteApiKey(service.id);
      if (result.success) {
        setSuccess(`API Key für ${service.name} gelöscht!`);
        await loadApiKeys();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Fehler beim Löschen');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasApiKey = (serviceId) => {
    return apiKeys.some(k => k.service === serviceId);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-header">
          <h2>⚙️ Einstellungen</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`tab ${activeTab === 'api-keys' ? 'active' : ''}`}
            onClick={() => setActiveTab('api-keys')}
          >
            🔑 API Keys
          </button>
          <button
            className={`tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            ⚙️ Allgemein
          </button>
          <button
            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            ℹ️ Über
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* API Keys Tab */}
          {activeTab === 'api-keys' && (
            <div className="api-keys-panel">
              <div className="panel-header">
                <h3>🔑 API Key Management</h3>
                <p className="subtitle">
                  Verwalte deine API-Schlüssel sicher. Alle Keys werden verschlüsselt gespeichert.
                </p>
              </div>

              {error && (
                <div className="alert alert-error">
                  ❌ {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  ✅ {success}
                </div>
              )}

              {!window.electron && (
                <div className="alert alert-warning">
                  ⚠️ API Key Management ist nur in der Electron-App verfügbar.
                </div>
              )}

              <div className="services-list">
                {services.map(service => {
                  const hasKey = hasApiKey(service.id);
                  const keyData = apiKeys.find(k => k.service === service.id);

                  return (
                    <div key={service.id} className="service-card">
                      <div className="service-icon">{service.icon}</div>
                      <div className="service-info">
                        <div className="service-name">{service.name}</div>
                        <div className="service-description">{service.description}</div>
                        {hasKey && keyData && (
                          <div className="service-meta">
                            <span className="status-badge">✓ Aktiv</span>
                            <span className="last-used">
                              Zuletzt genutzt: {formatDate(keyData.lastUsed)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="service-actions">
                        <button
                          className={`btn-action ${hasKey ? 'btn-update' : 'btn-add'}`}
                          onClick={() => saveApiKey(service)}
                          disabled={loading}
                        >
                          {hasKey ? '🔄 Update' : '➕ Hinzufügen'}
                        </button>
                        {hasKey && (
                          <button
                            className="btn-action btn-delete"
                            onClick={() => deleteApiKey(service)}
                            disabled={loading}
                          >
                            🗑️ Löschen
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="api-docs-links">
                <h4>📚 API Dokumentation:</h4>
                <ul>
                  <li><a href="https://docs.suno.ai" target="_blank" rel="noopener noreferrer">Suno AI Docs</a></li>
                  <li><a href="https://developers.google.com/youtube/v3" target="_blank" rel="noopener noreferrer">YouTube Data API</a></li>
                  <li><a href="https://docs.elevenlabs.io" target="_blank" rel="noopener noreferrer">ElevenLabs API</a></li>
                </ul>
              </div>
            </div>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="general-panel">
              <h3>⚙️ Allgemeine Einstellungen</h3>
              <p className="coming-soon">Weitere Einstellungen kommen bald...</p>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="about-panel">
              <h3>ℹ️ Über Media Project Manager</h3>
              <div className="about-content">
                <div className="logo">🎵</div>
                <h4>Media Project Manager v1.1.0</h4>
                <p>Komplette Workflow-Lösung für Medien-Produktion</p>
                <div className="features-list">
                  <div className="feature">✅ Task Tracking mit Timer</div>
                  <div className="feature">✅ API Integrationen (Suno, YouTube, etc.)</div>
                  <div className="feature">✅ File Management</div>
                  <div className="feature">✅ Sichere API Key Storage</div>
                  <div className="feature">✅ Progress Tracking</div>
                </div>
                <p className="built-by">Built by Claude for Don Key 🚀</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
