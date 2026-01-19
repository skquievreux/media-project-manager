# 🔌 API Integration Guide

**Complete guide for integrating external APIs into Media Project Manager**

Built by Claude for Don Key

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Security Best Practices](#security-best-practices)
3. [Setup Guide](#setup-guide)
4. [Available APIs](#available-apis)
5. [Usage Examples](#usage-examples)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Testing](#testing)

---

## 🏗️ Architecture Overview

### Layer Structure

```
┌─────────────────────────────────────┐
│   React Components                  │
│   (UI Logic)                        │
└──────────┬──────────────────────────┘
           │
┌──────────▼──────────────────────────┐
│   Custom Hooks (useApi, useSuno)    │
│   (State Management)                │
└──────────┬──────────────────────────┘
           │
┌──────────▼──────────────────────────┐
│   API Services (suno.js, youtube.js)│
│   (Business Logic)                  │
└──────────┬──────────────────────────┘
           │
┌──────────▼──────────────────────────┐
│   API Client (client.js)            │
│   (HTTP, Retry, Error Handling)     │
└──────────┬──────────────────────────┘
           │
┌──────────▼──────────────────────────┐
│   Electron Secure Bridge            │
│   (API Key Storage, File Download)  │
└─────────────────────────────────────┘
```

---

## 🔐 Security Best Practices

### ⚠️ CRITICAL RULES

#### ❌ NEVER DO THIS:
```javascript
// GEFÄHRLICH - API Key im Code!
const SUNO_API_KEY = 'sk-abc123...';
```

#### ✅ ALWAYS DO THIS:

**1. Environment Variables (.env.local)**
```bash
# .env.local (NICHT committen - in .gitignore!)
VITE_SUNO_API_URL=https://api.suno.ai/v1
VITE_YOUTUBE_CLIENT_ID=your_client_id
```

**2. Electron Secure Storage**
```javascript
// Speichere verschlüsselt
await window.electron.saveApiKey('suno', 'sk-abc123...');

// Lade verschlüsselt
const result = await window.electron.getApiKey('suno');
```

**3. API Proxy Pattern**
```javascript
// Alle API-Calls gehen durch Electron Main Process
// Renderer hat KEINEN direkten Zugriff auf API Keys
```

---

## ⚙️ Setup Guide

### 1. Install Dependencies

```bash
npm install axios  # Optional: Falls du Axios statt Fetch willst
```

### 2. Create `.env.local`

```bash
# .env.local
VITE_SUNO_API_URL=https://api.suno.ai/v1
VITE_DREAMEDIT_API_URL=https://api.dreamedit.ai/v1
VITE_DISTROKID_API_URL=https://api.distrokid.com/v1
```

### 3. Add to `.gitignore`

```bash
# .gitignore
.env.local
.env.*.local
api-keys.enc
```

### 4. Setup API Keys in Electron

**In der App (Settings UI):**
```javascript
// Speichere API Key sicher
await window.electron.saveApiKey('suno', userInputKey);
```

**Oder via Electron Main Process:**
```javascript
// electron/main.js
import { saveApiKey } from './apiKeyManager.js';

// Beim ersten Start
saveApiKey('suno', process.env.SUNO_API_KEY);
```

### 5. Add IPC Handlers to main.js

```javascript
// electron/main.js
import {
  saveApiKey,
  getApiKey,
  deleteApiKey,
  listApiKeys
} from './apiKeyManager.js';

// API Key Management Handlers
ipcMain.handle('save-api-key', async (event, service, key) => {
  return saveApiKey(service, key);
});

ipcMain.handle('get-api-key', async (event, service) => {
  return getApiKey(service);
});

ipcMain.handle('delete-api-key', async (event, service) => {
  return deleteApiKey(service);
});

ipcMain.handle('list-api-keys', async () => {
  return listApiKeys();
});

// File Download Handler
ipcMain.handle('download-file', async (event, url, savePath) => {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(savePath, Buffer.from(buffer));
    return { success: true, path: savePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

---

## 🔗 Available APIs

### 1. Suno (Music Generation)

**Service:** `src/services/api/suno.js`

**Methods:**
- `generateMusic(params)` - Generate music from prompt
- `getStatus(generationId)` - Check generation status
- `downloadAudio(generationId, savePath)` - Download MP3
- `generateMusicAndWait(params, onProgress)` - Generate + poll
- `generateFromProject(project)` - Generate from project metadata

**Example:**
```javascript
import sunoService from '@/services/api/suno';

const result = await sunoService.generateMusic({
  prompt: 'Upbeat pop song about summer',
  genre: 'Pop',
  mood: 'happy',
  duration: 180
});
```

### 2. YouTube (Video Upload)

**Service:** `src/services/api/youtube.js`

**Methods:**
- `uploadVideo(params)` - Upload video to YouTube
- `uploadThumbnail(videoId, file)` - Upload custom thumbnail
- `updateVideo(videoId, updates)` - Update video metadata
- `getVideo(videoId)` - Get video details
- `createPlaylist(title, description)` - Create playlist
- `uploadFromProject(project, videoFile, thumbnail)` - Upload from project

**Example:**
```javascript
import youtubeService from '@/services/api/youtube';

const result = await youtubeService.uploadVideo({
  videoFile,
  title: 'My New Song',
  description: 'Check out my latest track!',
  tags: ['music', 'pop'],
  privacyStatus: 'public'
});

console.log('Video URL:', result.url);
```

### 3. DreamEdit (Image Generation)

**Coming Soon** - Template erstellt, Implementation analog zu Suno

### 4. DistroKid (Music Distribution)

**Coming Soon** - Template erstellt, Implementation analog zu YouTube

### 5. ElevenLabs (Voice Generation)

**Coming Soon** - Template erstellt, Implementation analog zu Suno

---

## 💻 Usage Examples

### Example 1: Generate Music with Progress

```javascript
import { useSuno } from '@/hooks/api/useApi';

function MusicGenerator() {
  const { generateMusic, loading, error, progress, audioData } = useSuno();

  const handleGenerate = async () => {
    const result = await generateMusic(
      {
        prompt: 'Epic orchestral music',
        genre: 'Classical',
        duration: 120
      },
      (progressData) => {
        console.log('Progress:', progressData.progress);
      }
    );

    if (result.success) {
      console.log('Audio URL:', result.audioUrl);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? `Generating... ${progress}%` : 'Generate Music'}
      </button>
      {error && <div>Error: {error}</div>}
      {audioData && <audio src={audioData.audioUrl} controls />}
    </div>
  );
}
```

### Example 2: Upload to YouTube from Project

```javascript
import { useYouTube } from '@/hooks/api/useApi';

function YouTubeUploader({ project }) {
  const { uploadFromProject, loading, error, videoUrl } = useYouTube();

  const handleUpload = async (videoFile, thumbnailFile) => {
    const result = await uploadFromProject(project, videoFile, thumbnailFile);

    if (result.success) {
      alert(`Video uploaded: ${result.url}`);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => handleUpload(e.target.files[0])}
      />
      {loading && <div>Uploading...</div>}
      {error && <div>Error: {error}</div>}
      {videoUrl && <a href={videoUrl}>Watch on YouTube</a>}
    </div>
  );
}
```

### Example 3: Multiple API Calls in Sequence

```javascript
import sunoService from '@/services/api/suno';
import youtubeService from '@/services/api/youtube';

async function createAndPublishSong(project) {
  try {
    // 1. Generate Music
    const musicResult = await sunoService.generateFromProject(project);
    if (!musicResult.success) throw new Error('Music generation failed');

    // 2. Download Audio
    await sunoService.downloadAudio(musicResult.generationId, 'song.mp3');

    // 3. Create Video (with Canva or local tool)
    const videoFile = await createVideoWithAudio('song.mp3');

    // 4. Upload to YouTube
    const uploadResult = await youtubeService.uploadFromProject(
      project,
      videoFile
    );

    return {
      success: true,
      audioUrl: musicResult.audioUrl,
      videoUrl: uploadResult.url
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

---

## ⚠️ Error Handling

### Automatic Retry Logic

```javascript
// In APIClient:
// - Retries: 3 attempts with exponential backoff
// - Timeout: Configurable per API
// - Network errors: Automatically retried
// - Auth errors: NOT retried (fail immediately)
```

### Error Types

```javascript
API_ERRORS = {
  NETWORK_ERROR: 'Netzwerkfehler...',
  TIMEOUT: 'Anfrage zu lange...',
  UNAUTHORIZED: 'API-Schlüssel ungültig',
  RATE_LIMIT: 'Zu viele Anfragen',
  SERVER_ERROR: 'Server-Fehler',
  INVALID_RESPONSE: 'Ungültige Antwort',
  UNKNOWN: 'Unbekannter Fehler'
}
```

### Error Handling Pattern

```javascript
const result = await apiService.someMethod(params);

if (result.success) {
  // Handle success
  console.log('Data:', result.data);
} else {
  // Handle error
  console.error('Error:', result.error);
  alert(result.error); // User-friendly German message
}
```

---

## 🚦 Rate Limiting

### Configured Limits

```javascript
RATE_LIMITS = {
  suno: { requestsPerMinute: 10, concurrent: 3 },
  dreamedit: { requestsPerMinute: 5, concurrent: 2 },
  youtube: { requestsPerMinute: 100, concurrent: 5 },
  distrokid: { requestsPerMinute: 20, concurrent: 3 }
}
```

### Queue Pattern (Optional)

```javascript
import { useApiQueue } from '@/hooks/api/useApi';

function BatchProcessor() {
  const { addToQueue, executeQueue, results, loading } = useApiQueue();

  const processBatch = () => {
    // Add multiple calls to queue
    addToQueue('song1', sunoService.generateMusic, params1);
    addToQueue('song2', sunoService.generateMusic, params2);
    addToQueue('song3', sunoService.generateMusic, params3);

    // Execute all
    executeQueue();
  };

  return <button onClick={processBatch}>Process Batch</button>;
}
```

---

## 🧪 Testing

### Mock API Responses (Development)

```javascript
// src/services/api/__mocks__/suno.js
export default {
  generateMusic: async (params) => ({
    success: true,
    generationId: 'mock-id-123',
    status: 'completed',
    audioUrl: 'https://example.com/mock-audio.mp3'
  })
};
```

### Test API Key

```javascript
// For development only
localStorage.setItem('api_key_suno', 'test-key-123');
```

---

## 📝 Implementation Checklist

- [x] Base API Client
- [x] API Configuration
- [x] Suno Service
- [x] YouTube Service
- [x] Custom Hooks (useApi, useSuno, useYouTube)
- [x] Electron API Key Manager
- [x] Secure Preload Bridge
- [ ] DreamEdit Service (TODO)
- [ ] DistroKid Service (TODO)
- [ ] ElevenLabs Service (TODO)
- [ ] Settings UI for API Keys
- [ ] Unit Tests
- [ ] Integration Tests

---

## 🚀 Next Steps

1. **Implement Settings UI** for API Key Management
2. **Add remaining services** (DreamEdit, DistroKid, ElevenLabs)
3. **Add progress notifications** (Electron notifications)
4. **Implement offline queue** (retry failed uploads)
5. **Add usage analytics** (track API costs)

---

## 📚 Resources

- [Suno API Docs](https://docs.suno.ai)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Electron safeStorage](https://www.electronjs.org/docs/latest/api/safe-storage)
- [React Hooks Best Practices](https://react.dev/reference/react)

---

**Built by Claude for Don Key** 🎵
