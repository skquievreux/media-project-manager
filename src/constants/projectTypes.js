/**
 * Project Types Configuration
 * Defines all available project types with their metadata
 *
 * Built by Claude for Don Key
 */

export const PROJECT_TYPES = {
  // Single Song Project
  single: {
    label: 'Single Song',
    icon: '🎵',
    color: '#8b5cf6',
    defaultTasks: [
      {
        id: 'song_generated',
        label: 'Song in Suno generieren',
        estimatedTime: 30,
        status: 'pending',
        icon: '🎵',
        type: 'manual',
        dependencies: []
      },
      {
        id: 'cover_created',
        label: 'Cover-Artwork erstellen',
        estimatedTime: 20,
        status: 'pending',
        icon: '🎨',
        type: 'manual',
        dependencies: []
      },
      {
        id: 'video_rendered',
        label: 'Video rendern (Canva)',
        estimatedTime: 45,
        status: 'pending',
        icon: '🎬',
        type: 'manual',
        dependencies: ['song_generated', 'cover_created']
      },
      {
        id: 'landing_page',
        label: 'Landing Page erstellen',
        estimatedTime: 15,
        status: 'pending',
        icon: '🌐',
        type: 'automated',
        dependencies: []
      },
      {
        id: 'youtube_upload',
        label: 'YouTube hochladen',
        estimatedTime: 20,
        status: 'pending',
        icon: '📺',
        type: 'manual',
        dependencies: ['video_rendered', 'landing_page']
      },
      {
        id: 'distrokid_upload',
        label: 'DistroKid Upload',
        estimatedTime: 25,
        status: 'pending',
        icon: '💿',
        type: 'manual',
        dependencies: ['song_generated', 'cover_created']
      },
      {
        id: 'social_promotion',
        label: 'Social Media Promotion',
        estimatedTime: 30,
        status: 'pending',
        icon: '📱',
        type: 'manual',
        dependencies: ['youtube_upload']
      }
    ]
  },

  // Album Project
  album: {
    label: 'Album',
    icon: '💿',
    color: '#f59e0b',
    defaultTasks: [
      {
        id: 'album_concept',
        label: 'Album-Konzept entwickeln',
        estimatedTime: 60,
        status: 'pending',
        icon: '📝',
        type: 'manual',
        dependencies: []
      },
      {
        id: 'album_cover',
        label: 'Album Cover Design',
        estimatedTime: 45,
        status: 'pending',
        icon: '🎨',
        type: 'manual',
        dependencies: []
      },
      {
        id: 'tracks_generated',
        label: 'Tracks generieren (10 Songs)',
        estimatedTime: 180,
        status: 'pending',
        icon: '🎵',
        type: 'manual',
        dependencies: ['album_concept']
      },
      {
        id: 'videos_created',
        label: 'Videos für alle Tracks',
        estimatedTime: 240,
        status: 'pending',
        icon: '🎬',
        type: 'manual',
        dependencies: ['tracks_generated', 'album_cover']
      },
      {
        id: 'album_distrokid',
        label: 'Album zu DistroKid',
        estimatedTime: 60,
        status: 'pending',
        icon: '💿',
        type: 'manual',
        dependencies: ['tracks_generated', 'album_cover']
      },
      {
        id: 'youtube_playlist',
        label: 'YouTube Playlist erstellen',
        estimatedTime: 45,
        status: 'pending',
        icon: '📺',
        type: 'manual',
        dependencies: ['videos_created']
      }
    ]
  },

  // Kinderbuch Project
  kinderbuch: {
    label: 'Kinderbuch',
    icon: '📚',
    color: '#10b981',
    defaultTasks: [
      {
        id: 'story_written',
        label: 'Geschichte schreiben (mit Claude)',
        estimatedTime: 90,
        status: 'pending',
        icon: '✍️',
        type: 'manual',
        dependencies: []
      },
      {
        id: 'illustrations',
        label: 'Illustrationen erstellen',
        estimatedTime: 240,
        status: 'pending',
        icon: '🎨',
        type: 'manual',
        dependencies: ['story_written']
      },
      {
        id: 'audio_record',
        label: 'Hörbuch aufnehmen',
        estimatedTime: 120,
        status: 'pending',
        icon: '🎙️',
        type: 'manual',
        dependencies: ['story_written']
      },
      {
        id: 'book_layout',
        label: 'Buch-Layout (KDP)',
        estimatedTime: 60,
        status: 'pending',
        icon: '📖',
        type: 'manual',
        dependencies: ['illustrations']
      },
      {
        id: 'kdp_upload',
        label: 'KDP Upload',
        estimatedTime: 30,
        status: 'pending',
        icon: '📤',
        type: 'manual',
        dependencies: ['book_layout']
      },
      {
        id: 'audible_upload',
        label: 'Audible Upload',
        estimatedTime: 30,
        status: 'pending',
        icon: '🎧',
        type: 'manual',
        dependencies: ['audio_record']
      }
    ]
  },

  // Commercial/Werbespot Project
  commercial: {
    label: 'Werbespot',
    icon: '📢',
    color: '#ef4444',
    defaultTasks: [
      {
        id: 'concept_briefing',
        label: 'Konzept & Briefing',
        estimatedTime: 45,
        status: 'pending',
        icon: '📋',
        type: 'manual',
        dependencies: []
      },
      {
        id: 'script_writing',
        label: 'Drehbuch schreiben',
        estimatedTime: 60,
        status: 'pending',
        icon: '📝',
        type: 'manual',
        dependencies: ['concept_briefing']
      },
      {
        id: 'storyboard',
        label: 'Storyboard erstellen',
        estimatedTime: 90,
        status: 'pending',
        icon: '🎬',
        type: 'manual',
        dependencies: ['script_writing']
      },
      {
        id: 'video_production',
        label: 'Video-Produktion',
        estimatedTime: 180,
        status: 'pending',
        icon: '🎥',
        type: 'manual',
        dependencies: ['storyboard']
      },
      {
        id: 'audio_production',
        label: 'Audio-Produktion (Voice-over/Music)',
        estimatedTime: 120,
        status: 'pending',
        icon: '🎵',
        type: 'manual',
        dependencies: ['script_writing']
      },
      {
        id: 'final_edit',
        label: 'Finaler Schnitt',
        estimatedTime: 90,
        status: 'pending',
        icon: '✂️',
        type: 'manual',
        dependencies: ['video_production', 'audio_production']
      },
      {
        id: 'client_review',
        label: 'Kunden-Review',
        estimatedTime: 30,
        status: 'pending',
        icon: '👀',
        type: 'review',
        dependencies: ['final_edit']
      },
      {
        id: 'delivery',
        label: 'Auslieferung',
        estimatedTime: 15,
        status: 'pending',
        icon: '📦',
        type: 'manual',
        dependencies: ['client_review']
      }
    ]
  },

  // YouTube Video Project
  video: {
    label: 'Video Projekt',
    icon: '🎬',
    color: '#3b82f6',
    defaultTasks: [
      {
        id: 'video_concept',
        label: 'Video-Konzept',
        estimatedTime: 30,
        status: 'pending',
        icon: '💡',
        type: 'manual',
        dependencies: []
      },
      {
        id: 'thumbnail_created',
        label: 'Thumbnail erstellen',
        estimatedTime: 20,
        status: 'pending',
        icon: '🖼️',
        type: 'manual',
        dependencies: []
      },
      {
        id: 'video_editing',
        label: 'Video schneiden',
        estimatedTime: 120,
        status: 'pending',
        icon: '✂️',
        type: 'manual',
        dependencies: ['video_concept']
      },
      {
        id: 'upload_youtube',
        label: 'Upload zu YouTube',
        estimatedTime: 25,
        status: 'pending',
        icon: '📺',
        type: 'manual',
        dependencies: ['video_editing', 'thumbnail_created']
      }
    ]
  },

  // Podcast Project
  audio: {
    label: 'Audio/Podcast',
    icon: '🎙️',
    color: '#06b6d4',
    defaultTasks: [
      {
        id: 'episode_planning',
        label: 'Episode planen',
        estimatedTime: 30,
        status: 'pending',
        icon: '📋',
        type: 'manual',
        dependencies: []
      },
      {
        id: 'recording',
        label: 'Aufnahme',
        estimatedTime: 90,
        status: 'pending',
        icon: '🎙️',
        type: 'manual',
        dependencies: ['episode_planning']
      },
      {
        id: 'audio_editing',
        label: 'Audio bearbeiten',
        estimatedTime: 60,
        status: 'pending',
        icon: '🎚️',
        type: 'manual',
        dependencies: ['recording']
      },
      {
        id: 'show_notes',
        label: 'Show Notes schreiben',
        estimatedTime: 20,
        status: 'pending',
        icon: '📝',
        type: 'manual',
        dependencies: []
      },
      {
        id: 'podcast_upload',
        label: 'Upload zu Plattformen',
        estimatedTime: 30,
        status: 'pending',
        icon: '📤',
        type: 'manual',
        dependencies: ['audio_editing', 'show_notes']
      }
    ]
  },

  // Photo Shooting
  image: {
    label: 'Foto-Projekt',
    icon: '📸',
    color: '#ec4899',
    defaultTasks: [
      {
        id: 'shoot_planning',
        label: 'Shooting planen',
        estimatedTime: 45,
        status: 'pending',
        icon: '📋',
        type: 'manual',
        dependencies: []
      },
      {
        id: 'photo_shoot',
        label: 'Fotoshooting',
        estimatedTime: 180,
        status: 'pending',
        icon: '📸',
        type: 'manual',
        dependencies: ['shoot_planning']
      },
      {
        id: 'photo_selection',
        label: 'Foto-Auswahl',
        estimatedTime: 60,
        status: 'pending',
        icon: '🖼️',
        type: 'manual',
        dependencies: ['photo_shoot']
      },
      {
        id: 'retouching',
        label: 'Retusche',
        estimatedTime: 120,
        status: 'pending',
        icon: '✨',
        type: 'manual',
        dependencies: ['photo_selection']
      },
      {
        id: 'delivery_photos',
        label: 'Auslieferung',
        estimatedTime: 20,
        status: 'pending',
        icon: '📦',
        type: 'manual',
        dependencies: ['retouching']
      }
    ]
  },

  // Generic/Other
  document: {
    label: 'Dokument/Sonstiges',
    icon: '📄',
    color: '#64748b',
    defaultTasks: [
      {
        id: 'project_start',
        label: 'Projekt starten',
        estimatedTime: 15,
        status: 'pending',
        icon: '🚀',
        type: 'manual',
        dependencies: []
      },
      {
        id: 'work_in_progress',
        label: 'Arbeit durchführen',
        estimatedTime: 60,
        status: 'pending',
        icon: '⚙️',
        type: 'manual',
        dependencies: ['project_start']
      },
      {
        id: 'review_qa',
        label: 'Review & QA',
        estimatedTime: 30,
        status: 'pending',
        icon: '✅',
        type: 'review',
        dependencies: ['work_in_progress']
      },
      {
        id: 'project_delivery',
        label: 'Abschluss & Auslieferung',
        estimatedTime: 15,
        status: 'pending',
        icon: '📦',
        type: 'manual',
        dependencies: ['review_qa']
      }
    ]
  }
};

/**
 * Get project type configuration
 */
export function getProjectType(typeKey) {
  return PROJECT_TYPES[typeKey] || PROJECT_TYPES.document;
}

/**
 * Get default tasks for a project type
 */
export function getDefaultTasks(typeKey) {
  const projectType = getProjectType(typeKey);
  return projectType.defaultTasks.map(task => ({
    ...task,
    id: `${task.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }));
}

/**
 * Get all project type keys
 */
export function getAllProjectTypes() {
  return Object.keys(PROJECT_TYPES);
}
