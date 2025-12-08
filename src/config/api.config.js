/**
 * API Configuration
 * Centralized API endpoints and settings
 *
 * Built by Claude for Don Key
 */

export const API_CONFIG = {
  // Suno API (Music Generation)
  suno: {
    baseUrl: import.meta.env.VITE_SUNO_API_URL || 'https://api.suno.ai/v1',
    timeout: 60000, // 60s for generation
    retries: 3,
    endpoints: {
      generate: '/generate',
      status: '/generate/{id}',
      download: '/download/{id}'
    }
  },

  // DreamEdit API (Image Generation)
  dreamedit: {
    baseUrl: import.meta.env.VITE_DREAMEDIT_API_URL || 'https://dreamedit.runitfast.xyz/api/v1',
    timeout: 120000, // 2min for image generation
    retries: 3,
    endpoints: {
      generate: '/generate',
      upscale: '/upscale',
      variations: '/variations'
    }
  },

  // YouTube Data API v3
  youtube: {
    baseUrl: 'https://www.googleapis.com/youtube/v3',
    uploadUrl: 'https://www.googleapis.com/upload/youtube/v3',
    timeout: 300000, // 5min for uploads
    retries: 1,
    endpoints: {
      videos: '/videos',
      channels: '/channels',
      playlists: '/playlists'
    },
    scopes: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube'
    ]
  },

  // DistroKid API (Music Distribution)
  distrokid: {
    baseUrl: import.meta.env.VITE_DISTROKID_API_URL || 'https://api.distrokid.com/v1',
    timeout: 60000,
    retries: 2,
    endpoints: {
      releases: '/releases',
      artists: '/artists',
      tracks: '/tracks'
    }
  },

  // ElevenLabs API (Voice Generation)
  elevenlabs: {
    baseUrl: 'https://api.elevenlabs.io/v1',
    timeout: 120000,
    retries: 3,
    endpoints: {
      textToSpeech: '/text-to-speech/{voice_id}',
      voices: '/voices',
      history: '/history'
    }
  },

  // Landing Page Generator (Custom Service)
  landingPage: {
    baseUrl: import.meta.env.VITE_LANDING_PAGE_API_URL || 'https://www.youtube-landingpage.de/api',
    timeout: 30000,
    retries: 2,
    endpoints: {
      generate: '/generate',
      templates: '/templates'
    }
  }
};

// Rate Limiting Configuration
export const RATE_LIMITS = {
  suno: { requestsPerMinute: 10, concurrent: 3 },
  dreamedit: { requestsPerMinute: 5, concurrent: 2 },
  youtube: { requestsPerMinute: 100, concurrent: 5 },
  distrokid: { requestsPerMinute: 20, concurrent: 3 },
  elevenlabs: { requestsPerMinute: 10, concurrent: 2 }
};

// Error Messages (German)
export const API_ERRORS = {
  NETWORK_ERROR: 'Netzwerkfehler. Bitte überprüfe deine Internetverbindung.',
  TIMEOUT: 'Anfrage hat zu lange gedauert. Bitte versuche es erneut.',
  UNAUTHORIZED: 'API-Schlüssel ungültig oder fehlt.',
  RATE_LIMIT: 'Zu viele Anfragen. Bitte warte einen Moment.',
  SERVER_ERROR: 'Server-Fehler. Bitte versuche es später erneut.',
  INVALID_RESPONSE: 'Ungültige Antwort vom Server.',
  UNKNOWN: 'Ein unbekannter Fehler ist aufgetreten.'
};
