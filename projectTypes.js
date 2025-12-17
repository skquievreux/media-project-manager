/**
 * Project Types Configuration
 * Defines available project types with metadata, fields, and workflows
 * 
 * Built by Claude for Don Key (Steffen Quievreux)
 */

export const PROJECT_TYPES = {
  SINGLE_SONG: {
    id: 'SINGLE_SONG',
    icon: '🎵',
    label: 'Einzelsong',
    color: '#3b82f6',
    description: 'Einzelner Song mit Cover, Video und Landing Page',
    baseType: 'audio',
    estimatedTime: 54, // minutes
    
    // Form fields for project creation
    fields: [
      {
        id: 'songName',
        label: 'Songname',
        type: 'text',
        required: true,
        placeholder: 'z.B. Weltraum Abenteuer'
      },
      {
        id: 'artistName',
        label: 'Artist',
        type: 'text',
        required: true,
        placeholder: 'z.B. Max Mustermann'
      },
      {
        id: 'customerName',
        label: 'Kundenname',
        type: 'text',
        placeholder: 'Optional'
      },
      {
        id: 'theme',
        label: 'Thema',
        type: 'text',
        placeholder: 'z.B. Weltraum, Piraten'
      },
      {
        id: 'genre',
        label: 'Genre',
        type: 'select',
        options: ['Hip-Hop', 'Pop', 'Rock', 'Electronic', 'Jazz', 'Classical', 'Other']
      },
      {
        id: 'releaseDate',
        label: 'Release Datum',
        type: 'date'
      }
    ],
    
    // Workflow steps
    workflow: [
      {
        id: 'song_generated',
        label: 'Song generiert (Suno)',
        icon: '🎵',
        estimatedTime: 5,
        type: 'manual'
      },
      {
        id: 'cover_created',
        label: 'Cover erstellt (DreamEdit)',
        icon: '🎨',
        estimatedTime: 10,
        type: 'manual'
      },
      {
        id: 'video_rendered',
        label: 'Video gerendert',
        icon: '🎬',
        estimatedTime: 15,
        type: 'manual'
      },
      {
        id: 'landing_page',
        label: 'Landing Page live',
        icon: '🌐',
        estimatedTime: 2,
        type: 'automated'
      },
      {
        id: 'youtube_uploaded',
        label: 'YouTube Upload',
        icon: '📹',
        estimatedTime: 5,
        type: 'waiting'
      },
      {
        id: 'social_posted',
        label: 'Social Media Posts',
        icon: '📱',
        estimatedTime: 10,
        type: 'manual'
      }
    ],
    
    defaultFolder: 'C:\\Downloads\\{artistName}_{songName}\\',
    assets: ['song_mp3', 'song_wav', 'cover_png', 'video_mp4']
  },
  
  ALBUM: {
    id: 'ALBUM',
    icon: '💿',
    label: 'Album',
    color: '#8b5cf6',
    description: 'Album mit mehreren Tracks und Distribution',
    baseType: 'audio',
    estimatedTime: 720, // 12 hours
    
    fields: [
      {
        id: 'albumTitle',
        label: 'Album Titel',
        type: 'text',
        required: true,
        placeholder: 'z.B. Greatest Hits 2025'
      },
      {
        id: 'artistName',
        label: 'Artist',
        type: 'text',
        required: true,
        placeholder: 'z.B. DJ Awesome'
      },
      {
        id: 'trackCount',
        label: 'Anzahl Tracks',
        type: 'number',
        default: 22,
        min: 1,
        max: 50
      },
      {
        id: 'genre',
        label: 'Genre',
        type: 'select',
        options: ['Hip-Hop', 'Pop', 'Rock', 'Electronic', 'Jazz', 'Classical', 'Mixed']
      },
      {
        id: 'releaseDate',
        label: 'Release Datum',
        type: 'date'
      }
    ],
    
    workflow: [
      {
        id: 'concept',
        label: 'Album-Konzept',
        icon: '💡',
        estimatedTime: 30,
        type: 'manual'
      },
      {
        id: 'tracks_generated',
        label: 'Alle Tracks generiert',
        icon: '🎵',
        estimatedTime: 450,
        type: 'manual',
        subtasks: 22
      },
      {
        id: 'album_cover',
        label: 'Album-Cover',
        icon: '🎨',
        estimatedTime: 20,
        type: 'manual'
      },
      {
        id: 'distrokid_upload',
        label: 'DistroKid Upload',
        icon: '💿',
        estimatedTime: 30,
        type: 'manual'
      },
      {
        id: 'promotion',
        label: 'Promotion',
        icon: '📢',
        estimatedTime: 60,
        type: 'manual'
      }
    ],
    
    defaultFolder: 'C:\\Downloads\\Album_{albumTitle}\\',
    assets: ['album_cover', 'tracklist_csv', 'promo_video']
  },
  
  KINDERBUCH: {
    id: 'KINDERBUCH',
    icon: '📚',
    label: 'Kinderbuch (Wunderwerkstatt)',
    color: '#f59e0b',
    description: 'Personalisiertes Kinderbuch mit Professor Steini, Quantus und Don Quai',
    baseType: 'document',
    estimatedTime: 300, // 5 hours
    
    fields: [
      {
        id: 'bookTitle',
        label: 'Buchtitel',
        type: 'text',
        required: true,
        placeholder: 'z.B. Die Abenteuer von Professor Steini'
      },
      {
        id: 'childName',
        label: 'Name des Kindes',
        type: 'text',
        required: true,
        placeholder: 'z.B. Emma'
      },
      {
        id: 'ageGroup',
        label: 'Altersgruppe',
        type: 'select',
        options: ['3-5 Jahre', '6-8 Jahre', '9-12 Jahre']
      },
      {
        id: 'characters',
        label: 'Charaktere',
        type: 'text',
        placeholder: 'Professor Steini, Quantus, Don Quai',
        default: 'Professor Steini, Quantus, Don Quai'
      },
      {
        id: 'theme',
        label: 'Thema',
        type: 'text',
        placeholder: 'z.B. Weltraum, Wissenschaft'
      },
      {
        id: 'pageCount',
        label: 'Seitenanzahl',
        type: 'number',
        default: 24,
        min: 12,
        max: 48
      }
    ],
    
    workflow: [
      {
        id: 'story_concept',
        label: 'Geschichte-Konzept',
        icon: '📝',
        estimatedTime: 30,
        type: 'manual'
      },
      {
        id: 'story_write',
        label: 'Geschichte schreiben',
        icon: '✍️',
        estimatedTime: 60,
        type: 'manual'
      },
      {
        id: 'illustrations',
        label: 'Illustrationen',
        icon: '🎨',
        estimatedTime: 120,
        type: 'manual',
        subtasks: 24
      },
      {
        id: 'layout',
        label: 'Layout',
        icon: '📐',
        estimatedTime: 45,
        type: 'manual'
      },
      {
        id: 'audio_record',
        label: 'Hörbuch',
        icon: '🎙️',
        estimatedTime: 30,
        type: 'manual'
      },
      {
        id: 'print_prepare',
        label: 'Druckdatei',
        icon: '🖨️',
        estimatedTime: 20,
        type: 'manual'
      }
    ],
    
    defaultFolder: 'C:\\Downloads\\Kinderbuch_{bookTitle}\\',
    assets: ['story_pdf', 'illustrations', 'audiobook_mp3', 'print_pdf'],
    characters: ['Professor Steini', 'Quantus', 'Don Quai']
  },
  
  VIDEO: {
    id: 'VIDEO',
    icon: '🎬',
    label: 'Video Content',
    color: '#ef4444',
    description: 'Video-Projekt für YouTube, TikTok, Instagram',
    baseType: 'video',
    estimatedTime: 240, // 4 hours
    
    fields: [
      {
        id: 'videoTitle',
        label: 'Video Titel',
        type: 'text',
        required: true,
        placeholder: 'z.B. Tutorial: Next.js Basics'
      },
      {
        id: 'platform',
        label: 'Plattform',
        type: 'select',
        options: ['YouTube', 'TikTok', 'Instagram Reels', 'YouTube Shorts']
      },
      {
        id: 'category',
        label: 'Kategorie',
        type: 'select',
        options: ['Tutorial', 'Vlog', 'Review', 'Entertainment', 'Education']
      },
      {
        id: 'duration',
        label: 'Geplante Dauer',
        type: 'text',
        placeholder: 'z.B. 10:30'
      },
      {
        id: 'publishDate',
        label: 'Veröffentlichungsdatum',
        type: 'date'
      }
    ],
    
    workflow: [
      {
        id: 'script_written',
        label: 'Skript geschrieben',
        icon: '📝',
        estimatedTime: 20,
        type: 'manual'
      },
      {
        id: 'footage_recorded',
        label: 'Aufnahmen',
        icon: '🎥',
        estimatedTime: 60,
        type: 'manual'
      },
      {
        id: 'video_edited',
        label: 'Video bearbeitet',
        icon: '✂️',
        estimatedTime: 120,
        type: 'manual'
      },
      {
        id: 'thumbnail_created',
        label: 'Thumbnail',
        icon: '🖼️',
        estimatedTime: 10,
        type: 'manual'
      },
      {
        id: 'uploaded',
        label: 'Hochgeladen',
        icon: '📤',
        estimatedTime: 5,
        type: 'waiting'
      },
      {
        id: 'promoted',
        label: 'Beworben',
        icon: '📢',
        estimatedTime: 15,
        type: 'manual'
      }
    ],
    
    defaultFolder: 'C:\\Downloads\\Video_{videoTitle}\\',
    assets: ['raw_footage', 'edited_video', 'thumbnail', 'description']
  }
};

// Helper functions
export const getProjectType = (typeId) => PROJECT_TYPES[typeId] || null;

export const getAllProjectTypes = () => Object.values(PROJECT_TYPES);

export const getProjectTypesByBaseType = (baseType) => {
  return Object.values(PROJECT_TYPES).filter(pt => pt.baseType === baseType);
};

export const calculateTotalTime = (workflow) => {
  return workflow.reduce((total, step) => total + step.estimatedTime, 0);
};
