/**
 * API Integration Example Component
 * Demonstrates how to use API services in React
 *
 * Built by Claude for Don Key
 */

import { useState } from 'react';
import { useSuno, useYouTube } from '../hooks/api/useApi';

function ApiIntegrationExample({ project }) {
  const [sunoParams, setSunoParams] = useState({
    prompt: '',
    genre: 'Pop',
    mood: 'energetic',
    duration: 180
  });

  // Use Suno hook
  const {
    generateMusic,
    downloadAudio,
    loading: sunoLoading,
    error: sunoError,
    progress: sunoProgress,
    audioData,
    generationId
  } = useSuno();

  // Use YouTube hook
  const {
    uploadVideo,
    loading: youtubeLoading,
    error: youtubeError,
    videoUrl
  } = useYouTube();

  // Handle Suno music generation
  const handleGenerateMusic = async () => {
    const result = await generateMusic(sunoParams, (progressData) => {
      console.log('Progress:', progressData);
    });

    if (result.success) {
      console.log('Music generated:', result);
      alert(`Musik erfolgreich generiert! URL: ${result.audioUrl}`);
    } else {
      alert(`Fehler: ${result.error}`);
    }
  };

  // Handle YouTube upload
  const handleUploadToYouTube = async (videoFile) => {
    const result = await uploadVideo({
      videoFile,
      title: project.name,
      description: `Neues Video: ${project.name}`,
      tags: ['music', 'video'],
      privacyStatus: 'public'
    });

    if (result.success) {
      console.log('Video uploaded:', result);
      alert(`Video erfolgreich hochgeladen! URL: ${result.url}`);
    } else {
      alert(`Fehler: ${result.error}`);
    }
  };

  return (
    <div className="api-integration-example">
      <h2>🔌 API Integration Beispiel</h2>

      {/* Suno Music Generation */}
      <section>
        <h3>🎵 Suno Music Generation</h3>

        <input
          type="text"
          placeholder="Musik-Prompt"
          value={sunoParams.prompt}
          onChange={(e) =>
            setSunoParams({ ...sunoParams, prompt: e.target.value })
          }
        />

        <select
          value={sunoParams.genre}
          onChange={(e) =>
            setSunoParams({ ...sunoParams, genre: e.target.value })
          }
        >
          <option>Pop</option>
          <option>Rock</option>
          <option>Hip Hop</option>
          <option>Electronic</option>
          <option>Classical</option>
        </select>

        <button
          onClick={handleGenerateMusic}
          disabled={sunoLoading || !sunoParams.prompt}
        >
          {sunoLoading ? 'Generiere...' : '🎵 Musik generieren'}
        </button>

        {sunoLoading && (
          <div className="progress">
            <div className="progress-bar" style={{ width: `${sunoProgress}%` }}></div>
            <span>{sunoProgress}%</span>
          </div>
        )}

        {sunoError && <div className="error">❌ {sunoError}</div>}

        {audioData && (
          <div className="success">
            ✅ Musik generiert!
            <audio controls src={audioData.audioUrl}></audio>
            <button onClick={() => downloadAudio('downloads/music.mp3')}>
              💾 Download
            </button>
          </div>
        )}
      </section>

      {/* YouTube Upload */}
      <section>
        <h3>📺 YouTube Upload</h3>

        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) handleUploadToYouTube(file);
          }}
          disabled={youtubeLoading}
        />

        {youtubeLoading && <div className="loading">⏳ Video wird hochgeladen...</div>}

        {youtubeError && <div className="error">❌ {youtubeError}</div>}

        {videoUrl && (
          <div className="success">
            ✅ Video hochgeladen!
            <a href={videoUrl} target="_blank" rel="noopener noreferrer">
              {videoUrl}
            </a>
          </div>
        )}
      </section>

      <style jsx>{`
        .api-integration-example {
          padding: 2rem;
          background: #1e293b;
          border-radius: 12px;
          color: #e2e8f0;
        }

        section {
          margin: 2rem 0;
          padding: 1.5rem;
          background: #0f172a;
          border-radius: 8px;
        }

        input,
        select {
          display: block;
          width: 100%;
          margin: 0.5rem 0;
          padding: 0.75rem;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 6px;
          color: #e2e8f0;
        }

        button {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .progress {
          margin-top: 1rem;
          position: relative;
          height: 30px;
          background: #334155;
          border-radius: 6px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #10b981);
          transition: width 0.3s ease;
        }

        .progress span {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: 700;
          color: white;
        }

        .error {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(239, 68, 68, 0.1);
          border-left: 4px solid #ef4444;
          border-radius: 6px;
          color: #ef4444;
        }

        .success {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(16, 185, 129, 0.1);
          border-left: 4px solid #10b981;
          border-radius: 6px;
          color: #10b981;
        }

        audio {
          width: 100%;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
}

export default ApiIntegrationExample;
