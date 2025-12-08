import { useState } from 'react';
import './SmartPrompts.css';

/**
 * SmartPrompts Component
 * AI-powered prompt generator for various tools
 * 
 * Features:
 * - Generate optimized prompts for Suno, DreamEdit, etc.
 * - Template system with customization
 * - One-click copy to clipboard
 * - History of generated prompts
 * 
 * Built by Claude for Don Key
 */
function SmartPrompts({ project, type = 'suno' }) {
  const [prompt, setPrompt] = useState('');
  const [customizing, setCustomizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  // Generate prompt based on type
  const generatePrompt = () => {
    let generated = '';

    switch (type) {
      case 'suno':
        generated = generateSunoPrompt(project);
        break;
      case 'cover':
        generated = generateCoverPrompt(project);
        break;
      case 'video':
        generated = generateVideoPrompt(project);
        break;
      case 'story':
        generated = generateStoryPrompt(project);
        break;
      case 'youtube':
        generated = generateYouTubeDescription(project);
        break;
      case 'social':
        generated = generateSocialMediaPost(project);
        break;
      default:
        generated = 'Unknown prompt type';
    }

    setPrompt(generated);
    addToHistory(generated);
  };

  // Add to history
  const addToHistory = (text) => {
    const newEntry = {
      id: Date.now(),
      text,
      type,
      timestamp: Date.now()
    };
    setHistory(prev => [newEntry, ...prev].slice(0, 5));
  };

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
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

  // Get prompt template info
  const getPromptInfo = () => {
    const info = {
      suno: {
        icon: '🎵',
        title: 'Suno Music Prompt',
        description: 'Optimiert für Musik-Generierung'
      },
      cover: {
        icon: '🎨',
        title: 'Cover Art Prompt',
        description: 'Optimiert für DreamEdit/DALL-E'
      },
      video: {
        icon: '🎬',
        title: 'Video Description',
        description: 'Für Video-Projekte'
      },
      story: {
        icon: '📖',
        title: 'Kinderbuch Story',
        description: 'Mit Charakteren & Moral'
      },
      youtube: {
        icon: '📺',
        title: 'YouTube Description',
        description: 'SEO-optimiert'
      },
      social: {
        icon: '📱',
        title: 'Social Media Post',
        description: 'Instagram, Facebook, etc.'
      }
    };
    return info[type] || info.suno;
  };

  const info = getPromptInfo();

  return (
    <div className="smart-prompts">
      {/* Header */}
      <div className="prompts-header">
        <div className="header-left">
          <span className="prompt-icon">{info.icon}</span>
          <div className="header-text">
            <h4>{info.title}</h4>
            <p>{info.description}</p>
          </div>
        </div>
        <button 
          className="btn-generate"
          onClick={generatePrompt}
        >
          ✨ Generieren
        </button>
      </div>

      {/* Prompt Display */}
      {prompt && (
        <div className="prompt-display">
          {!customizing ? (
            <div className="prompt-preview">
              <pre>{prompt}</pre>
            </div>
          ) : (
            <textarea
              className="prompt-editor"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={10}
            />
          )}

          <div className="prompt-actions">
            <button
              className="btn-copy"
              onClick={() => copyToClipboard(prompt)}
            >
              {copied ? '✓ Kopiert!' : '📋 Kopieren'}
            </button>
            <button
              className="btn-edit"
              onClick={() => setCustomizing(!customizing)}
            >
              {customizing ? '✓ Fertig' : '✏️ Bearbeiten'}
            </button>
            <button
              className="btn-regenerate"
              onClick={generatePrompt}
            >
              🔄 Neu
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="prompt-history">
          <h5>📚 Letzte Prompts</h5>
          <div className="history-list">
            {history.map(entry => (
              <div 
                key={entry.id}
                className="history-item"
                onClick={() => {
                  setPrompt(entry.text);
                  setCustomizing(false);
                }}
              >
                <div className="history-preview">
                  {entry.text.substring(0, 60)}...
                </div>
                <button
                  className="history-copy"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(entry.text);
                  }}
                >
                  📋
                </button>
              </div>
            ))}
          </div>
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
  const songName = meta.songName || project.name;
  const theme = meta.theme || 'life';
  const mood = meta.mood || 'energetic';
  const tempo = meta.tempo || 'medium';
  const artist = meta.artistName || 'Artist';

  return `[${genre}]
${songName}

Theme: ${theme}
Mood: ${mood}, ${tempo} tempo
Style: Modern ${genre}, radio-ready
Energy: High
Production: Professional, polished

Artist: ${artist}

🎵 Generated with Media Project Manager`;
}

function generateCoverPrompt(project) {
  const meta = project.metadata || {};
  const name = meta.songName || meta.albumTitle || project.name;
  const genre = meta.genre || 'Pop';
  const artist = meta.artistName || 'Artist';
  const style = meta.coverStyle || 'minimalist, modern, professional';
  const colors = meta.coverColors || 'vibrant, eye-catching';

  return `Professional music cover art for "${name}" by ${artist}

Genre: ${genre}
Style: ${style}
Color palette: ${colors}
Format: Square, 3000x3000px
Quality: High-resolution, print-ready

Design elements:
- Clean, modern typography
- ${genre}-appropriate imagery
- Professional music industry standard
- Eye-catching and memorable
- Suitable for streaming platforms

No text overlay needed (will be added separately)`;
}

function generateVideoPrompt(project) {
  const meta = project.metadata || {};
  const name = meta.songName || meta.videoTitle || project.name;
  const duration = meta.duration || '3-5 minutes';
  const style = meta.videoStyle || 'dynamic, engaging';

  return `Video Concept for "${name}"

Duration: ${duration}
Style: ${style}

Visual Elements:
- Opening hook (0-5 seconds)
- Dynamic transitions
- Text overlays with key messages
- Brand-consistent colors and fonts
- Call-to-action at end

Technical Specs:
- Format: 16:9 (1920x1080) or 9:16 (1080x1920)
- Frame rate: 30fps
- Export: MP4, H.264

Music: ${meta.songName || 'Background track'}`;
}

function generateStoryPrompt(project) {
  const meta = project.metadata || {};
  const childName = meta.childName || '[Kindername]';
  const theme = meta.theme || 'Abenteuer';
  const ageGroup = meta.ageGroup || '4-8 Jahre';
  const length = meta.storyLength || '10-12 Seiten';

  return `Kinderbuch-Geschichte: "${project.name}"

Protagonist: ${childName}
Thema: ${theme}
Altersgruppe: ${ageGroup}
Länge: ${length}

Charaktere:
- Professor Steini (verrückter Wissenschaftler, lustig)
- Quantus (Roboter-Assistent, manchmal tollpatschig)
- Don Quai (weiser Esel mit großer Klappe)

Story-Anforderungen:
✓ Lehrreich und unterhaltsam
✓ Altersgerecht und verständlich
✓ Positive Werte vermitteln
✓ Spannender Handlungsbogen
✓ Humorvolle Elemente
✓ Happy End

Struktur:
1. Einleitung (Seiten 1-2)
2. Problem/Konflikt (Seiten 3-4)
3. Abenteuer (Seiten 5-8)
4. Lösung (Seiten 9-10)
5. Moral/Abschluss (Seiten 11-12)

Bitte für jede Seite:
- Text (50-80 Wörter)
- Illustrations-Hinweis
- Charaktere in der Szene`;
}

function generateYouTubeDescription(project) {
  const meta = project.metadata || {};
  const name = meta.songName || project.name;
  const artist = meta.artistName || 'Artist';
  const genre = meta.genre || '';
  const description = meta.description || 'Neuer Song jetzt verfügbar!';

  const hashtags = [
    artist.replace(/\s+/g, ''),
    name.replace(/\s+/g, ''),
    genre,
    'music',
    'newsong'
  ].filter(Boolean).map(t => `#${t}`).join(' ');

  return `${name} - ${artist}

${description}

${genre ? `🎵 Genre: ${genre}\n` : ''}🎧 Jetzt streamen auf allen Plattformen!
💿 Mehr Musik: [Dein Link]

---

${hashtags}

Produziert mit ❤️ 
© ${new Date().getFullYear()} ${artist}`;
}

function generateSocialMediaPost(project) {
  const meta = project.metadata || {};
  const name = meta.songName || project.name;
  const artist = meta.artistName || 'Artist';

  const emojis = ['🎵', '🔥', '✨', '🎧', '💫', '🎶'];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  return `${randomEmoji} NEW MUSIC ALERT ${randomEmoji}

"${name}" ist jetzt draußen!

Hört es euch an und lasst mich wissen, was ihr denkt! ${randomEmoji}

Link in Bio 🔗

#${artist.replace(/\s+/g, '')} #${name.replace(/\s+/g, '')} #newmusic #music`;
}

export default SmartPrompts;
