import { useState } from 'react';
import './ToolLinkButtons.css';

/**
 * ToolLinkButtons Component
 * Smart buttons to open external tools with pre-filled data
 *
 * Features:
 * - Open Suno, DreamEdit, YouTube, etc.
 * - Copy prompts to clipboard
 * - Pre-fill data from project
 * - Quick actions per task type
 *
 * Built by Claude for Don Key
 */
function ToolLinkButtons({ project, task }) {
  const [copied, setCopied] = useState(false);

  // Copy text to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get tool links based on task
  const getToolLinks = () => {
    if (!task) return [];

    const links = {
      // Song Tasks
      'song_generated': [
        {
          icon: '🎵',
          label: 'Suno öffnen',
          url: 'https://app.suno.ai/create',
          color: '#8b5cf6'
        },
        {
          icon: '📋',
          label: 'Prompt kopieren',
          action: () => copyToClipboard(generateSunoPrompt(project)),
          color: '#3b82f6'
        }
      ],

      'cover_created': [
        {
          icon: '🎨',
          label: 'DreamEdit öffnen',
          url: 'https://dreamedit.runitfast.xyz/',
          color: '#f59e0b'
        },
        {
          icon: '🖼️',
          label: 'Artify öffnen',
          url: 'https://artify.unlock-your-song.de/',
          color: '#ec4899'
        },
        {
          icon: '📋',
          label: 'Prompt kopieren',
          action: () => copyToClipboard(generateCoverPrompt(project)),
          color: '#3b82f6'
        }
      ],

      'video_rendered': [
        {
          icon: '🎬',
          label: 'Canva öffnen',
          url: 'https://www.canva.com',
          color: '#06b6d4'
        }
      ],

      'landing_page': [
        {
          icon: '🌐',
          label: 'YouTube LP Generator',
          url: 'https://www.youtube-landingpage.de',
          color: '#ef4444'
        }
      ],

      'youtube_upload': [
        {
          icon: '📺',
          label: 'YouTube Studio',
          url: 'https://studio.youtube.com',
          color: '#ef4444'
        },
        {
          icon: '📋',
          label: 'Description kopieren',
          action: () => copyToClipboard(generateYouTubeDescription(project)),
          color: '#3b82f6'
        }
      ],

        {
      icon: '💿',
        label: 'DistroKid öffnen',
          url: 'https://distrokid.com',
            color: '#10b981'
    },
    {
      icon: '📊',
        label: 'Spotify Artists',
          url: 'https://artists.spotify.com/c/de/artist/0hyYhfUiuBwBbPQZdM8D2d/home',
            color: '#1db954'
    }
      ],

  'social_promotion': [
    {
      icon: '📧',
      label: 'Sendfox öffnen',
      url: 'https://sendfox.com/dashboard/emails',
      color: '#f97316'
    }
  ],

    // Album Tasks
    'album_cover': [
      {
        icon: '🎨',
        label: 'DreamEdit öffnen',
        url: 'https://dreamedit.runitfast.xyz/',
        color: '#f59e0b'
      },
      {
        icon: '🖼️',
        label: 'Artify öffnen',
        url: 'https://artify.unlock-your-song.de/',
        color: '#ec4899'
      },
      {
        icon: '📋',
        label: 'Album Cover Prompt',
        action: () => copyToClipboard(generateAlbumCoverPrompt(project)),
        color: '#3b82f6'
      }
    ],

      'tracks_generated': [
        {
          icon: '🎵',
          label: 'Suno öffnen',
          url: 'https://app.suno.ai/create',
          color: '#8b5cf6'
        }
      ],

        // Kinderbuch Tasks
        'story_written': [
          {
            icon: '✍️',
            label: 'Claude öffnen',
            url: 'https://claude.ai',
            color: '#8b5cf6'
          },
          {
            icon: '📖',
            label: 'Visual Story öffnen',
            url: 'https://visual-story.unlock-your-song.de/',
            color: '#10b981'
          },
          {
            icon: '📋',
            label: 'Story Prompt',
            action: () => copyToClipboard(generateStoryPrompt(project)),
            color: '#3b82f6'
          }
        ],

          'illustrations': [
            {
              icon: '🎨',
              label: 'DreamEdit öffnen',
              url: 'https://dreamedit.runitfast.xyz/',
              color: '#f59e0b'
            },
            {
              icon: '🖼️',
              label: 'Artify öffnen',
              url: 'https://artify.unlock-your-song.de/',
              color: '#ec4899'
            }
          ],

            'audio_record': [
              {
                icon: '🎙️',
                label: 'ElevenLabs öffnen',
                url: 'https://elevenlabs.io',
                color: '#6366f1'
              }
            ]
};

return links[task.id] || [];
  };

const links = getToolLinks();

if (links.length === 0) return null;

return (
  <div className="tool-link-buttons">
    <div className="tool-links-header">
      <span className="tools-icon">🔧</span>
      <span className="tools-label">Quick Actions</span>
    </div>

    <div className="tool-links-grid">
      {links.map((link, index) => (
        <button
          key={index}
          className="tool-link-btn"
          style={{ '--btn-color': link.color }}
          onClick={() => {
            if (link.action) {
              link.action();
            } else if (link.url) {
              window.open(link.url, '_blank', 'noopener,noreferrer');
            }
          }}
        >
          <span className="btn-icon">{link.icon}</span>
          <span className="btn-label">{link.label}</span>
        </button>
      ))}
    </div>

    {copied && (
      <div className="copy-notification">
        ✓ In Zwischenablage kopiert!
      </div>
    )}
  </div>
);
}

// ============================================================================
// PROMPT GENERATORS
// ============================================================================

function generateSunoPrompt(project) {
  const meta = project.metadata || {};
  const genre = meta.genre || 'Pop';
  const theme = meta.theme || meta.songName || 'music';
  const mood = meta.mood || 'energetic';
  const artist = meta.artistName || 'Artist';

  return `[${genre}]
${meta.songName || 'Song Title'}
About: ${theme}
Style: ${mood}, modern ${genre}
Artist: ${artist}

Erstellt mit Media Project Manager`;
}

function generateCoverPrompt(project) {
  const meta = project.metadata || {};
  const name = meta.songName || meta.albumTitle || project.name;
  const genre = meta.genre || 'Pop';
  const theme = meta.theme || 'modern';
  const style = meta.coverStyle || 'minimalist, professional';

  return `Album/Song Cover für "${name}"
Genre: ${genre}
Theme: ${theme}
Style: ${style}
Format: Square (3000x3000px)
High quality, professional music cover art
Modern design, eye-catching`;
}

function generateAlbumCoverPrompt(project) {
  const meta = project.metadata || {};
  const albumTitle = meta.albumTitle || project.name;
  const artist = meta.artistName || 'Artist';
  const genre = meta.genre || 'Pop';
  const trackCount = meta.trackCount || 10;

  return `Album Cover for "${albumTitle}"
Artist: ${artist}
Genre: ${genre}
Tracks: ${trackCount}
Style: Professional, modern album artwork
Format: 3000x3000px
High-end music production quality`;
}

function generateStoryPrompt(project) {
  const meta = project.metadata || {};
  const childName = meta.childName || '[Kindername]';
  const theme = meta.theme || 'Abenteuer';
  const ageGroup = meta.ageGroup || '4-8 Jahre';

  return `Kinderbuch-Geschichte schreiben:

Protagonist: ${childName}
Thema: ${theme}
Altersgruppe: ${ageGroup}
Charaktere: Professor Steini, Quantus (Roboter), Don Quai (Esel)

Anforderungen:
- Lehrreich und unterhaltsam
- Altersgerecht
- Positive Werte
- 8-12 Seiten
- Mit Illustrationshinweisen`;
}

function generateYouTubeDescription(project) {
  const meta = project.metadata || {};
  const name = meta.songName || project.name;
  const artist = meta.artistName || 'Artist';
  const genre = meta.genre || '';

  return `${name} - ${artist}

${meta.description || 'Neuer Song verfügbar!'}

${genre ? `🎵 Genre: ${genre}` : ''}
🎧 Jetzt streamen!

#${artist.replace(/\s+/g, '')} #${name.replace(/\s+/g, '')} #music ${genre ? `#${genre}` : ''}

---
Produziert mit ❤️`;
}

export default ToolLinkButtons;
